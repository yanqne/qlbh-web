var app = angular.module('myApp', []); // Tạo module duy nhất

const categoryApiUrl = 'http://localhost:8080/admin/category';
const productApiUrl = 'http://localhost:8080/admin/product';
const userApiUrl = 'http://localhost:8080/admin/account';
app.service('ApiService', ['$http', '$window', function ($http,$window) {
    const token = $window.localStorage.getItem('token');

    // Cấu hình mặc định cho tất cả các yêu cầu HTTP
    const defaultHeaders = token ? {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json' 
    } : {
        'Content-Type': 'application/json'
    };

    // GET request
    this.get = function (url) {
        return $http.get(url, { headers: defaultHeaders });
    };

    // POST request
    this.post = function (url, data) {
        return $http.post(url, data, { headers: defaultHeaders });
    };

    // DELETE request
    this.delete = function (url) {
        return $http.delete(url, { headers: defaultHeaders });
    };

    // PUT request
    this.put = function (url, data) {
        return $http.put(url, data, { headers: defaultHeaders });
    };
}]);

// Controller quản trị
// app.controller('AdminController', ['$scope', '$http', function ($scope, $http) {
//     // Kiểm tra trạng thái đăng nhập
//     const loggedInUser = localStorage.getItem('loggedInUser');
//     if (loggedInUser) {
//         $scope.loggedInUser = JSON.parse(loggedInUser);
//         if ($scope.loggedInUser.role !== 'admin') {
//             alert('Bạn không có quyền truy cập trang này.');
//             window.location.href = '/index.html';
//         }
//     } else {
//         alert('Vui lòng đăng nhập.');
//         window.location.href = '/login-req.html';
//     }

//     // Hàm logout
//     $scope.logout = function () {
//         localStorage.removeItem('loggedInUser');
//         alert('Bạn đã đăng xuất.');
//         window.location.href = '/login-req.html';
//     };
// }]);

