const storyElement = document.getElementById('story');
const option1Element = document.getElementById('option1');
const option2Element = document.getElementById('option2');
const continueElement = document.getElementById('continue');
let databaseFullStory = '';

// Import GoogleGenerativeAI module
import { GoogleGenerativeAI } from 'https://esm.run/@google/generative-ai';

// Function to fetch the contents of a file
async function getFileContents(filename) {
  const response = await fetch(filename);
  const text = await response.text();
  return text;
}

// Initialize GoogleGenerativeAI object with your API key
async function initializeGenerativeAI() {
  // Fetch API key from api_key.txt
  const key = await getFileContents('api_key.txt');
  const API_KEY = key.trim(); // Remove leading/trailing whitespace

  // Return the initialized GoogleGenerativeAI object
  return new GoogleGenerativeAI(API_KEY);
}

let responseNum = 10;

// Function to generate text and update HTML content
async function run() {
  // Initialize GoogleGenerativeAI object with the API key
  const genAI = await initializeGenerativeAI();

  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  // Construct the prompt by concatenating outputText with additional prompt text
  const character = sessionStorage.getItem('character');
  const weapon = sessionStorage.getItem('weapon');
  const sidekick = sessionStorage.getItem('sidekick');
  const location = sessionStorage.getItem('location');
  console.log(character);
  console.log(weapon);
  console.log(sidekick);
  console.log(location);
  console.log(sessionStorage.getItem('databaseLocation'));
  console.log(sessionStorage.getItem('databaseSidekick'));

  let finish = '';
  if (responseNum == 3) {
    finish =
      'story will need to finish in 3 more decisions, begin to wrap up story lines';
  } else if (responseNum == 2) {
    finish =
      'story will need to finish in 2 more decisions, begin to tell the story of how the characters ended up';
  } else if (responseNum == 1) {
    finish =
      'the story should conclude now, give the user a final decision to make to determine their future';
  } else if (responseNum < 1) {
    finish =
      'the story must end now, wrap it up nicely as soon as possible in 5 sentances or less, and stop giving options';
  } else {
    finish = '';
  }

  let fullStory = sessionStorage.getItem('fullStory');

  let prompt = `We are going to play a game. You are going to create a choose your own adventure game for me. There are ${responseNum} prompts remaining. Plan the story accordingly. It should be humorous and should follow these guidelines exactly. 

  I am going to give you our conversation history back everytime, including these instructions. Each time, I want  very short piece of the story, and two numbered options each on their own line to choose from.
  
  Be sure to include everthing here. The location is ${location}. The main character is ${character} give the character a ${character} kind of name. the main character's weapon is ${weapon}, which he should use at least one time during the story, even just for humor. The main character's trusty sidekick is ${sidekick}. The nineth response should being to wrap up the story, and the tenth response should be the conclusion.
  
  only give me one step at a time, and two choices for that step. I will then reply to you, and you can create the next part of the story
  Always label option 1 as "1. <option text>" and option 2 as "2. <option text> do not number the story text"
  
  very important: ONLY PROVIDE THE GAME TEXT, NO OTHER INSTRUCTION TEXT - NO NUMBERS IN THE STORY PORTION, ONLY THE OPTIONS. OPTIONS MUST BE NUMBERED
  
  This is the story so far: ${fullStory}

    ${finish}

  Analyze the entire story and continue from this point being sure to stay within the same context as the previous steps. Make sure that the story is  progressing at a fast pace.


  `;

  console.log('prompt1: ', prompt);
  let result = await model.generateContent(prompt); // Specify max_tokens here
  let response = await result.response;
  let text = response.text();
  console.log(text);

  function saveItems(text) {
    const lines = text.split('\n'); // Split the text into lines and reverse the array
    let story = '';
    let option1 = '';
    let option2 = '';
    let optionsSaved = 0;

    for (let i = lines.length - 1; i >= 0; i--) {
      // Iterate through lines in reverse order
      const line = lines[i].trim();
      if (line.includes('1.') || line.includes('2.')) {
        const optionText = line.replace(/^\d+\.\s*/, ''); // Remove the initial number
        if (!option1) {
          option1 = optionText;
          optionsSaved++;
        } else if (!option2) {
          option2 = optionText;
          optionsSaved++;
        }
      } else {
        if (optionsSaved < 2) {
          story = line + '\n' + story; // Append the line to the story variable
        } else {
          story = line + ' ' + story; // Append the line to the story variable
        }
      }
    }

    story = story.trim(); // Remove leading and trailing whitespace
    if (option1.length > 10) {
      option1Element.classList.remove('noDisplay');
      option1Element.classList.add('yesDisplay');
      continueElement.classList.remove('yesDisplay');
      continueElement.classList.add('noDisplay');
    } else {
      option1Element.classList.remove('yesDisplay');
      option1Element.classList.add('noDisplay');
      continueElement.classList.add('noDisplay');
      continueElement.classList.add('yesDisplay');
    }
    if (option2.length > 10) {
      option2Element.classList.remove('noDisplay');
      option2Element.classList.add('yesDisplay');
      continueElement.classList.remove('yesDisplay');
      continueElement.classList.add('noDisplay');
    } else {
      option2Element.classList.remove('yesDisplay');
      option2Element.classList.add('noDisplay');
      continueElement.classList.add('noDisplay');
      continueElement.classList.add('yesDisplay');
    }
    databaseFullStory += '\n\n' + story;
    console.log('DATABASE FULL STORY: ', databaseFullStory);
    return { story, option1, option2 };
  }

  const { story, option1, option2 } = saveItems(text);
  console.log('Story:', story);
  console.log('Option 1:', option1);
  console.log('Option 2:', option2);

  storyElement.textContent = story;
  option1Element.textContent = option1;
  option2Element.textContent = option2;

  option1Element.style.color = 'white';
  option1Element.style.border = 'white solid 2px';
  option2Element.style.color = 'white';
  option2Element.style.border = 'white solid 2px';
  continueElement.style.color = 'white';
  continueElement.style.border = 'white solid 2px';
  if (responseNum < 1 && option1.length < 10 && option2.length < 10) {
    continueElement.textContent = 'The End';
    continueElement.style.border = 'none';
    continueElement.style.fontFamily = "'Great Vibes', cursive";
    continueElement.style.fontSize = '2em';
    continueElement.style.padding = '0';
    console.log('SAVING TO DATABASE');
    insertStoryEntry();
  }
}

