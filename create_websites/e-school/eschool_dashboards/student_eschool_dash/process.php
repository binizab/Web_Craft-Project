<?php
header('Content-Type: application/json');

// Configuration - Adjust these to your db.php values
$host     = 'localhost';
$dbname   = 'eb_academy';
$username = 'root';
$password = '';

// Functions (usually in functions.php)
function generateComplexPasskey($length = 5) {
    return "EB-" . strtoupper(bin2hex(random_bytes($length / 2))) . "-" . rand(10, 99);
}

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $student_type = $_POST['student_type'] ?? '';

        // --- NEW STUDENT REGISTRATION ---
        if ($student_type === 'new') {
            $first  = $_POST['first_name'] ?? '';
            $middle = $_POST['middle_name'] ?? '';
            $last   = $_POST['last_name'] ?? '';
            $full_name = trim("$first $middle $last");
            
            $dob      = $_POST['dob'] ?? null;
            $gender   = $_POST['gender'] ?? '';
            $grade    = $_POST['grade'] ?? '';
            $fayda_no = $_POST['fayda_number'] ?? '';
            $mobile   = $_POST['mobile'] ?? '';
            $passkey  = generateComplexPasskey(6);

            // Handle Photo Blob
            $imgData = null;
            if (isset($_FILES['student_photo']) && $_FILES['student_photo']['tmp_name']) {
                $imgData = file_get_contents($_FILES['student_photo']['tmp_name']);
            }

            $sql = "INSERT INTO students (full_name, passkey, dob, gender, grade_applying, fayda_number, mobile, student_photo) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$full_name, $passkey, $dob, $gender, $grade, $fayda_no, $mobile, $imgData]);

            echo json_encode(['status' => 'success', 'passkey' => $passkey]);
        } 
        
        // --- RETURNING STUDENT LOOKUP ---
        elseif ($student_type === 'returning') {
            $returning_name = $_POST['returning_full_name'] ?? '';
            
            $stmt = $pdo->prepare("SELECT passkey FROM students WHERE full_name = ? LIMIT 1");
            $stmt->execute([$returning_name]);
            $student = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($student) {
                echo json_encode(['status' => 'success', 'passkey' => $student['passkey']]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Student not found.']);
            }
        }
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'DB Error: ' . $e->getMessage()]);
}
?>