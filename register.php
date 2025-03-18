<?php
 require 'db.php';
 
 header('Content-Type: application/json');
 
 if ($_SERVER['REQUEST_METHOD'] == 'POST') {
     $username = $_POST['username'] ?? '';
     $email = $_POST['email'] ?? '';
     $password = $_POST['password'] ?? '';
     $password_confirm = $_POST['password_confirm'] ?? '';
     
     // Sprawdzenie czy wszystkie pola są wypełnione
     if (empty($username) || empty($email) || empty($password) || empty($password_confirm)) {
         echo json_encode([
             'status' => 'error',
             'message' => 'Wypełnij wszystkie pola'
         ]);
         exit;
     }
     
     // Sprawdzenie czy hasła są zgodne
     if ($password !== $password_confirm) {
         echo json_encode([
             'status' => 'error',
             'message' => 'Hasła nie są identyczne'
         ]);
         exit;
     }
     
     // Sprawdzenie czy email jest już zajęty
     $stmt = $pdo->prepare("SELECT id FROM uzytkownicy WHERE email = ?");
     $stmt->execute([$email]);
     if ($stmt->fetch()) {
         echo json_encode([
             'status' => 'error',
             'message' => 'Ten email jest już zajęty'
         ]);
         exit;
     }
     
     // Zapisanie użytkownika do bazy danych
     try {
         // W rzeczywistej aplikacji, zawsze używaj password_hash!
         // Dla celów demonstracyjnych, zapisujemy hasło bez szyfrowania
         // $hashed_password = password_hash($password, PASSWORD_DEFAULT);
         $hashed_password = $password; // Tylko dla demo!
         
         $stmt = $pdo->prepare("INSERT INTO uzytkownicy (email, haslo, rola) VALUES (?, ?, 'user')");
         $stmt->execute([$email, $hashed_password]);
         
         echo json_encode([
             'status' => 'success',
             'message' => 'Konto zostało utworzone. Możesz się teraz zalogować.'
         ]);
     } catch (PDOException $e) {
         echo json_encode([
             'status' => 'error',
             'message' => 'Błąd podczas tworzenia konta: ' . $e->getMessage()
         ]);
     }
 } else {
     echo json_encode([
         'status' => 'error',
         'message' => 'Nieprawidłowe żądanie'
     ]);
 }
 ?>