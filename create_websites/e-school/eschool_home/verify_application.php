<?php
session_start();
$conn = new mysqli("localhost", "root", "", "eb_academy");
if ($conn->connect_error) { die("Database error"); }

$username = $_POST['username'] ?? '';
$passkey = $_POST['passkey'] ?? '';

if (!empty($username) && !empty($passkey)) {
    // Queries your teacher application table
    $stmt = $conn->prepare("SELECT passkey FROM teacher_applications WHERE full_name = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        if ($passkey === $user['passkey']) {
            $_SESSION['user'] = $username;
            $_SESSION['role'] = 'Teacher';
            echo "success";
        } else { echo "invalid"; }
    } else { echo "invalid"; }
    $stmt->close();
}
$conn->close();
?>