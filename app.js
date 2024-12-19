var app = angular.module('myApp', []);

app.directive('headerSection', function() {
    return {
        restrict: 'E',
        templateUrl: 'header.html'
    };
});
app.directive('footerSection', function() {
    return {
        restrict: 'E',
        templateUrl: 'footer.html'
    };
});
app.directive('navigationSection', function(){
    return{
        restrict: 'E',
        templateUrl: 'navigation.html'
    };
})
const categoryUrl='http://localhost:8080/admin/categories/index'
const productUrl='http://localhost:8080/admin/product/index';
// Service để xử lý API
app.service('ApiService', ['$http', function ($http) {
    this.get = function (url) {
        return $http.get(url);
    };

    this.post = function (url, data) {
        return $http.post(url, data);
    };
}]);
app.service('AuthService', function () {
    // Giả sử bạn đã lưu thông tin người dùng sau khi đăng nhập, chẳng hạn trong localStorage
    this.getUsername = function () {
        return localStorage.getItem('username'); // Hoặc lấy từ cookie, session, v.v.
    };
});
app.controller('FilterProductController', ['$scope', 'ApiService', function ($scope, ApiService) {

    $scope.categories = []; // Danh sách danh mục
    $scope.products = []; // Danh sách tất cả sản phẩm
    $scope.filteredProducts = []; // Danh sách sản phẩm đã lọc
    $scope.paginatedProducts = []; // Danh sách sản phẩm cho trang hiện tại
    $scope.selectedCategory = null; // Danh mục được chọn
    $scope.searchKeywords = ''; // Từ khóa tìm kiếm
    $scope.product = null;

    // Phân trang
    $scope.currentPage = 1; // Trang hiện tại
    $scope.itemsPerPage = 10; // Số sản phẩm mỗi trang
    $scope.totalPages = 0; // Tổng số trang

    // Lấy danh sách danh mục từ API
    ApiService.get(categoryUrl)
        .then(function (response) {
            if (response.data) {
                $scope.categories = response.data;
            } else {
                console.error('Dữ liệu danh mục không hợp lệ:', response.data);
            }
        })
        .catch(function (error) {
            console.error('Lỗi khi tải danh mục:', error);
        });

    // Lấy danh sách sản phẩm từ API
    ApiService.get(productUrl)
        .then(function (response) {
            if (response.data) {
                $scope.products = response.data;
                $scope.filterProducts(); // Áp dụng bộ lọc ban đầu
            } else {
                console.error('Dữ liệu sản phẩm không hợp lệ:', response.data);
            }
        })
        .catch(function (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
        });

    // Hàm lọc sản phẩm theo danh mục và từ khóa
    $scope.filterProducts = function () {
        $scope.filteredProducts = $scope.products.filter(function (product) {
            const matchesCategory =
                !$scope.selectedCategory || product.categoryId === $scope.selectedCategory;
            const matchesKeywords =
                !$scope.searchKeywords || product.name.toLowerCase().includes($scope.searchKeywords.toLowerCase());
            return matchesCategory && matchesKeywords;
        });
        $scope.totalPages = Math.ceil($scope.filteredProducts.length / $scope.itemsPerPage); // Tính tổng số trang
        $scope.currentPage = 1; // Reset về trang đầu tiên
        $scope.updatePaginatedProducts();
    };

    // Cập nhật danh sách sản phẩm cho trang hiện tại
    $scope.updatePaginatedProducts = function () {
        const startIndex = ($scope.currentPage - 1) * $scope.itemsPerPage;
        const endIndex = startIndex + $scope.itemsPerPage;
        $scope.paginatedProducts = $scope.filteredProducts.slice(startIndex, endIndex);
    };

    // Chuyển sang trang khác
    $scope.goToPage = function (page) {
        if (page >= 1 && page <= $scope.totalPages) {
            $scope.currentPage = page;
            $scope.updatePaginatedProducts();
        }
    };

    // Hàm chọn danh mục
    $scope.selectCategory = function (categoryId) {
        $scope.selectedCategory = categoryId || null;
        $scope.filterProducts();
    };

    // Hàm tìm kiếm
    $scope.search = function () {
        $scope.filterProducts();
    };
}]);