// Call the run function to start text generation
run().catch(handleError);

// Add an event listener to the submit button
document.getElementById('option1').addEventListener('click', function () {
  run().catch(handleError);
  responseNum -= 1;
  console.log(responseNum);
  databaseFullStory += '\n\n   - ' + option1Element.textContent;
});

// Add an event listener to the submit button
document.getElementById('option2').addEventListener('click', function () {
  run().catch(handleError);
  responseNum -= 1;
  console.log(responseNum);
  databaseFullStory += '\n\n   - ' + option2Element.textContent;
});

document.getElementById('continue').addEventListener('click', function () {
  run().catch(handleError);
  responseNum -= 1;
  console.log(responseNum);
});

// Error handler function
function handleError(error) {
  console.error('An error occurred:', error);
  // Retry calling run() if it's an error related to GoogleGenerativeAI or fetch
  if (true) {
    console.log('error - retrying');
    setTimeout(() => run().catch(handleError), 10); // Retry after a short delay
  }
}

async function insertStoryEntry() {
  const characters = sessionStorage.getItem('character'); //sessionStorage.getItem('character');
  const sidekick = sessionStorage.getItem('databaseSidekick'); //sessionStorage.getItem('sidekick');
  const weapon = sessionStorage.getItem('weapon'); //sessionStorage.getItem('weapon');
  const setting = sessionStorage.getItem('databaseLocation'); //sessionStorage.getItem('location');

  const url = 'insert_story.php';
  const data = {
    characters: characters,
    sidekick: sidekick,
    weapon: weapon,
    setting: setting,
    fullStory: databaseFullStory,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log('Story details inserted successfully into the database.');
    } else {
      console.error('Failed to insert story details into the database.');
    }
  } catch (error) {
    console.error('An error occurred while inserting story details:', error);
  }
}
