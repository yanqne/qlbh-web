var app = angular.module('authApp', []);

app.controller('AuthController1', function($scope, $http) {
    // State để điều khiển form nào hiển thị
    $scope.activeForm = 'login'; // Mặc định là form Login

    // Dữ liệu cho form
    $scope.loginData = {};
    $scope.registerData = {
        admin: false, // Mặc định admin=false
        activated: true // Mặc định activated=true
    };

    // Thông báo kết quả
    $scope.loginMessage = '';
    $scope.registerMessage = '';

    // Chuyển đổi giữa 2 form
    $scope.toggleForm = function(form) {
        $scope.activeForm = form;
        $scope.loginMessage = '';
        $scope.registerMessage = '';
    };

    // Xử lý đăng nhập
// $scope.login = function() {
//     $http.post('http://localhost:8080/auth/login', $scope.loginData)
    
//         .then(function(response) {
//             // Hiển thị token trên console
//             console.log(response.data.token); // In token lên console

//             // Hiển thị thông báo đăng nhập thành công
//             $scope.loginMessage = "Login successful!";

//             // Lưu token vào localStorage
//             localStorage.setItem('token', response.data.token);
//             console.log(localStorage.getItem('token'));
//         })
//         .catch(function(error) {
//             // Kiểm tra lỗi và hiển thị thông báo phù hợp
//             $scope.loginMessage = error.data && error.data.message
//                 ? "Login failed: " + error.data.message
//                 : "Login failed: Unknown error";

//             console.error('Login error:', error); // Hiển thị lỗi trên console
//         });
// };
$scope.login = function() {
    $http.post('http://localhost:8080/auth/login', $scope.loginData)
        .then(function(response) {
            // Lấy token từ server
            const token = response.data.token;

            if (token) {
                // Lưu token vào localStorage
                localStorage.setItem('token', token);

                // Cập nhật token cho CartService
                CartService.setToken(token);

                // Hiển thị thông báo đăng nhập thành công
                $scope.loginMessage = "Login successful!";
                console.log("Token saved:", token);

                // Chuyển hướng người dùng đến trang chính
                window.location.href = 'home.html';
            } else {
                $scope.loginMessage = "Login failed: Token is missing.";
            }
        })
        .catch(function(error) {
            // Kiểm tra lỗi và hiển thị thông báo phù hợp
            $scope.loginMessage = error.data && error.data.message
                ? "Login failed: " + error.data.message
                : "Login failed: Unknown error";

            console.error('Login error:', error);
        });
};


// Xử lý đăng ký
$scope.register = function() {
    $http.post('http://localhost:8080/auth/register', $scope.registerData)
        .then(function(response) {
            $scope.registerMessage = "Registration successful!";
        })
        .catch(function(error) {
            // Kiểm tra lỗi và hiển thị thông báo phù hợp
            $scope.registerMessage = error.data && error.data.message
                ? "Registration failed: " + error.data.message
                : "Registration failed: Unknown error";
        });
};
});
app.controller('AuthController', function($scope, $http, $window) {
    // State để điều khiển form nào hiển thị
    $scope.activeForm = 'login'; // Mặc định là form Login
    $scope.isLoggedIn = localStorage.getItem('token') ? true : false;
    // Dữ liệu cho form
    $scope.loginData = {};
    $scope.registerData = {
        admin: false, // Mặc định admin=false
        activated: true // Mặc định activated=true
    };

    // Thông báo kết quả
    $scope.loginMessage = '';
    $scope.registerMessage = '';

    // Chuyển đổi giữa 2 form
    $scope.toggleForm = function(form) {
        $scope.activeForm = form;
        $scope.loginMessage = '';
        $scope.registerMessage = '';
    };

    // Xử lý đăng nhập
    $scope.login = function() {
        $http.post('http://localhost:8080/auth/login', $scope.loginData)
            .then(function(response) {
                console.log("hehe");
                // Lấy token và vai trò từ phản hồi
                const token = response.data.token;
                const isAdmin = response.data.admin; // API cần trả về `admin` flag.

                // Lưu token vào localStorage
                localStorage.setItem('token', token);

                // Điều hướng dựa vào vai trò
                if (isAdmin) {
                    $window.location.href = '/Admin/Admin-Product.html'; // Đường dẫn tới trang admin
                } else {
                    $window.location.href = 'store.html'; // Đường dẫn tới trang store
                }
            })
            .catch(function(error) {
                // Xử lý lỗi đăng nhập
                $scope.loginMessage = error.data && error.data.message
                    ? "Login failed: " + error.data.message
                    : "Login failed: Unknown error";
                console.error('Login error:', error);
            });
    };

    // Xử lý đăng ký
    $scope.register = function() {
        $http.post('http://localhost:8080/auth/register', $scope.registerData)
            .then(function(response) {
                $scope.registerMessage = "Registration successful!";
            })
            .catch(function(error) {
                $scope.registerMessage = error.data && error.data.message
                    ? "Registration failed: " + error.data.message
                    : "Registration failed: Unknown error";
            });
    };
    $scope.logout = function() {
        // Xóa token khỏi localStorage
        localStorage.removeItem('token');
        $scope.isLoggedIn = false; // Người dùng đã đăng xuất
    };
});