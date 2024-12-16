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
app.controller('FilterProductController', ['$scope', '$http', function ($scope, $http) {

    $scope.categories = []; // Danh sách danh mục
    $scope.products = []; // Danh sách tất cả sản phẩm
    $scope.filteredProducts = []; // Danh sách sản phẩm đã lọc
    $scope.selectedCategory = null; // Danh mục được chọn

    // Lấy danh sách danh mục từ API
    $http.get(categoryUrl)
        .then(function (response) {
            if (response.data && response.data) {
                $scope.categories = response.data; // Gán danh sách danh mục vào scope
            } else {
                console.error('Dữ liệu danh mục không hợp lệ:', response.data);
            }
        })
        .catch(function (error) {
            console.error('Lỗi khi tải danh mục:', error);
        });

    // Lấy danh sách sản phẩm từ API
    $http.get(productUrl)
        .then(function (response) {
            if (response.data) {
                $scope.products = response.data; // Gán danh sách sản phẩm vào scope
                $scope.filteredProducts = $scope.products; // Mặc định hiển thị tất cả sản phẩm
            } else {
                console.error('Dữ liệu sản phẩm không hợp lệ:', response.data);
            }
        })
        .catch(function (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
        });

    // Hàm lọc sản phẩm theo danh mục
    $scope.selectCategory = function (categoryId) {
        $scope.selectedCategory = categoryId;

        if (categoryId === null) {
            // Hiển thị tất cả sản phẩm
            $scope.filteredProducts = $scope.products;
        } else {
            // Lọc sản phẩm theo danh mục
            $scope.filteredProducts = $scope.products.filter(function (product) {
                return product.category.id === categoryId;
            });
        }
    };
}]);
app.controller('ProductDetailController', ['$scope', '$location', 'ApiService', function ($scope, $location, ApiService) {

    $scope.product = null; // Chi tiết sản phẩm
    $scope.errorMessage = null;
    $scope.successMessage = null;

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
app.controller('AuthController', function($scope, $window) {
    // Kiểm tra nếu có token trong localStorage hoặc sessionStorage
    $scope.isLoggedIn = $window.localStorage.getItem('authToken') !== null;  // Kiểm tra token

    // Hàm logout
    $scope.logout = function() {
        // Xóa token khi logout
        $window.localStorage.removeItem('authToken');
        $scope.isLoggedIn = false;  // Cập nhật trạng thái đăng nhập
        // Các bước logout khác nếu cần, ví dụ gọi API logout...
    };

    // Hàm login (giả sử bạn lấy token từ server và lưu vào localStorage)
    $scope.login = function(token) {
        // Giả sử đăng nhập thành công và nhận được token từ server
        $window.localStorage.setItem('authToken', token);  // Lưu token vào localStorage
        $scope.isLoggedIn = true;
    };
});