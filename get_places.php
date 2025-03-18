<?php
require 'db.php';

header('Content-Type: application/json');

try {
    // Fetch all landmarks with basic information
    $stmt = $pdo->prepare("SELECT * FROM zabytki");
    $stmt->execute();
    $miejsca = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // For each landmark, fetch all associated images
    foreach ($miejsca as &$miejsce) {
        $imageStmt = $pdo->prepare("SELECT sciezka FROM zdjecia WHERE zabytek_id = ?");
        $imageStmt->execute([$miejsce['id']]);
        $images = $imageStmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Add the default image (from zabytki table) if it's not empty
        if (!empty($miejsce['zdjecie'])) {
            // Add main image to the beginning of the array
            array_unshift($images, $miejsce['zdjecie']);
        }
        
        // Remove duplicates if main image was also added to zdjecia table
        $images = array_unique($images);
        
        // Add images array to the place data
        $miejsce['wszystkie_zdjecia'] = $images;
    }
    
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
?>