<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$order_id = $data['order_id'];

$conn->begin_transaction();

try {
    // Update order status
    $sql = "INSERT INTO order_status (Order_ID, Status_Name, Timestamp) VALUES (?, 'Canceled', NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $order_id);
    $stmt->execute();

    // Insert into cancel_orders table
    $sql = "INSERT INTO cancel_orders (Order_ID, Cancel_Date, Refund_Amount, Refund_Status) 
            SELECT Order_ID, NOW(), Total_Amount, 'Pending' FROM orders WHERE Order_ID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $order_id);
    $stmt->execute();

    $conn->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>

