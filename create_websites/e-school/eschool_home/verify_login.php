<?php
session_start();

// Database Connection
$host = "localhost";
$db_user = "root";
$db_pass = ""; 
$db_name = "eb_academy";

$conn = new mysqli($host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    die("Database connection failed");
}

$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$passkey = isset($_POST['passkey']) ? trim($_POST['passkey']) : '';
$role = isset($_POST['role']) ? $_POST['role'] : '';

if (empty($username) || empty($passkey)) {
    echo "invalid";
    exit();
}

if ($role === 'Student' || $role === 'Parent') {
    // We use LIKE to be more flexible with hidden spaces in the DB
    $stmt = $conn->prepare("SELECT full_name, passkey FROM students WHERE full_name LIKE ? LIMIT 1");
    $searchTerm = "%" . $username . "%"; 
    $stmt->bind_param("s", $searchTerm);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        // Compare passkeys. 
        // We use trim() on both sides to ensure no hidden spaces block the match.
        if (trim($passkey) === trim($user['passkey'])) {
            $_SESSION['user'] = $user['full_name'];
            $_SESSION['role'] = 'Student';
            echo "success";
        } else {
            echo "invalid"; // Name found, but passkey wrong
        }
    } else {
        echo "invalid"; // Name not found at all
    }
    $stmt->close();
} else {
    // Basic Admin check for testing
    if ($username === "Admin" && $passkey === "1234") {
        echo "success";
    } else {
        echo "invalid";
    }
}
$conn->close();
?>