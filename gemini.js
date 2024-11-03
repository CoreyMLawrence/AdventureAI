// Constants and state management
const STORY_CONFIG = {
  RESPONSE_LIMIT: 10,
  UI_ELEMENTS: {
    story: document.getElementById('story'),
    option1: document.getElementById('option1'),
    option2: document.getElementById('option2'),
    continue: document.getElementById('continue'),
  },
  CLASSES: {
    hidden: 'noDisplay',
    visible: 'yesDisplay',
  },
};

class StoryState {
  constructor() {
    this.remainingResponses = STORY_CONFIG.RESPONSE_LIMIT;
    this.fullStory = '';
    this.databaseFullStory = '';
    this.characterName = '';
  }

  decrementResponses() {
    this.remainingResponses--;
    return this.remainingResponses;
  }

  getStoryProgress() {
    console.log(this.remainingResponses);
    if (this.remainingResponses === 3) {
      return 'story will need to finish in 3 more decisions, begin to wrap up story lines';
    } else if (this.remainingResponses === 2) {
      return 'story will need to finish in 2 more decisions, begin to tell the story of how the characters ended up';
    } else if (this.remainingResponses === 1) {
      return 'the story should conclude now, give the user a final decision to make to determine their future';
    } else if (this.remainingResponses < 1) {
      return 'the story must end now, wrap it up wonderfully in 4 sentences exactly, and stop giving options';
    }
    return '';
  }
  appendToStory(text) {
    this.fullStory += (this.fullStory ? '\n\n' : '') + text;
    this.databaseFullStory += '\n\n' + text;
  }

  appendChoice(choice) {
    this.fullStory += '\n\nChose: ' + choice;
    this.databaseFullStory += '\n\n   - ' + choice;
  }

  setCharacterName(name) {
    this.characterName = name;
  }
}

// AI Service class
class AIService {
  constructor() {
    this.genAI = null;
  }

  async initialize() {
    const response = await fetch('get_api_key.php');
    const apiKey = await response.text();
    const { GoogleGenerativeAI } = await import(
      'https://esm.run/@google/generative-ai'
    );
    this.genAI = new GoogleGenerativeAI(apiKey.trim());
  }

  async generateStorySegment(prompt) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Request JSON structure specifically
    const enhancedPrompt = `${prompt}
    Please respond with a JSON object in the following format:
    {
      "story": "story text here",
      "options": [
        "first option text here",
        "second option text here"
      ]
    }`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Parse the response as JSON
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      throw new Error('Invalid AI response format');
    }
  }
}

// UI Manager class
class UIManager {
  constructor(elements) {
    this.elements = elements;
  }

  updateStory(storySegment) {
    const { story, options } = storySegment;

    this.elements.story.textContent = story;
    this.updateOptions(options);
    this.resetButtonStyles();
  }

  updateOptions(options) {
    const [option1, option2] = options;

    this.elements.option1.textContent = option1;
    this.elements.option2.textContent = option2;

    this.toggleOptionVisibility(this.elements.option1, option1?.length > 10);
    this.toggleOptionVisibility(this.elements.option2, option2?.length > 10);
    this.toggleContinueButton(option1?.length <= 10 && option2?.length <= 10);
  }

  toggleOptionVisibility(element, show) {
    element.classList.toggle(STORY_CONFIG.CLASSES.hidden, !show);
    element.classList.toggle(STORY_CONFIG.CLASSES.visible, show);
  }

  toggleContinueButton(show) {
    this.elements.continue.classList.toggle(STORY_CONFIG.CLASSES.hidden, !show);
    this.elements.continue.classList.toggle(STORY_CONFIG.CLASSES.visible, show);
  }

  setEndingState() {
    console.log('The End');
    const continueBtn = this.elements.continue;
    continueBtn.textContent = 'The End';
    continueBtn.style.border = 'none';
    continueBtn.style.fontFamily = "'Great Vibes', cursive";
    continueBtn.style.fontSize = '2em';
    continueBtn.style.padding = '0';
    continueBtn.style.color = 'white';
    continueBtn.style.display = 'block';
  }

  resetButtonStyles() {
    const elements = [
      this.elements.option1,
      this.elements.option2,
      this.elements.continue,
    ];
    elements.forEach((element) => {
      element.style.color = 'white';
      element.style.border = 'white solid 2px';
    });
  }
}

// Story Manager class
class StoryManager {
  constructor() {
    this.state = new StoryState();
    this.aiService = new AIService();
    this.uiManager = new UIManager(STORY_CONFIG.UI_ELEMENTS);
    this.isFirstPrompt = true;
  }

