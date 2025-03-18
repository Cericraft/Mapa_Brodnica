<?php
require 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Wszystkie pola są wymagane'
        ]);
        exit;
    }
    
    // Sprawdzenie czy email jest poprawny
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Nieprawidłowy format adresu email'
        ]);
        exit;
    }
    
    try {
        // Sprawdzamy czy użytkownik o podanym emailu już istnieje
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM uzytkownicy WHERE email = ?");
        $stmt->execute([$email]);
        $count = $stmt->fetchColumn();
        
        if ($count > 0) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Użytkownik o podanym adresie email już istnieje'
            ]);
            exit;
        }
        
        // Dodajemy nowego użytkownika
        // W rzeczywistości należy zastosować haszowanie hasła (np. password_hash)
        $stmt = $pdo->prepare("INSERT INTO uzytkownicy (email, haslo, rola) VALUES (?, ?, 'user')");
        $stmt->execute([$email, $password]);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Konto zostało utworzone pomyślnie'
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Błąd rejestracji: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Nieprawidłowe żądanie'
    ]);
}
?>