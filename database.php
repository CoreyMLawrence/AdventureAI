<?php
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
?>

