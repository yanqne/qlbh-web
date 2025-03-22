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
        // Kiểm tra nếu username hoặc password bị trống
        if (!$scope.loginData || !$scope.loginData.username || !$scope.loginData.password) {
            if (!$scope.loginData.username && !$scope.loginData.password) {
                $scope.loginMessage = "yêu cầu nhập thông tin";
            } else if (!$scope.loginData.username) {
                $scope.loginMessage = "Username không được để trống";
            } else {
                $scope.loginMessage = "Password không được để trống";
            }
            return;
        }
    
        // Kiểm tra username không hợp lệ (có ký tự đặc biệt hoặc chỉ chứa khoảng trắng)
        if (/[^a-zA-Z0-9]/.test($scope.loginData.username)) {
            $scope.loginMessage = "Username không hợp lệ";
            return;
        }
        
        // Kiểm tra password có ít nhất 6 ký tự
        if ($scope.loginData.password.length < 6) {
            $scope.loginMessage = "Password phải có ít nhất 6 ký tự";
            return;
        }
    
        // Gửi yêu cầu đăng nhập tới server
        $http.post('http://localhost:8080/auth/login', $scope.loginData)
            .then(function(response) {
                const token = response.data.token;
                const isAdmin = response.data.admin;
                const username = $scope.loginData.username;
                localStorage.setItem('token', token);
                localStorage.setItem('isAdmin', isAdmin);
                localStorage.setItem('username', username);
                alert("Đăng nhập thành công");
                if (isAdmin) {
                    $window.location.href = '/Admin/Admin-Product.html';
                } else {
                    $window.location.href = 'store.html';
                }
            })
            .catch(function(error) {
                $scope.loginMessage = error.data && error.data.message
                    ? "Login thất bại: " + error.data.message + "'"
                    : "Login failed: Sai tên đăng nhập hoặc mật khẩu";
                console.error('Thất bại:', error);
            });
    };
    

    // Xử lý đăng ký
    $scope.register = async function() {
        $scope.registerMessage = ""; // Xóa thông báo cũ
    
        // Nếu không có dữ liệu, hiển thị lỗi yêu cầu nhập
        if (!$scope.registerData) {
            $scope.registerMessage = "Vui lòng nhập đầy đủ thông tin.";
            return;
        }
    
        const { username, password, email, fullname } = $scope.registerData;
    
        if (!fullname || fullname.trim() === "") {
            $scope.registerMessage = "Fullname không được để trống.";
            return;
        }
    
        if (!username || username.trim() === "") {
            $scope.registerMessage = "Username không được để trống.";
            return;
        }
    
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            $scope.registerMessage = "Username không hợp lệ.";
            return;
        }
    
        if (!password || password.trim() === "") {
            $scope.registerMessage = "Password không được để trống.";
            return;
        }
    
        if (password.length < 6) {
            $scope.registerMessage = "Password phải có ít nhất 6 ký tự.";
            return;
        }
    
        if (!email || email.trim() === "") {
            $scope.registerMessage = "Email không được để trống.";
            return;
        }
    
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            $scope.registerMessage = "Email không hợp lệ.";
            return;
        }
    
        $http.post('http://localhost:8080/auth/register', $scope.registerData)
        .then(function(response) {
            console.log("Test"); // In ra để kiểm tra
            $scope.registerMessage = "Registration successful!";
        })
        .catch(function(error) {
            console.error("Lỗi:", error);
            if (error.data && error.data.error) {
                console.log(error.data);
                const errorMsg = error.data.error; // Lấy lỗi từ API trả về
                if (errorMsg.includes("Username already exists")) {
                    $scope.registerMessage = "Username đã tồn tại.";
                } else if (errorMsg.includes("Email already exists")) {
                    $scope.registerMessage = "Email đã được sử dụng.";
                } else {
                    $scope.registerMessage = "Đăng ký thất bại: " + errorMsg;
                }
            } else {
                $scope.registerMessage = "Đăng ký thất bại: Lỗi không xác định.";
            }
        });
    
    };
    
});
