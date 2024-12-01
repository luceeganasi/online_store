<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

$sql = "SELECT p.Product_ID, p.Product_Name, pv.Prize as Price, pv.Size, pv.Color, pv.Stock 
        FROM products p
        JOIN product_variant pv ON p.Product_ID = pv.Product_ID";
$result = $conn->query($sql);

$products = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

echo json_encode($products);

$conn->close();
?>

