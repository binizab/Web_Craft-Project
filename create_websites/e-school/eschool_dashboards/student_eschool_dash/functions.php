<?php
function generateComplexPasskey($length = 5) {
    // Defines the pool of characters: Uppercase, Lowercase, Numbers, and Symbols
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    return substr(str_shuffle($chars), 0, $length);
}
?>