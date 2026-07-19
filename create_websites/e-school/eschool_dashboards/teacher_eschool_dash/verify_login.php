<?php
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $role = $_POST['role'] ?? '';
    $user = $_POST['username'] ?? '';
    $pass = $_POST['passkey'] ?? '';

    // Handle Admin separately (Hardcoded for now as per your request)
    if ($role === "Admin") {
        if ($user === "Admin" && $pass === "root123") {
            echo "success";
        } else {
            echo "fail";
        }
        exit;
    }

    // Determine target table
    // Teachers go to applications, Students/Parents check the students table
    if ($role === "Teacher") {
        $table = "teacher_applications";
    } else {
        $table = "students";
    }

    // Secure query using Prepared Statements
    // Note: Ensure your table columns are actually named 'full_name' and 'passkey'
    $stmt = $conn->prepare("SELECT * FROM $table WHERE full_name = ? AND passkey = ?");
    $stmt->bind_param("ss", $user, $pass);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo "success";
    } else {
        echo "fail";
    }

    $stmt->close();
    $conn->close();
}
?>