var app = angular.module('authApp', []);

app.controller('AuthController', function($scope, $http, $window) {
    // State để điều khiển form nào hiển thị
    $scope.activeForm = 'login'; // Mặc định là form Login
    $scope.isLoggedIn = localStorage.getItem('token') ? true : false;
    // Dữ liệu cho form
    $scope.username = null;
    $scope.loginData = {
        
    };
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
                // Lấy token và vai trò từ phản hồi
                const token = response.data.token;
                const isAdmin = response.data.admin; // API cần trả về `admin` flag.
                const username = $scope.loginData.username;
                // Lưu token vào localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('isAdmin', isAdmin)
                localStorage.setItem('username', username);
                // Điều hướng dựa vào vai trò
                alert("Đăng nhập thành công")
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
                    : "Login failed: Sai tên đăng nhập hoặc mật khẩu";
                console.error('Thất bại:', error);
            });
    };

    // Xử lý đăng ký
    $scope.register = function() {
        $http.post('http://localhost:8080/auth/register', $scope.registerData, {
            transformResponse: function(data) {
                // Trả về dữ liệu gốc mà không parse
                return data;
            }
        }).then(function(response) {
            $scope.registerMessage = "Registration successful!";
        }).catch(function(error) {
            console.error("Error:", error);
            $scope.registerMessage = error.data && error.data.message
                ? "Registration failed: " + error.data.message
                : "Registration failed: Unknown error";
        });
    };
});
