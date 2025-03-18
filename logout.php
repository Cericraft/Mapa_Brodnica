<?php
require 'db.php';

header('Content-Type: application/json');

// Wylogowanie użytkownika - usunięcie danych sesji
session_unset();
session_destroy();

echo json_encode([
    'status' => 'success',
    'message' => 'Wylogowano pomyślnie'
]);
?>