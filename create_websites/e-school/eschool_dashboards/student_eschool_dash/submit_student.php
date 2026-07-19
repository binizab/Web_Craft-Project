<?php
header('Content-Type: application/json');
include 'db.php';
include 'functions.php'; 

$response = ['status' => 'error', 'message' => 'Unknown error'];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $student_type = $_POST['student_type'] ?? '';

    if ($student_type === 'new') {
        // 1. COLLECT TEXT FIELDS - Mapped exactly to your HTML 'name' attributes
        $first_name  = $_POST['first_name'] ?? '';
        $middle_name = $_POST['middle_name'] ?? '';
        $last_name   = $_POST['last_name'] ?? '';
        $full_name   = trim("$first_name $middle_name $last_name");
        
        $dob             = $_POST['dob'];
        $gender          = $_POST['gender'];
        $grade           = $_POST['grade'];
        $fayda_no        = $_POST['fayda_number'];
        $subcity         = $_POST['subcity'];
        $kebele          = $_POST['kebele'];
        $house_no        = $_POST['house_no'];
        $mobile          = $_POST['mobile_number'];    // From HTML: name="mobile_number"
        $contact_person  = $_POST['contact_person'];   // From HTML: name="contact_person"
        $telephone       = $_POST['telephone_number']; // From HTML: name="telephone_number"
        $height          = $_POST['height'];
        
        // Parent Details (The ones that were likely returning NULL)
        $mother_name     = $_POST['mother_name'];      // From HTML: name="mother_name"
        $mother_phone    = $_POST['mother_number'];    // From HTML: name="mother_number"
        $father_name     = $_POST['father_name'];      // From HTML: name="father_name"
        $father_phone    = $_POST['father_number'];    // From HTML: name="father_number"
        
        $medical_history = $_POST['medical_history'];
        $generated_passkey = generateComplexPasskey(5);

        // 2. HANDLE BLOB UPLOADS
        $blobs = ['photo' => null, 'birth' => null, 'school' => null, 'leaving' => null];
        if (!empty($_FILES["student_photo"]["tmp_name"]))   $blobs['photo']   = file_get_contents($_FILES["student_photo"]["tmp_name"]);
        if (!empty($_FILES["birth_cert"]["tmp_name"]))      $blobs['birth']   = file_get_contents($_FILES["birth_cert"]["tmp_name"]);
        if (!empty($_FILES["school_cert"]["tmp_name"]))     $blobs['school']  = file_get_contents($_FILES["school_cert"]["tmp_name"]);
        if (!empty($_FILES["leaving_paper"]["tmp_name"]))   $blobs['leaving'] = file_get_contents($_FILES["leaving_paper"]["tmp_name"]);

        // 3. PREPARE SQL (The order must match your "Recreate Table" SQL)
        $sql = "INSERT INTO students (
                    student_type, full_name, passkey, dob, gender, grade_applying, 
                    fayda_number, subcity, kebele, house_no, mobile, 
                    contact_person, residence_phone, student_height, 
                    father_name, father_phone, mother_name, mother_phone, 
                    medical_history, student_photo, birth_certificate, 
                    school_certificate, leaving_paper
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $null = NULL; 

        // 19 's' (strings) and 4 'b' (blobs) = 23 parameters total
        $stmt->bind_param("sssssssssssssssssssbbbb", 
            $student_type,    // 1
            $full_name,       // 2
            $generated_passkey,// 3
            $dob,             // 4
            $gender,          // 5
            $grade,           // 6
            $fayda_no,        // 7
            $subcity,         // 8
            $kebele,          // 9
            $house_no,        // 10
            $mobile,          // 11
            $contact_person,  // 12
            $telephone,       // 13
            $height,          // 14
            $father_name,     // 15
            $father_phone,    // 16
            $mother_name,     // 17
            $mother_phone,    // 18
            $medical_history, // 19
            $null, $null, $null, $null // 20, 21, 22, 23 (Blobs)
        );

        // 4. ATTACH BLOB DATA (Indices start from 19 for the 20th parameter)
        if ($blobs['photo']   !== null) $stmt->send_long_data(19, $blobs['photo']);
        if ($blobs['birth']   !== null) $stmt->send_long_data(20, $blobs['birth']);
        if ($blobs['school']  !== null) $stmt->send_long_data(21, $blobs['school']);
        if ($blobs['leaving'] !== null) $stmt->send_long_data(22, $blobs['leaving']);

        if ($stmt->execute()) {
            $response = [
                'status' => 'success',
                'passkey' => $generated_passkey,
                'name' => $full_name
            ];
        } else {
            $response['message'] = "DB Error: " . $stmt->error;
        }
        $stmt->close();
    }
}
echo json_encode($response);
$conn->close();
?>