<?php
// Database connection
$dsn = 'mysql:host=joecool.highpoint.edu;dbname=CSC3212_S24_lhardister_db';
$username = 'lhardister';
$password = '1862270';

try {
    // Establish database connection
    $db = new PDO($dsn, $username, $password);

    // Query to fetch maximum index
    $sql = "SELECT MAX(index_column) AS max_index FROM your_table";
    $statement = $db->prepare($sql);
    $statement->execute();
    $row = $statement->fetch(PDO::FETCH_ASSOC);

    // Return max index as JSON
    echo json_encode($row['max_index']);
} catch (PDOException $e) {
    // Handle connection error
    echo json_encode(array('error' => 'Failed to connect to the database.'));
    exit();
}
?>
