<?php
include 'db.php';
include 'functions.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['full_name'];
    $email = $_POST['email'];
    
    // GENERATE THE COMPLEX PASSKEY
    $generated_passkey = generateComplexPasskey(5);

    $exp = $_POST['experience'];
    $subject = $_POST['subject'];
    $degree = $_POST['degree'];
    $statement = $_POST['statement'];

    $photo = !empty($_FILES["photo"]["tmp_name"]) ? file_get_contents($_FILES["photo"]["tmp_name"]) : NULL;
    $document = !empty($_FILES["docs"]["tmp_name"][0]) ? file_get_contents($_FILES["docs"]["tmp_name"][0]) : NULL;

    $stmt = $conn->prepare("INSERT INTO teacher_applications (full_name, email, passkey, teaching_years, subject_specialty, highest_degree, professional_statement, profile_photo, academic_documents) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->bind_param("sssisssbb", $name, $email, $generated_passkey, $exp, $subject, $degree, $statement, $null, $null);
    $stmt->send_long_data(7, $photo);
    $stmt->send_long_data(8, $document);

    if ($stmt->execute()) {
        echo "<script>
                alert('Application Submitted! YOUR ACCESS PASSKEY IS: " . $generated_passkey . "\\nKeep this safe for your interview login.');
                window.location.href='pass.html';
              </script>";
    } else {
        echo "Error: " . $stmt->error;
    }
    $stmt->close();
}
?>