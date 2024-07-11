<?php
require_once 'final.class.php';

if (isset($_GET['search'])) {
    $searchKeyword = '%' . $_GET['search'] . '%';

    $sql = "SELECT * FROM product WHERE title LIKE :searchKeyword";

    $pdo = new PDO('sqlite:./cse383.db');
    $stmt = $pdo->prepare($sql);

    $stmt->bindParam(':searchKeyword', $searchKeyword, PDO::PARAM_STR);

    if ($stmt->execute()) {
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(array(
            "status" => 0,
            "result" => $result,
            "message" => "Products fetched successfully"
        ));
    } else {
        echo json_encode(array(
            "status" => 1,
            "message" => "Error searching products"
        ));
    }
} else {
    $productId = isset($_GET['productId']) ? $_GET['productId'] : null;

    if ($productId !== null) {
        $productDetails = FinalClass::getProductById($productId);
        if ($productDetails) {
            echo json_encode(array("status" => 0, "result" => $productDetails));
        } else {
            echo json_encode(array("status" => 1, "message" => "Product not found"));
        }
    } else {
        $minPrice = isset($_GET['minPrice']) ? $_GET['minPrice'] : null;
        $maxPrice = isset($_GET['maxPrice']) ? $_GET['maxPrice'] : null;
        $sortOrder = isset($_GET['sortOrder']) ? $_GET['sortOrder'] : null;
        $subCategory = isset($_GET['subCategory']) ? $_GET['subCategory'] : null;

        $result = FinalClass::getProduct($minPrice, $maxPrice, $sortOrder, $subCategory); 
        echo $result;
    }

    if (isset($_POST['finalizeSale'])) {
        $amountTendered = isset($_POST['amountTendered']) ? floatval($_POST['amountTendered']) : 0;
        $paymentMethod = isset($_POST['paymentMethod']) ? $_POST['paymentMethod'] : '';

        $totalAmount = 0; 
        $change = $amountTendered - $totalAmount;

        echo json_encode(array(
            "status" => 0,
            "message" => "Sale finalized successfully",
            "change" => $change
        ));
    }
}
?>
