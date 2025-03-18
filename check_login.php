<?php
require 'db.php';

header('Content-Type: application/json');

// Sprawdzanie czy użytkownik jest zalogowany
if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'status' => 'success',
        'logged_in' => true,
        'email' => $_SESSION['email'],
        'role' => $_SESSION['rola']
    ]);
} else {
    echo json_encode([
        'status' => 'success',
        'logged_in' => false
    ]);
}
?>