app.controller('ProductDetailController', ['$scope', '$location', 'ApiService','CartService', function ($scope, $location, ApiService,CartService) {

    $scope.product = null; // Chi tiết sản phẩm
    $scope.errorMessage = null;

    // Lấy ID sản phẩm từ URL
    const urlParams = new URLSearchParams($location.absUrl().split('?')[1]);
    const productId = urlParams.get('id');

    // Kiểm tra và tải thông tin sản phẩm
    if (productId) {
        ApiService.get(`http://localhost:8080/admin/product/edit/${productId}`)
            .then(function (response) {
                if (response.data) {
                    $scope.product = response.data;
                } else {
                    $scope.errorMessage = 'Không thể tải thông tin chi tiết sản phẩm.';
                }
            })
            .catch(function (error) {
                console.error('Lỗi khi tải chi tiết sản phẩm:', error);
                $scope.errorMessage = 'Lỗi trong quá trình tải dữ liệu sản phẩm.';
            });
    } else {
        $scope.errorMessage = 'Không tìm thấy sản phẩm.';
    }
    $scope.addToCart = function () {
        try {
            if ($scope.product) {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
                    return;
                }
    
                CartService.addToCart({
                    id: $scope.product.id,
                    name: $scope.product.name,
                    price: $scope.product.price
                });
                $scope.successMessage = `Sản phẩm "${$scope.product.name}" đã được thêm vào giỏ hàng!`;
            }
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
            $scope.errorMessage = 'Lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại!';
        }
    };    
}]);
app.controller('LogoutController', function($scope, $window) {
    // Hàm logout
    $scope.logout = function() {
        // Xóa token khỏi localStorage
        localStorage.removeItem('token');
        
        // Chuyển hướng về trang đăng nhập
        $window.location.href = '/login-register.html';
    };
});
app.controller('HeaderController', ['$scope', 'CartService', '$window', function ($scope, CartService, $window) {
    // Kiểm tra trạng thái đăng nhập
    $scope.isLoggedIn = false; // Giá trị mặc định là chưa đăng nhập
    $scope.isAdmin = false; // Giá trị mặc định là không phải admin

    // Kiểm tra nếu có token trong localStorage
    var token = localStorage.getItem('token');
    if (token) {
        $scope.isLoggedIn = true;
        
        // Kiểm tra nếu người dùng là admin
        const isAdmin = localStorage.getItem('isAdmin');
        $scope.isAdmin = isAdmin === 'true'; // Nếu isAdmin là 'true', người dùng là admin
    }

    // Hàm logout
    $scope.logout = function () {
        // Lưu giỏ hàng hiện tại vào key cố định
        const currentCart = CartService.getCart().items;
        localStorage.setItem('guest_cart', JSON.stringify(currentCart));

        // Xóa token khỏi localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin'); // Xóa thông tin admin khi logout
        $scope.isLoggedIn = false; // Người dùng đã đăng xuất
        $scope.isAdmin = false; // Không còn là admin
    };

    // Hàm chuyển hướng đến trang quản lý admin
    $scope.goToAdmin = function () {
        $window.location.href = '/Admin/Admin-Product.html'; // Đường dẫn tới trang quản lý admin
    };
}]);

