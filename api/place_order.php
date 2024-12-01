<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$customer_id = $data['customer_id'];
$total_amount = $data['total_amount'];
$items = $data['items'];

$conn->begin_transaction();

try {
    // Insert into orders table
    $sql = "INSERT INTO orders (Customer_ID, Order_Date, Total_Amount) VALUES (?, NOW(), ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sd", $customer_id, $total_amount);
    $stmt->execute();
    $order_id = $stmt->insert_id;

    // Insert into order_items table
    $sql = "INSERT INTO order_items (Order_ID, Variant_ID, Quantity, UnitPrice) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    foreach ($items as $item) {
        $stmt->bind_param("siid", $order_id, $item['variant_id'], $item['quantity'], $item['price']);
        $stmt->execute();
    }

    $conn->commit();
    echo json_encode(['success' => true, 'order_id' => $order_id]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>