  async initialize() {
    await this.aiService.initialize();
    this.setupEventListeners();
    this.generateNextSegment();
  }

  setupEventListeners() {
    STORY_CONFIG.UI_ELEMENTS.option1.addEventListener('click', () =>
      this.handleOptionClick(1)
    );
    STORY_CONFIG.UI_ELEMENTS.option2.addEventListener('click', () =>
      this.handleOptionClick(2)
    );
    STORY_CONFIG.UI_ELEMENTS.continue.addEventListener('click', () =>
      this.generateNextSegment()
    );
  }

  async handleOptionClick(optionNumber) {
    const optionText =
      STORY_CONFIG.UI_ELEMENTS[`option${optionNumber}`].textContent;
    this.state.appendChoice(optionText);
    await this.generateNextSegment();
  }

  async generateNextSegment() {
    try {
      const prompt = this.constructPrompt();
      const storySegment = await this.aiService.generateStorySegment(prompt);

      // If this is the first prompt, try to extract the character's name
      if (this.isFirstPrompt) {
        // Simple regex to find a name (this is a basic example - you might want to improve it)
        const nameMatch = storySegment.story.match(
          /([A-Z][a-z]+ )?[A-Z][a-z]+/
        );
        if (nameMatch) {
          this.state.setCharacterName(nameMatch[0]);
        }
      }

      this.state.appendToStory(storySegment.story);
      this.uiManager.updateStory(storySegment);

      this.state.decrementResponses();
      this.isFirstPrompt = false;

      if (
        this.state.remainingResponses < 1 &&
        (!storySegment.options[0] || storySegment.options[0].length < 10) &&
        (!storySegment.options[1] || storySegment.options[1].length < 10)
      ) {
        if (
          this.state.remainingResponses < 1 &&
          storySegment.options.every((option) => option.length < 10)
        ) {
          this.uiManager.setEndingState();
          await this.saveToDatabase();
        }
      }
    } catch (error) {
      console.error('Error generating story segment:', error);
      setTimeout(() => this.generateNextSegment(), 1000);
    }
  }

  constructPrompt() {
    return this.isFirstPrompt
      ? this.constructInitialPrompt()
      : this.constructContinuationPrompt();
  }

  constructInitialPrompt() {
    const character = sessionStorage.getItem('character');
    const weapon = sessionStorage.getItem('weapon');
    const sidekick = sessionStorage.getItem('sidekick');
    const location = sessionStorage.getItem('location');

    return `You are a master storyteller creating a choose-your-own-adventure game. Create the opening paragrapy (up to 2 sentenses) of our story with these required elements:

Most Important: Keep it concise and provide an excellent hook to keep the reader interested!

Key elements that MUST be established and used consistently throughout the story:
- Location: ${location}
- Main Character: Create a ${character}-type character. Give them a memorable name that fits their personality.
- Weapon: ${weapon} (must be used at least once, preferably for humor)
- Sidekick: ${sidekick} (their trusty companion)

Story Guidelines:
- Introduce the main character by their new name
- Establish the setting and initial situation
- Keep the tone humorous and engaging
- Provide clear stakes or a goal

RESPONSE FORMAT: You must return a JSON object exactly like this:
{
  "story": "Your concise opening story segment here (no numbering)",
  "options": [
    "First choice option here (clear and direct)",
    "Second choice option here (clear and direct)"
  ]
}`;
  }

  constructContinuationPrompt() {
    const progress = this.state.getStoryProgress();
    const remainingSteps = this.state.remainingResponses;

    return `Continue our choose-your-own-adventure story. Create the next segment with ${remainingSteps} steps remaining. 
  
  Important context:
  ${this.state.fullStory}
  
  ${progress}
  
  Requirements:
  - Use the established character name
  - Keep each response to 1-2 sentences
  - Maintain the humorous tone
  - Keep the story moving forward
  - Be concise but engaging
  
  RESPONSE FORMAT: You must return a JSON object exactly like this:
  {
    "story": "Your concise story segment here (no numbering)",
    "options": [
      "First choice option here (clear and direct)",
      "Second choice option here (clear and direct)"
    ]
  }`;
  }

  async saveToDatabase() {
    const data = {
      characters: sessionStorage.getItem('character'),
      sidekick: sessionStorage.getItem('databaseSidekick'),
      weapon: sessionStorage.getItem('weapon'),
      setting: sessionStorage.getItem('databaseLocation'),
      fullStory: this.state.databaseFullStory,
    };

    try {
      const response = await fetch('insert_story.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save story to database');
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  }
}

// Initialize the application
const storyGame = new StoryManager();
storyGame.initialize().catch(console.error);
