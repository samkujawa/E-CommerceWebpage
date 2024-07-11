$(document).ready(function () {
    var cart = {
        items: [],
        addItem: function (product) {
            this.items.push(product);
            this.updateCartIcon();
        },
        removeItem: function (productId) {
            this.items = this.items.filter(item => item.product_id != productId);
            this.updateCartIcon();
            this.viewCart(); // Refresh the cart view
        },
        updateCartIcon: function () {
            $('#cartCount').text(this.items.length);
        },
        viewCart: function () {
            $('#cartModal').modal('show');
            var cartHtml = '<ul class="list-unstyled">';
            this.items.forEach(item => {
                cartHtml += `
                    <li class="media mb-3">
                        <img src="${item.image}" class="mr-3" alt="${item.title}" style="width: 64px; height: 64px;">
                        <div class="media-body">
                            <h5 class="mt-0 mb-1">${item.title} - $${item.price}</h5>
                            <button class="remove-from-cart-btn btn btn-danger btn-sm" data-product-id="${item.product_id}">Remove</button>
                        </div>
                    </li>`;
            });
            cartHtml += '</ul>';

            // Sale Information
            cartHtml += `
                <div id="saleInformation">
                    <h5 class="mb-3">Sale Information</h5>
                    <div class="form-group">
                        <label for="amountTendered">Amount Tendered:</label>
                        <input type="number" id="amountTendered" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="paymentMethod">Payment Method:</label>
                        <select id="paymentMethod" class="form-control">
                            <option value="cash">Cash</option>
                            <option value="charge">Charge</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="change">Change:</label>
                        <input type="number" id="change" class="form-control" readonly>
                    </div>
                    <!-- Finalize Sale Button -->
                    <button id="finalizeSaleBtn" class="btn btn-success">Finalize Sale</button>
                </div>
            `;

            $('#cartModalBody').html(cartHtml);
        }
    };

    function loadProducts() {
        var subCategory = $('#subcategoryFilter').val();
        var minPrice = $('#minPrice').val();
        var maxPrice = $('#maxPrice').val();
        var sortOrder = $('#sortOrder').val();
        var url = 'http://172.17.15.81/cse383_final/final.php/getProduct?';

        if (subCategory !== "%") {
            url += 'subCategory=' + encodeURIComponent(subCategory) + '&';
        }

        if (minPrice !== "") {
            url += 'minPrice=' + minPrice + '&';
        }
        if (maxPrice !== "") {
            url += 'maxPrice=' + maxPrice + '&';
        }

        if (sortOrder !== "") {
            url += 'sortOrder=' + sortOrder;
        }

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response.status === 0 && response.result) {
                    var productsContainer = $('#productsContainer');
                    productsContainer.empty();
                    response.result.forEach(product => {
                        var productHtml = `
                            <div class="col-md-4 mb-4 product-card">
                                <div class="card h-100">
                                    <img src="${product.image}" class="card-img-top product-image" alt="${product.title}">
                                    <div class="card-body">
                                        <h5 class="card-title">${product.title}</h5>
                                        <p class="card-text">Category: ${product.subcategory}</p>
                                        <button class="toggle-description-btn btn btn-link">Read more</button> <!-- Add a button to toggle the description -->
                                        <div class="product-description" style="display: none;">${product.description}</div> <!-- Description section (initially hidden) -->
                                        <p class="card-text">$${product.price}</p>
                                        <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.product_id}">Add to Cart</button>
                                    </div>
                                </div>
                            </div>`;

                        productsContainer.append(productHtml);
                    });

                } else {
                    $('#productsContainer').html('<p>No products found.</p>');
                }
            },
            error: function () {
                console.error('Error loading products');
                $('#productsContainer').html('<p>Error loading products.</p>');
            }
        });
    }

    function calculateTotalAmount() {
        var total = 0;
        cart.items.forEach(item => {
            total += parseFloat(item.price);
        });
        console.log(total);
        return total;
    }

    $(document).on('click', '#finalizeSaleBtn', function () {
        console.log("Finalize Sale button clicked");
        var amountTendered = parseFloat($('#amountTendered').val());
        var paymentMethod = $('#paymentMethod').val();

        var totalAmount = calculateTotalAmount();

        var change = amountTendered - totalAmount;

        $('#change').val(change.toFixed(2));
    });

    function toggleDescription(card) {
        var description = card.find('.product-description');
        var toggleButton = card.find('.toggle-description-btn');

        if (description.is(':visible')) {
            description.slideUp();
            toggleButton.text('Read more');
        } else {
            description.slideDown();
            toggleButton.text('Read less');
        }
    }

    $(document).on('click', '.toggle-description-btn', function () {
        var card = $(this).closest('.product-card');
        toggleDescription(card);
    });

    
	function searchProducts(keyword) {
        var url = 'final.php?search=' + encodeURIComponent(keyword);

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response.status === 0 && response.result) {
                    var productsContainer = $('#productsContainer');
                    productsContainer.empty();
                    response.result.forEach(product => {
                        var productHtml = `
                            <div class="col-md-4 mb-4 product-card">
                                <div class="card h-100">
                                    <img src="${product.image}" class="card-img-top product-image" alt="${product.title}">
                                    <div class="card-body">
                                        <h5 class="card-title">${product.title}</h5>
                                        <p class="card-text">Category: ${product.subcategory}</p>
                                        <p class="card-text">$${product.price}</p>
                                        <button class="toggle-description-btn btn btn-link">Read more</button>
                                        <div class="product-description" style="display: none;">${product.description}</div>
                                        <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.product_id}">Add to Cart</button>
                                    </div>
                                </div>
                            </div>`;
                        productsContainer.append(productHtml);
                    });
                } else {
                    $('#productsContainer').html('<p>No products found.</p>');
                }
            },
            error: function () {
                console.error('Error searching products');
                $('#productsContainer').html('<p>Error searching products.</p>');
            }
        });
    }

    $(document).on('click', '#searchButton', function () {
        var keyword = $('#productSearch').val();
        searchProducts(keyword);
    });

	function loadProducts() {
        var subCategory = $('#subcategoryFilter').val();
        var minPrice = $('#minPrice').val();
        var maxPrice = $('#maxPrice').val();
        var sortOrder = $('#sortOrder').val();
        var url = 'http://172.17.15.81/cse383_final/final.php/getProduct?';

        if (subCategory !== "%") {
            url += 'subCategory=' + encodeURIComponent(subCategory) + '&';
        }

        if (minPrice !== "") {
            url += 'minPrice=' + minPrice + '&';
        }
        if (maxPrice !== "") {
            url += 'maxPrice=' + maxPrice + '&';
        }

        if (sortOrder !== "") {
            url += 'sortOrder=' + sortOrder;
        }

        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response.status === 0 && response.result) {
                    var productsContainer = $('#productsContainer');
                    productsContainer.empty();
                    response.result.forEach(product => {
                        var productHtml = `
                            <div class="col-md-4 mb-4 product-card">
                                <div class="card h-100">
                                    <img src="${product.image}" class="card-img-top product-image" alt="${product.title}">
                                    <div class="card-body">
                                        <h5 class="card-title">${product.title}</h5>
                                        <p class="card-text">Category: ${product.subcategory}</p>
                                        <p class="card-text">$${product.price}</p>
                                        <button class="toggle-description-btn btn btn-link">Read more</button> <!-- Add a button to toggle the description -->
                                        <div class="product-description" style="display: none;">${product.description}</div> <!-- Description section (initially hidden) -->
                                        <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.product_id}">Add to Cart</button>
                                    </div>
                                </div>
                            </div>`;
                        productsContainer.append(productHtml);
                    });
                } else {
                    $('#productsContainer').html('<p>No products found.</p>');
                }
            },
            error: function () {
                console.error('Error loading products');
                $('#productsContainer').html('<p>Error loading products.</p>');
            }
        });
    }

    $(document).on('click', '.add-to-cart-btn', function () {
        var productId = $(this).data('product-id');
        $.ajax({
            url: 'final.php?productId=' + productId,
            method: 'GET',
            dataType: 'json',
            success: function (response) {
                if (response.status === 0 && response.result) {
                    cart.addItem(response.result);
                } else {
                    console.error('Product details not found');
                }
            },
            error: function () {
                console.error('Error fetching product details');
            }
        });
    });

    $('#cartIcon').click(function () {
        console.log("Cart icon clicked");
        cart.viewCart();
    });

    $(document).on('click', '.remove-from-cart-btn', function () {
        var productId = $(this).data('product-id');
        cart.removeItem(productId);
    });

    $('#applyFilters').click(function () {
        loadProducts();
    });

    loadProducts();
});
