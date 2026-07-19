<?php
// Set header to JSON because your JavaScript fetch expects JSON
header('Content-Type: application/json');

include 'db.php';
include 'functions.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $name = $_POST['full_name'] ?? 'Unknown';
        $email = $_POST['email'] ?? '';
        
        // Generate the complex passkey
        // Assuming generateComplexPasskey is defined in functions.php
        $generated_passkey = generateComplexPasskey(5);

        $exp = $_POST['experience'] ?? 0;
        $subject = $_POST['subject'] ?? '';
        $degree = $_POST['degree'] ?? '';
        $statement = $_POST['statement'] ?? '';

        // Handle File Blobs
        $photo = !empty($_FILES["photo"]["tmp_name"]) ? file_get_contents($_FILES["photo"]["tmp_name"]) : NULL;
        // Accessing the first document in the array
        $document = !empty($_FILES["docs"]["tmp_name"][0]) ? file_get_contents($_FILES["docs"]["tmp_name"][0]) : NULL;

        $stmt = $conn->prepare("INSERT INTO teacher_applications (full_name, email, passkey, teaching_years, subject_specialty, highest_degree, professional_statement, profile_photo, academic_documents) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        // Use 'b' for blob types and send_long_data for large files
        $null = NULL; 
        $stmt->bind_param("sssisssbb", $name, $email, $generated_passkey, $exp, $subject, $degree, $statement, $null, $null);
        
        if ($photo) $stmt->send_long_data(7, $photo);
        if ($document) $stmt->send_long_data(8, $document);

        if ($stmt->execute()) {
            // Return JSON success for the JavaScript fetch()
            echo json_encode([
                "status" => "success",
                "passkey" => $generated_passkey,
                "message" => "Application recorded successfully"
            ]);
        } else {
            throw new Exception($stmt->error);
        }
        
        $stmt->close();

    } catch (Exception $e) {
        // Return JSON error
        echo json_encode([
            "status" => "error",
            "message" => $e->getMessage()
        ]);
    }
}
?>