app.service('CartService', function () {
    let cart = []; // Biến tạm chứa giỏ hàng
    let token = localStorage.getItem('token'); // Lấy token của người dùng
    let username = localStorage.getItem('username')

    // Hàm lấy key dựa trên token
    function getCartKey() {
        return token ? `cart_${token}` : null; // Key lưu trữ sẽ là 'cart_token'
    }
    // Hàm khởi tạo giỏ hàng từ localStorage
    function loadCart() {
        const cartKey = getCartKey();
        if (cartKey) {
            const savedCart = JSON.parse(localStorage.getItem(cartKey));
            cart = Array.isArray(savedCart) ? savedCart : [];
        } else {
            cart = []; // Nếu không có token, khởi tạo giỏ hàng trống
        }
    }
    this.updateCart = function (item) {
        // Tìm sản phẩm trong giỏ hàng
        const existingProduct = cart.find(cartItem => cartItem.id === item.id);
    
        if (existingProduct) {
            // Cập nhật số lượng của sản phẩm nếu tồn tại
            existingProduct.quantity = item.quantity;
        }
    
        // Lưu lại giỏ hàng sau khi cập nhật
        saveCart();
    };
    // Lưu giỏ hàng vào localStorage
    function saveCart() {
        const cartKey = getCartKey();
        if (cartKey) {
            localStorage.setItem(cartKey, JSON.stringify(cart));
        }
    }

    loadCart(); // Khởi chạy load cart

    // Thêm sản phẩm vào giỏ hàng
    this.addToCart = function (product) {
        const existingProduct = cart.find(item => item.id === product.id);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            product.quantity = 1;
            cart.push(product);
        }
        saveCart(); // Lưu giỏ hàng
    };

    // Lấy toàn bộ giỏ hàng
    this.getCart = function () {
        return {
            items: cart,
            totalAmount: cart.reduce((total, product) => total + product.price * product.quantity, 0)
        };
    };

    // Xóa sản phẩm khỏi giỏ hàng
    this.removeFromCart = function (productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart(); // Cập nhật localStorage
    };

    // Xóa toàn bộ giỏ hàng
    this.clearCart = function () {
        cart = [];
        saveCart();
    };

    // Hàm reset token khi người dùng đăng nhập lại
    this.setToken = function(newToken) {
        token = newToken;
        const guestCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
        loadCart(); // Tải giỏ hàng từ token mới
        guestCart.forEach(product => this.addToCart(product)); // Hợp nhất giỏ hàng cũ
        localStorage.removeItem('guest_cart'); // Xóa dữ liệu cũ
    };
});
app.controller('CartController', ['$scope', '$http', 'CartService', '$window', function ($scope, $http, CartService, $window) {
    $scope.products = []; // Danh sách sản phẩm
    $scope.errorMessage = null; // Thông báo lỗi

    // Lấy danh sách sản phẩm từ API
    $http.get(productUrl)
        .then(function (response) {
            $scope.products = response.data; // Gán danh sách sản phẩm vào scope
        })
        .catch(function (error) {
            console.error('Lỗi khi gọi API:', error);
            $scope.errorMessage = 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau!';
        });

    // Lấy giỏ hàng từ CartService
    $scope.cart = CartService.getCart();

    // Thêm sản phẩm vào giỏ hàng
    $scope.addToCart = function (product) {
        CartService.addToCart(product);
        $scope.cart = CartService.getCart(); // Cập nhật giỏ hàng
    };

    // Xóa sản phẩm khỏi giỏ hàng
    // Xóa 1 sản phẩm khỏi giỏ hàng
    $scope.removeFromCart = function (productId) {
        CartService.removeFromCart(productId);
        $scope.cart = CartService.getCart(); // Cập nhật giỏ hàng
    };

    // Xóa 1 đơn vị sản phẩm khỏi giỏ hàng
    this.removeFromCart = function (productId) {
        const cart = this.getCart();
        const existingItem = cart.items.find(item => item.id === productId);

        if (existingItem) {
            // Giảm số lượng
            existingItem.quantity -= 1;
            existingItem.price -= existingItem.price / (existingItem.quantity + 1);

            // Nếu số lượng là 0, xóa sản phẩm khỏi giỏ hàng
            if (existingItem.quantity === 0) {
                cart.items = cart.items.filter(item => item.id !== productId);
            }

            // Cập nhật tổng giá tiền
            cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price, 0);
            this.saveCart(cart);
        }
    };
    // Xóa toàn bộ giỏ hàng
    $scope.clearCart = function () {
        CartService.clearCart();
        $scope.cart = CartService.getCart(); // Cập nhật giỏ hàng
    };
    $scope.placeOrder = function () {
        if (!$scope.cart.items.length) {
            $scope.errorMessage = 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.';
            alert('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
            return;
        }
    
        // Tính tổng tiền
        const totalAmount = $scope.cart.items.reduce(
            (sum, item) => sum + item.price * item.quantity, // Tính tổng giá tiền của tất cả sản phẩm trong giỏ hàng
            0
        );
    
        // Chuẩn bị dữ liệu order
        const orderData = {
            totalAmount: totalAmount,
            createOrderDetails: $scope.cart.items.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))
        };
    
        const token = $window.localStorage.getItem('token');
        
        // Kiểm tra nếu token đã tồn tại
        if (!token) {
            alert('Phiên đăng nhập của bạn đã hết hạn hoặc không tồn tại. Vui lòng đăng nhập lại!');
            return;
        }
    
        // Gửi API để tạo đơn hàng
        $http.post('http://localhost:8080/order/create', orderData, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(function (orderResponse) {
            // Log toàn bộ phản hồi để kiểm tra
            console.log('Order Response:', orderResponse.data);
    
            // Kiểm tra phản hồi từ API
            if (orderResponse.data.code === 1) {
                // Xóa giỏ hàng sau khi đặt hàng thành công
                CartService.clearCart();
                $scope.cart = CartService.getCart();
                alert('Đơn hàng của bạn đã được đặt thành công!');
                $scope.successMessage = 'Đơn hàng của bạn đã được đặt thành công!';
            } else {
                console.error('Không thể tạo đơn hàng:', orderResponse.data.message || 'Lỗi không xác định');
                $scope.errorMessage = 'Không thể tạo đơn hàng. Vui lòng thử lại!';
            }
        })
        .catch(function (error) {
            console.error('Lỗi khi đặt hàng:', error);
            if (error.status === 401) {
                alert('Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại!');
            } else {
                $scope.errorMessage = 'Lỗi khi xử lý đơn hàng. Vui lòng thử lại!';
            }
        });
    };
     
}]);
app.service('OrderService', function ($http) {
    const baseUrl = 'http://localhost:8080/order';

    const token = localStorage.getItem('token');

    // Gửi yêu cầu tạo đơn hàng
    this.createOrder = function (orderData) {
        return $http.post(`${baseUrl}/create`, orderData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    };

    // Lấy danh sách đơn hàng
    this.getOrders = function () {
        return $http.get(`${baseUrl}/list`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    };

    // Lấy chi tiết đơn hàng
    this.getOrderDetails = function (orderId) {
        return $http.get(`${baseUrl}/detail/${orderId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    };

    // Cập nhật trạng thái đơn hàng
    this.updateOrderStatus = function (orderId, statusData) {
        return $http.put(`${baseUrl}/update-status/${orderId}`, statusData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    };
});
app.controller('OrderController', function ($scope, OrderService, CartService, AuthService, ApiService) {
    $scope.orderData = {
        username: '', // Tên tài khoản người dùng
        address: '',
        numberPhone: '',
        orderDetails: [] // Danh sách sản phẩm trong đơn hàng
    };

    $scope.cart = []; // Giỏ hàng của người dùng
    $scope.totalAmount = 0;

    // Lấy giỏ hàng từ CartService
    $scope.loadCart = function () {
        const cartData = CartService.getCart();
        $scope.cart = cartData.items;
        $scope.calculateTotal(); // Tính tổng tiền
    };

    // Lấy thông tin người dùng từ AuthService và tự động điền vào trường username
    $scope.loadUser = function () {
        $scope.orderData.username = AuthService.getUsername();
    };

    // Hàm tính tổng tiền
    $scope.calculateTotal = function () {
        $scope.totalAmount = $scope.cart.reduce(function (total, item) {
            return total + item.quantity * item.price;
        }, 0);
    };

    // Hàm cập nhật số lượng sản phẩm
    $scope.updateQuantity = function (item) {
        if (item.quantity < 1) {
            item.quantity = 1; // Đảm bảo số lượng không nhỏ hơn 1
        }
        ApiService.get(`http://localhost:8080/admin/product/edit/${item.id}`)
            .then(function (response) {
                if (response.success = 200) {
                    if(response.data.quality<item.quantity){
                        alert("Sản phẩm không đủ số lượng")
                        item.quantity = response.data.quality
                    }else{
                        CartService.updateCart(item); // Cập nhật lại giỏ hàng trong CartService
                        $scope.calculateTotal(); // Tính lại tổng tiền
                    }
                }
            })
            .catch(function (error) {
                console.error('Lỗi khi tải chi tiết sản phẩm:', error);
                alert("Error")
            });
    };

    // Tạo đơn hàng
    $scope.createOrder = function () {
        // Chuẩn bị dữ liệu đơn hàng từ giỏ hàng
        $scope.orderData.orderDetails = $scope.cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));

        // Gửi yêu cầu tạo đơn hàng
        OrderService.createOrder($scope.orderData)
            .then(function (response) {
                alert('Order created successfully!');
                console.log(response.data);

                // Xóa giỏ hàng sau khi đặt hàng thành công
                CartService.clearCart();
                $scope.loadCart();
                window.location.href = 'store.html';
            })
            .catch(function (error) {
                alert('Error creating order. Please try again.');
                console.error(error);
            });
    };

    // Khởi tạo giỏ hàng và thông tin người dùng
    $scope.loadCart();
    $scope.loadUser(); // Lấy username từ AuthService và tự động điền vào orderData
});

app.controller('MainController', function($scope, $window) {
    // Kiểm tra nếu người dùng là admin
    const isAdmin = localStorage.getItem('isAdmin');
    $scope.isAdmin = isAdmin === 'true'; // Kiểm tra nếu isAdmin là true thì hiển thị nút

    // Hàm chuyển hướng đến trang quản lý
    $scope.goToAdmin = function() {
        $window.location.href = '/Admin/Admin-Product.html'; // Đường dẫn tới trang admin
    };
});
