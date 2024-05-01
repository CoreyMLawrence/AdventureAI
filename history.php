<?php
require_once('database.php');

// Get the table name
$tableName = 'story';

// Get the table schema
$queryColumns = "DESCRIBE $tableName";
$statement = $db->prepare($queryColumns);
$statement->execute();
$columns = $statement->fetchAll(PDO::FETCH_COLUMN);

// Close the statement
$statement->closeCursor();
?>

<!DOCTYPE html>
<html>
<!-- the head section -->
<head>
    <title>Table Columns</title>
</head>
<body>
<main>
    <h1>Columns of <?php echo $tableName; ?> Table</h1>
    <ul>
        <?php foreach ($columns as $column) : ?>
            <li><?php echo $column; ?></li>
        <?php endforeach; ?>
    </ul>
</main>
</body>
</html>
