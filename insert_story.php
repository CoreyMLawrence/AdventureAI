<?php
// Retrieve POST data
$data = json_decode(file_get_contents("php://input"), true);

// Database connection
$dsn = 'mysql:host=joecool.highpoint.edu;dbname=CSC3212_S24_lhardister_db';
$username = 'lhardister';
$password = '1862270';

try {
    $db = new PDO($dsn, $username, $password);
} catch (PDOException $e) {
    $error_message = $e->getMessage();
    include('database_error.php');
    exit();
}

// Insert story details into the database
$insertQuery = "INSERT INTO story (characters, sidekick, weapon, setting, fullStory) VALUES (:characters, :sidekick, :weapon, :setting, :fullStory)";
$statement = $db->prepare($insertQuery);
$statement->bindValue(':characters', $data['characters']);
$statement->bindValue(':sidekick', $data['sidekick']);
$statement->bindValue(':weapon', $data['weapon']);
$statement->bindValue(':setting', $data['setting']);
$statement->bindValue(':fullStory', $data['fullStory']);

$statement->execute();
$statement->closeCursor();

// Close database connection
$db = null;

// Return success message
echo json_encode(array('message' => 'Story details inserted successfully into the database.'));
?>
