<?php
header('Content-Type: application/json');

// Database Configuration
$host     = 'localhost';
$dbname   = 'eb_academy';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $name    = trim($_POST['returning_full_name'] ?? '');
        $passkey = trim($_POST['returning_passkey'] ?? ''); // Ensure HTML name matches this

        // Search for the student
        $stmt = $pdo->prepare("SELECT * FROM students WHERE full_name = ? AND passkey = ? LIMIT 1");
        $stmt->execute([$name, $passkey]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($student) {
            // We return all info so the JS can fill the ID card
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'full_name' => $student['full_name'],
                    'passkey'   => $student['passkey'],
                    'grade'     => $student['grade_applying'],
                    'mobile'    => $student['mobile'],
                    'photo'     => $student['student_photo'] ? base64_encode($student['student_photo']) : null
                ]
            ]);
        } else {
            echo json_encode([
                'status' => 'error', 
                'message' => 'Invalid Name or Passkey. Please try again or register as a new student.'
            ]);
        }
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>