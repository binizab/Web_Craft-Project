<?php
header('Content-Type: application/json');

// Database credentials
$host = 'localhost';
$db   = 'eb_academy';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    
    // Get the username from the URL parameter
    $targetUser = isset($_GET['username']) ? $_GET['username'] : '';

    if (empty($targetUser)) {
        echo json_encode(['error' => 'No username provided']);
        exit;
    }

    // Secure query using a placeholder (?)
    $stmt = $pdo->prepare("SELECT grade FROM students WHERE full_name = ?");
    $stmt->execute([$targetUser]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($results);

} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error']);
}
?>