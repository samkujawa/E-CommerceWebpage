<?php
function GET_SQL($query) {
    try {
        $pdo = new PDO('sqlite:./cse383.db');
        $stmt = $pdo->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return false;
    }
}

class Cart {
    private $items;

    public function __construct() {
        $this->items = isset($_SESSION['cart']) ? $_SESSION['cart'] : array();
    }

    public function addItem($productId, $quantity) {
        if (isset($this->items[$productId])) {
            $this->items[$productId]['quantity'] += $quantity;
        } else {
            $this->items[$productId] = array('productId' => $productId, 'quantity' => $quantity);
        }
        $_SESSION['cart'] = $this->items;
    }

    public function removeItem($productId) {
        if (isset($this->items[$productId])) {
            unset($this->items[$productId]);
        }
        $_SESSION['cart'] = $this->items;
    }

    public function getCart() {
        return $this->items;
    }

    public function getDetailedCart() {
        $detailedCart = array();
        foreach ($this->items as $item) {
            $productDetails = FinalClass::getProductById($item['productId']);
            $detailedCart[] = array_merge($productDetails, array('quantity' => $item['quantity']));
        }
        return $detailedCart;
    }
}

class FinalClass {
    public static function getProduct($minPrice = null, $maxPrice = null, $sortOrder = null, $subCategory = null, $searchKeyword = null) {
        $retData = array();
        try {
            $sql = "SELECT * FROM product WHERE 1"; // Start with a basic query

            if ($searchKeyword !== null) {
                $sql .= " AND title LIKE :searchKeyword";
            } else {
                if ($minPrice !== null && $maxPrice !== null) {
                    $minPrice = floatval($minPrice);
                    $maxPrice = floatval($maxPrice);
                    $sql .= " AND price BETWEEN " . $minPrice . " AND " . $maxPrice;
                }

                if (isset($subCategory) && $subCategory !== "%") {
                    $sql .= " AND subcategory = '$subCategory'";
                }

                if (isset($sortOrder)) {
                    if ($sortOrder === 'lowPrice') {
                        $sql .= " ORDER BY price ASC";
                    } else if ($sortOrder === 'highPrice') {
                        $sql .= " ORDER BY price DESC";
                    }
                }
            }

            $pdo = new PDO('sqlite:./cse383.db');
            $stmt = $pdo->prepare($sql);

            if ($searchKeyword !== null) {
                $stmt->bindParam(':searchKeyword', $searchKeyword, PDO::PARAM_STR);
            }

            if ($stmt->execute()) {
                $retData["result"] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $retData["status"] = 0;
                $retData["message"] = "Products fetched successfully";
            } else {
                $retData["status"] = 1;
                $retData["message"] = "Error fetching products";
            }
        } catch (Exception $e) {
            error_log("Error: " . $e->getMessage());
            $retData["status"] = 1;
            $retData["message"] = "Error: " . $e->getMessage();
        }

        error_log("Executed SQL: " . $sql);
        return json_encode($retData);
    }

    public static function getProductById($productId) {
        $sql = "SELECT * FROM product WHERE product_id = " . intval($productId);
        $result = GET_SQL($sql);
        return count($result) > 0 ? $result[0] : null;
    }

    public static function handleCartOperation($operation, $productId = null, $quantity = 1) {
        $cart = new Cart();
        switch ($operation) {
            case 'add':
                $cart->addItem($productId, $quantity);
                break;
            case 'remove':
                $cart->removeItem($productId);
                break;
            case 'view':
                return json_encode($cart->getDetailedCart());
        }
        return json_encode(array('status' => 0, 'message' => 'Cart updated successfully'));
    }
}
?>
