<?php
require 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    if (empty($email) || empty($password)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Email i hasło są wymagane'
        ]);
        exit;
    }
    
    try {
        // Sprawdzamy czy użytkownik istnieje
        $stmt = $pdo->prepare("SELECT * FROM uzytkownicy WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            // Sprawdzamy hasło (w prostej wersji bez haszowania, w rzeczywistości należy używać password_verify)
            if ($password === $user['haslo']) {
                // Zapisujemy dane użytkownika w sesji
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['rola'] = $user['rola'];
                
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Zalogowano pomyślnie',
                    'email' => $user['email']
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Nieprawidłowe hasło'
                ]);
            }
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Użytkownik o podanym adresie email nie istnieje'
            ]);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Błąd logowania: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Nieprawidłowe żądanie'
    ]);
}
?>