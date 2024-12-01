<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

$sql = "SELECT DISTINCT PaymentType FROM payment_method";
$result = $conn->query($sql);

$payment_methods = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $payment_methods[] = $row['PaymentType'];
    }
}

echo json_encode($payment_methods);

$conn->close();
?>

