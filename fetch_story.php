<?php
// Database connection
$dsn = 'mysql:host=joecool.highpoint.edu;dbname=CSC3212_S24_lhardister_db';
$username = 'lhardister';
$password = '1862270';

try {
    $db = new PDO($dsn, $username, $password);
} catch (PDOException $e) {
    $error_message = $e->getMessage();
    // Handle connection error
    echo json_encode(array('error' => 'Failed to connect to the database.'));
    exit();
}

// Check if index parameter is provided
if (isset($_GET['index'])) {
    // Sanitize the index parameter
    $index = filter_input(INPUT_GET, 'index', FILTER_VALIDATE_INT);

    // Query to fetch story data by index
    $query = "SELECT * FROM story LIMIT :index, 1";
    $statement = $db->prepare($query);
    $statement->bindValue(':index', $index, PDO::PARAM_INT);
    $statement->execute();

    // Fetch the row
    $row = $statement->fetch(PDO::FETCH_ASSOC);

    // Close statement
    $statement->closeCursor();

    // Close database connection
    $db = null;

    // Output the fetched row as JSON
    echo json_encode($row);
} else {
    // Output error if index parameter is missing
    echo json_encode(array('error' => 'Index parameter is missing.'));
}
?>
