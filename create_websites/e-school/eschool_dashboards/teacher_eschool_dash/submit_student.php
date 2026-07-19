<?php
include 'db.php';
include 'functions.php'; // Contains generateComplexPasskey()

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $student_type = $_POST['student_type'];

    if ($student_type === 'new') {
        // 1. COMBINE NAMES
        $full_name = trim($_POST['first_name'] . " " . $_POST['middle_name'] . " " . $_POST['last_name']);
        
        // 2. COLLECT OTHER FIELDS
        $dob        = $_POST['dob'];
        $gender     = $_POST['gender'];
        $grade      = $_POST['grade'];
        $fayda_no   = $_POST['fayda_number'];
        $mobile     = $_POST['mobile'];
        
        // 3. GENERATE PASSKEY
        $generated_passkey = generateComplexPasskey(5);

        // 4. HANDLE IMAGE UPLOAD (BLOB)
        $imgData = NULL;
        if (!empty($_FILES["student_photo"]["tmp_name"])) {
            $imgData = file_get_contents($_FILES["student_photo"]["tmp_name"]);
        }

        // 5. PREPARE SQL
        // Note: Ensure your 'students' table has columns for these fields or adjust accordingly
        $sql = "INSERT INTO students (full_name, passkey, dob, gender, grade_applying, fayda_number, mobile, student_photo) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        
        // "sssssssb" means 7 strings and 1 blob
        $null = NULL; 
        $stmt->bind_param("sssssssb", $full_name, $generated_passkey, $dob, $gender, $grade, $fayda_no, $mobile, $null);
        $stmt->send_long_data(7, $imgData);

        if ($stmt->execute()) {
            echo "<script>
                    alert('Registration Successful!\\n\\nYOUR PASSKEY IS: " . $generated_passkey . "\\nSave this to access your portal.');
                    window.location.href='index.html'; 
                  </script>";
        } else {
            echo "Error: " . $stmt->error;
        }
        $stmt->close();

    } elseif ($student_type === 'returning') {
        // HANDLE RETURNING STUDENT LOGIC
        $returning_name = $_POST['returning_full_name'];
        
        // Search for the student in the database
        $stmt = $conn->prepare("SELECT passkey FROM students WHERE full_name = ?");
        $stmt->bind_param("s", $returning_name);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo "<script>
                    alert('Student Found! Welcome back.\\nYour Passkey is: " . $row['passkey'] . "');
                    window.location.href='portal.php';
                  </script>";
        } else {
            echo "<script>
                    alert('No record found for this name. Please register as a new student.');
                    window.location.href='index.html';
                  </script>";
        }
        $stmt->close();
    }
}
$conn->close();
?>