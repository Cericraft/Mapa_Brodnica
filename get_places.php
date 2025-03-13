<?php
require 'db.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("SELECT * FROM zabytki");
    $stmt->execute();
    $miejsca = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'data' => $miejsca
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Błąd podczas pobierania miejsc: ' . $e->getMessage()
    ]);
}
// Funkcja do obsługi przesyłania zdjęć
function handleImageUpload($files) {
    // Katalog docelowy - upewnij się, że istnieje i ma odpowiednie uprawnienia
    $uploadDir = 'uploads/';
    
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $uploadedFiles = [];
    $errors = [];
    
    // Sprawdź czy przesłano pliki
    if (isset($files['name']) && is_array($files['name'])) {
        for ($i = 0; $i < count($files['name']); $i++) {
            if ($files['error'][$i] === 0) {
                $fileName = $files['name'][$i];
                $fileTemp = $files['tmp_name'][$i];
                $fileType = $files['type'][$i];
                $fileSize = $files['size'][$i];
                
                // Sprawdź typ pliku (tylko obrazy)
                $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!in_array($fileType, $allowedTypes)) {
                    $errors[] = "Plik '$fileName' nie jest obsługiwanym typem obrazu.";
                    continue;
                }
                
                // Sprawdź rozmiar pliku (limit 5MB)
                if ($fileSize > 5 * 1024 * 1024) {
                    $errors[] = "Plik '$fileName' przekracza maksymalny rozmiar 5MB.";
                    continue;
                }
                
                // Generuj unikalną nazwę dla pliku
                $newFileName = uniqid() . '_' . basename($fileName);
                $targetFile = $uploadDir . $newFileName;
                
                // Przenieś plik do katalogu docelowego
                if (move_uploaded_file($fileTemp, $targetFile)) {
                    $uploadedFiles[] = $targetFile;
                } else {
                    $errors[] = "Wystąpił błąd podczas przesyłania pliku '$fileName'.";
                }
            } else if ($files['error'][$i] !== UPLOAD_ERR_NO_FILE) {
                $errorMessages = [
                    UPLOAD_ERR_INI_SIZE => "Plik przekracza limit ustawiony w php.ini.",
                    UPLOAD_ERR_FORM_SIZE => "Plik przekracza limit określony w formularzu.",
                    UPLOAD_ERR_PARTIAL => "Plik został przesłany tylko częściowo.",
                    UPLOAD_ERR_NO_TMP_DIR => "Brak tymczasowego katalogu.",
                    UPLOAD_ERR_CANT_WRITE => "Nie można zapisać pliku na dysku.",
                    UPLOAD_ERR_EXTENSION => "Przesyłanie pliku zatrzymane przez rozszerzenie PHP."
                ];
                
                $errorCode = $files['error'][$i];
                $errorMsg = isset($errorMessages[$errorCode]) ? $errorMessages[$errorCode] : "Nieznany błąd ($errorCode).";
                $errors[] = "Błąd przesyłania pliku '{$files['name'][$i]}': $errorMsg";
            }
        }
    }
    
    return [
        'files' => $uploadedFiles,
        'errors' => $errors
    ];
}
?>