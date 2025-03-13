<?php
require 'db.php';

header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    // Pobierz dodatkowe informacje o użytkowniku
    $stmt = $pdo->prepare("SELECT email, rola FROM uzytkownicy WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    echo json_encode([
        'status' => 'success',
        'logged_in' => true,
        'user_id' => $_SESSION['user_id'],
        'email' => $user['email'] ?? $_SESSION['user_email'] ?? '',
        'role' => $user['rola'] ?? $_SESSION['user_role'] ?? 'user',
        'username' => $user['email'] ?? $_SESSION['user_email'] ?? ''
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'logged_in' => false
    ]);
}
?>