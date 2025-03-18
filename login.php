<?php
 require 'db.php';
 
 header('Content-Type: application/json');
 
 // Sprawdzanie typu żądania
 if ($_SERVER['REQUEST_METHOD'] == 'POST') {
     // Pobieranie akcji z formularza
     $action = $_POST['action'] ?? '';
     
     // Wybór odpowiedniej akcji
     if ($action === 'login') {
         // Obsługa logowania
         $email = $_POST['email'] ?? '';
         $password = $_POST['password'] ?? '';
         
         if (empty($email) || empty($password)) {
             echo json_encode([
                 'status' => 'error',
                 'message' => 'Wypełnij wszystkie pola'
             ]);
             exit;
         }
         
         $stmt = $pdo->prepare("SELECT * FROM uzytkownicy WHERE email = ?");
         $stmt->execute([$email]);
         $user = $stmt->fetch();
         
         // Dla celów demonstracyjnych, sprawdzamy również hasło niezaszyfrowane
         // W rzeczywistej aplikacji używaj WYŁĄCZNIE password_verify!
         if ($user && ($password === $user['haslo'] || password_verify($password, $user['haslo']))) {
             $_SESSION['user_id'] = $user['id'];
             $_SESSION['user_email'] = $user['email'];
             $_SESSION['user_role'] = $user['rola'];
             
             echo json_encode([
                 'status' => 'success',
                 'message' => 'Zalogowano pomyślnie',
                 'redirect' => 'dashboard.php'
             ]);
         } else {
             echo json_encode([
                 'status' => 'error',
                 'message' => 'Nieprawidłowy email lub hasło'
             ]);
         }
     } else {
         // Nieznana akcja
         echo json_encode([
             'status' => 'error',
             'message' => 'Nieznana akcja'
         ]);
     }
 } else {
     // Jeśli to nie jest żądanie POST, wyświetlamy komunikat o błędzie
     echo json_encode([
         'status' => 'error',
         'message' => 'Nieprawidłowe żądanie'
     ]);
 }
 ?>