// Controller danh mục
app.controller('CategoryController', ['$scope', 'ApiService', function ($scope, ApiService) {
    $scope.categories = [];
    $scope.errorMessage = null;
    $scope.newCategory = {}; // Thêm đối tượng mới cho category

    // Lấy danh sách danh mục
    ApiService.get(categoryApiUrl)
        .then(function (response) {
            $scope.categories = response.data.content; // Gắn danh sách danh mục
        })
        .catch(function (error) {
            console.error('Lỗi khi gọi API danh mục:', error);
            $scope.errorMessage = 'Không thể tải danh sách danh mục.';
        });

    // Thêm danh mục mới
    $scope.addCategory = function () {
        const categoryData = {
            name: $scope.newCategory.name  // Correct usage
        };

        // Kiểm tra xem người dùng đã nhập tên danh mục chưa
        if (!$scope.newCategory.name) {
            $scope.errorMessage = 'Vui lòng nhập tên danh mục.';
            return;
        }

        // Gửi yêu cầu POST để thêm danh mục mới
        ApiService.post(categoryApiUrl, categoryData)
            .then(function (response) {
                if (response.data) {
                    $scope.successMessage = 'Danh mục đã được thêm thành công!';
                    $scope.categories.push(response.data.content); // Thêm danh mục vào danh sách
                    $scope.newCategory.name = ''; // Làm sạch form
                } else {
                    $scope.errorMessage = response.data.message || 'Không thể thêm danh mục.';
                }
            })
            .catch(function (error) {
                console.error('Lỗi khi gửi yêu cầu POST:', error);
                $scope.errorMessage = 'Có lỗi xảy ra khi thêm danh mục.';
            });
    };


    // Xoá danh mục
    $scope.deleteCategory = function (id) {
        if (confirm('Bạn có chắc chắn muốn xóa?')) {
            ApiService.delete(`${categoryApiUrl}/delete/${id}`)
                .then(response => {
                    if (response.data.code === 1) {
                        $scope.successMessage = 'Xóa thành công!';
                        $scope.categories = $scope.categories.filter(category => category.id !== id);
                    } else {
                        $scope.errorMessage = response.data.message || 'Không thể xóa.';
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi xóa:', error);
                    $scope.errorMessage = 'Lỗi khi thực hiện xóa';
                });
        }
    };
    $scope.editCategory = function (category) {
        $scope.editableCategory = angular.copy(category); // Sao chép danh mục đang sửa
        $scope.newCategory = $scope.editableCategory; // Đổ dữ liệu vào form
    };

    // Hàm cập nhật danh mục
    $scope.updateCategory = function () {
        if ($scope.newCategory.name) {
            ApiService.put(`${categoryApiUrl}/${$scope.newCategory.id}`, $scope.newCategory)
                .then(function (response) {
                    if (response.data.code === 1) {
                        $scope.successMessage = 'Danh mục đã được cập nhật thành công!';
                        const index = $scope.categories.findIndex(c => c.id === $scope.newCategory.id);
                        if (index !== -1) {
                            $scope.categories[index] = response.data.data; // Cập nhật danh sách
                        }
                        $scope.newCategory = {}; // Reset form
                        $scope.editableCategory = null; // Hủy trạng thái chỉnh sửa
                    } else {
                        $scope.errorMessage = response.data.message || 'Không thể cập nhật danh mục.';
                    }
                })
                .catch(function (error) {
                    console.error('Lỗi khi cập nhật danh mục:', error);
                    $scope.errorMessage = 'Lỗi khi gửi dữ liệu.';
                });
        } else {
            $scope.errorMessage = 'Vui lòng nhập tên danh mục.';
        }
    };

    // Hủy chỉnh sửa danh mục
    $scope.cancelEdit = function () {
        $scope.newCategory = {}; // Reset form
        $scope.editableCategory = null; // Hủy trạng thái chỉnh sửa
    };
}]);
//Controller User
app.controller('UserController', ['$scope', 'ApiService', function ($scope, ApiService) {

    $scope.users = [];
    $scope.errorMessage = null;
    $scope.successMessage = null;
    $scope.newUser = {}; // Initialize newUser object to bind to the form fields

    // Load existing users
    ApiService.get(userApiUrl)
        .then(function (response) {
            $scope.users = response.data; // Gắn danh sách người dùng
        })
        .catch(function (error) {
            console.error('Lỗi khi gọi API Người dùng:', error);
            $scope.errorMessage = 'Không thể tải danh sách người dùng.';
        });

    // Add a new user
    $scope.addUser = function () {
        // Set the default role to 'user'
        $scope.newUser.role = 'user';

        // Check if all fields are provided before submitting the request
        if ($scope.newUser.username && $scope.newUser.password && $scope.newUser.fullName && $scope.newUser.phoneNumber) {
            ApiService.post(userApiUrl, $scope.newUser)
                .then(function (response) {
                    if (response.data.code === 1) {
                        $scope.successMessage = 'Thêm người dùng thành công!';
                        $scope.users.push(response.data); // Add the new user to the list
                        // Reset the form fields
                        $scope.newUser = {};
                    } else {
                        $scope.errorMessage = response.data.message || 'Không thể thêm người dùng.';
                    }
                })
                .catch(function (error) {
                    console.error('Lỗi khi thêm người dùng:', error);
                    $scope.errorMessage = 'Lỗi khi thực hiện thêm người dùng';
                });
        } else {
            $scope.errorMessage = 'Vui lòng điền đầy đủ thông tin.';
        }
    };
    // Delete user
    $scope.deleteUser = function (id) {
        if (confirm('Bạn có chắc chắn muốn xóa?')) {
            ApiService.delete(`${userApiUrl}/${id}`)
                .then(response => {
                    if (response.data) {
                        $scope.successMessage = 'Xóa thành công!';
                        // Update the users list after deletion
                        $scope.users = $scope.users.filter(user => user.id !== id);
                    } else {
                        $scope.errorMessage = response.data.message || 'Không thể xóa.';
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi xóa:', error);
                    $scope.errorMessage = 'Lỗi khi thực hiện xóa';
                });
        }
    };
    // Hàm sửa tài khoản (Hiển thị thông tin tài khoản lên form)
    $scope.editUser = function (user) {
        $scope.editableUser = angular.copy(user); // Sao chép tài khoản đang sửa
        $scope.newUser = $scope.editableUser; // Đổ dữ liệu vào form
    };

    // Hàm cập nhật tài khoản
    $scope.updateUser = function () {
        if ($scope.newUser.username && $scope.newUser.password && $scope.newUser.fullName && $scope.newUser.phoneNumber) {
            ApiService.put(`${userApiUrl}/${$scope.newUser.id}`, $scope.newUser)
                .then(function (response) {
                    if (response.data === 1) {
                        $scope.successMessage = 'Tài khoản đã được cập nhật thành công!';
                        const index = $scope.users.findIndex(u => u.id === $scope.newUser.id);
                        if (index !== -1) {
                            $scope.users[index] = response.data.data; // Cập nhật danh sách tài khoản
                        }
                        $scope.newUser = {}; // Reset form
                        $scope.editableUser = null; // Hủy trạng thái chỉnh sửa
                    } else {
                        $scope.errorMessage = response.data.message || 'Không thể cập nhật tài khoản.';
                    }
                })
                .catch(function (error) {
                    console.error('Lỗi khi cập nhật tài khoản:', error);
                    $scope.errorMessage = 'Lỗi khi gửi dữ liệu.';
                });
        } else {
            $scope.errorMessage = 'Vui lòng nhập đầy đủ thông tin.';
        }
    };

    // Hủy chỉnh sửa tài khoản
    $scope.cancelEdit = function () {
        $scope.newUser = {}; // Reset form
        $scope.editableUser = null; // Hủy trạng thái chỉnh sửa
    };
}]);

// Controller sản phẩm chính
app.controller('ProductController', ['$scope', 'ApiService', function ($scope, ApiService) {
    $scope.products = [];
    $scope.categories = [];
    $scope.errorMessage = null;

    // Lấy danh sách sản phẩm
    ApiService.get(productApiUrl)
        .then(response => {
            $scope.products = response.data;
        })
        .catch(error => {
            console.error('Lỗi khi gọi API sản phẩm:', error);
            $scope.errorMessage = 'Không thể tải danh sách sản phẩm.';
        });

    // Lấy danh sách danh mục
    ApiService.get(productApiUrl)
        .then(response => {
            console.log(response.data); // In ra dữ liệu từ API
            $scope.categories = response.data;
        })
        .catch(error => {
            console.error('Lỗi khi gọi API danh mục:', error);
        });
    $scope.loadProducts = function () {
        ApiService.get(productApiUrl)
            .then(response => {
                $scope.products = response.data;
            })
            .catch(error => {
                console.error('Lỗi khi gọi API sản phẩm:', error);
                $scope.errorMessage = 'Không thể tải danh sách sản phẩm.';
            });
    };
    // Hàm thêm sản phẩm mới
    $scope.addProduct = function () {
        // Kiểm tra nếu form hợp lệ
        if ($scope.addProductForm.$valid) {
            ApiService.post(productApiUrl, $scope.newProduct)
                .then(function (response) {
                    if (response.data) {
                        $scope.successMessage = 'Sản phẩm đã được thêm thành công!';
                        $scope.newProduct = {};  // Làm sạch form
                        alert('Sản phẩm đã được thêm thành công!')
                        $scope.loadProducts();
                    } else {
                        alert("Lỗi khi thêm sản phẩm")
                        $scope.errorMessage = response.data.message || 'Lỗi khi thêm sản phẩm';
                    }
                })
                .catch(function (error) {
                    console.error('Lỗi khi thêm sản phẩm:', error);
                    $scope.errorMessage = 'Lỗi khi gửi dữ liệu';
                });
        } else {
            $scope.errorMessage = 'Vui lòng kiểm tra lại thông tin nhập';
        }
    };
    //Xoá sản phẩm
    $scope.deleteProduct = function (id) {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            ApiService.delete(`${productUrl}/delete/${id}`)
                .then(response => {
                    if (response.data) {
                        $scope.successMessage = 'xóa thành công!';
                        // Cập nhật danh sách sản phẩm
                        $scope.products = $scope.products.filter(product => product.id !== id);
                    } else {
                        $scope.errorMessage = response.data.message || 'Không thể xóa.';
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi xóa:', error);
                    $scope.errorMessage = 'Lỗi khi thực hiện xóa';
                });
        }
    };
    $scope.editProduct = function (product) {
        $scope.editableProduct = angular.copy(product); // Sao chép sản phẩm đang sửa
        $scope.newProduct = angular.copy(product) // Đổ dữ liệu vào form
    };

    // Hàm cập nhật sản phẩm
    $scope.updateProduct = function () {
        if ($scope.addProductForm.$valid) {
            ApiService.put(`${productUrl}/${$scope.newProduct.id}`, $scope.newProduct)
                .then(function (response) {
                    if (response.data.code === 1) {
                        $scope.successMessage = 'Cập nhật sản phẩm thành công!';
                        // Cập nhật danh sách sản phẩm
                        $scope.loadProducts();
                        $scope.newProduct = {}; // Reset form
                        $scope.editableProduct = null; // Hủy trạng thái chỉnh sửa
                    } else {
                        $scope.errorMessage = response.data.message || 'Không thể cập nhật sản phẩm.';
                    }
                })
                .catch(function (error) {
                    console.error('Lỗi khi cập nhật sản phẩm:', error);
                    $scope.errorMessage = 'Lỗi khi gửi dữ liệu';
                });
        } else {
            $scope.errorMessage = 'Vui lòng kiểm tra lại thông tin nhập';
        }
    };

    // Hủy chỉnh sửa sản phẩm
    $scope.cancelEdit = function () {
        $scope.newProduct = {}; // Xóa dữ liệu trong form
        $scope.editableProduct = null; // Hủy trạng thái chỉnh sửa
    };

}]);
// Controller quản lý đơn hàng
app.controller('OrderController', ['$scope', 'ApiService', function ($scope, ApiService) {
    const orderApiUrl = 'http://localhost:5000/api/order';

    $scope.orders = [];
    $scope.errorMessage = null;

    // Gọi API để lấy danh sách đơn hàng
    ApiService.get(orderApiUrl)
        .then(function (response) {
            if (response.data.code === 1) {
                $scope.orders = response.data.data; // Gán danh sách đơn hàng vào scope
            } else {
                $scope.errorMessage = 'Không thể tải danh sách đơn hàng.';
            }
        })
        .catch(function (error) {
            console.error('Lỗi khi gọi API đơn hàng:', error);
            $scope.errorMessage = 'Đã xảy ra lỗi khi tải danh sách đơn hàng.';
        });
    // Chuyển đến trang chi tiết đơn hàng
    $scope.viewOrderDetails = function (orderId) {
        // Điều hướng đến trang chi tiết đơn hàng sử dụng window.location
        window.location.href = `Admin-OrderDetails.html?orderId=${orderId}`;
    };
}]);
app.controller('OrderDetailController', ['$scope', '$http', '$location', '$window', function ($scope, $http, $location, $window) {
    const apiUrl = 'http://localhost:5000/api/order-detail';
    $scope.orderDetails = {};
    $scope.errorMessage = null;

    const token = $window.localStorage.getItem('token');
    // Lấy orderId từ URL
    const urlParams = new URLSearchParams($location.absUrl().split('?')[1]);
    const orderId = urlParams.get('orderId');
    // Gọi API để lấy chi tiết đơn hàng
    if (orderId) {
        $http.get(`${apiUrl}/list-by-order/${orderId}`,{
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
            .then(function (response) {
                if (response.data.code === 1) {
                    $scope.orderDetails = response.data.data; // Gán chi tiết đơn hàng vào scope
                } else {
                    $scope.errorMessage = 'Không thể tải chi tiết đơn hàng.';
                }
            })
            .catch(function (error) {
                console.error('Lỗi khi gọi API chi tiết đơn hàng:', error);
                $scope.errorMessage = 'Đã xảy ra lỗi khi tải chi tiết đơn hàng.';
            });
    } else {
        $scope.errorMessage = 'Không tìm thấy orderId trong URL.';
    }
}]);

