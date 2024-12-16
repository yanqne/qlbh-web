var app = angular.module('myApp', []); // Tạo module duy nhất
app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;

            element.bind('change', function () {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);



const categoryApiUrl = 'http://localhost:8080/admin/categories/index';
const productApiUrl = 'http://localhost:8080/admin/product/index';
const userApiUrl = 'http://localhost:8080/admin/account';

app.service('ApiService', ['$http', '$window', function ($http, $window) {
    const token = $window.localStorage.getItem('token');

    // Cấu hình mặc định cho tất cả các yêu cầu HTTP
    const defaultHeaders = token ? {
        'Authorization': 'Bearer ' + token
    } : {};

    // POST request
    this.post = function (url, data, config = {}) {
        // Kiểm tra nếu data là FormData thì không thiết lập Content-Type
        if (data instanceof FormData) {
            // Nếu là FormData, không cần chỉ định Content-Type vì AngularJS sẽ tự động thiết lập là multipart/form-data
            config.headers = config.headers || {};
            config.headers['Content-Type'] = undefined;  // Để AngularJS tự thiết lập Content-Type là multipart/form-data
        } else {
            // Nếu không phải FormData, thiết lập Content-Type là application/json
            config.headers = config.headers || {};
            config.headers['Content-Type'] = 'application/json';
        }

        return $http.post(url, data, config);
    };

    // Các phương thức khác (GET, DELETE, PUT)
    this.get = function (url) {
        return $http.get(url, { headers: defaultHeaders });
    };

    this.delete = function (url) {
        return $http.delete(url, { headers: defaultHeaders });
    };

    this.put = function (url, data,config = {}) {
        if (data instanceof FormData) {
            // Nếu là FormData, không cần chỉ định Content-Type vì AngularJS sẽ tự động thiết lập là multipart/form-data
            config.headers = config.headers || {};
            config.headers['Content-Type'] = undefined;  // Để AngularJS tự thiết lập Content-Type là multipart/form-data
        } else {
            // Nếu không phải FormData, thiết lập Content-Type là application/json
            config.headers = config.headers || {};
            config.headers['Content-Type'] = 'application/json';
        }

        return $http.put(url, data, config);
    };
}]);
// Controller danh mục
app.controller('CategoryController', ['$scope', 'ApiService', function ($scope, ApiService) {
    $scope.categories = [];
    $scope.errorMessage = null;
    $scope.newCategory = {}; // Thêm đối tượng mới cho category

    // Lấy danh sách danh mục
    ApiService.get(categoryApiUrl)
        .then(function (response) {
            $scope.categories = response.data; // Gắn danh sách danh mục
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
        ApiService.post('http://localhost:8080/admin/categories/add', categoryData)
            .then(function (response) {
                if (response.data) {
                    $scope.successMessage = 'Danh mục đã được thêm thành công!';
                    $scope.categories.push(response.data); // Thêm danh mục vào danh sách
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
            ApiService.delete(`http://localhost:8080/admin/categories/delete/${id}`)
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
    $scope.pagedProducts = []; // Danh sách sản phẩm theo trang
    $scope.pageSize = 5; // Số sản phẩm mỗi trang
    $scope.currentPage = 1; // Trang hiện tại
    $scope.totalPages = 1; // Tổng số trang
    $scope.categories = [];
    $scope.errorMessage = null;
    $scope.successMessage = null;
    $scope.newProduct = {}; // Đối tượng sản phẩm mới
    $scope.editableProduct = null; // Đối tượng chỉnh sửa


    // Lấy danh sách sản phẩm
    ApiService.get(productApiUrl)
        .then(response => {
            $scope.products = response.data;
            $scope.totalPages = Math.ceil($scope.products.length / $scope.pageSize);
            $scope.updatePagedProducts(); // Cập nhật sản phẩm theo trang
        })
        .catch(error => {
            console.error('Lỗi khi gọi API sản phẩm:', error);
            $scope.errorMessage = 'Không thể tải danh sách sản phẩm.';
        });

    // Lấy danh sách danh mục
    ApiService.get(categoryApiUrl)
        .then(response => {
            $scope.categories = response.data;
        })
        .catch(error => {
            console.error('Lỗi khi gọi API danh mục:', error);
        });

    // Cập nhật danh sách sản phẩm theo trang
    $scope.updatePagedProducts = function () {
        const startIndex = ($scope.currentPage - 1) * $scope.pageSize;
        const endIndex = startIndex + $scope.pageSize;
        $scope.pagedProducts = $scope.products.slice(startIndex, endIndex);
    };

    // Chuyển trang
    $scope.changePage = function (page) {
        if (page >= 1 && page <= $scope.totalPages) {
            $scope.currentPage = page;
            $scope.updatePagedProducts();
        }
    };
    $scope.addProduct = function () {
        var formData = new FormData();
        formData.append("name", $scope.newProduct.name);
        formData.append("description", $scope.newProduct.description);
        formData.append("categoryId", $scope.newProduct.categoryId);
        formData.append("price", $scope.newProduct.price);
        formData.append("quality", $scope.newProduct.quality);
    
        // Kiểm tra xem có tệp không và thêm vào FormData
        if ($scope.newProduct.images) {
            formData.append("images", $scope.newProduct.images);
        } else {
            console.error("No image selected.");
            alert("Vui lòng chọn một tệp hình ảnh.");
            return;
        }
    
        // Gửi FormData qua API
        ApiService.post("http://localhost:8080/admin/product/add", formData)
        .then(function (response) {
            alert('Sản phẩm đã được thêm thành công!');
            $scope.newProduct = {}; // Reset form
    
            // Sau khi thêm thành công, gọi lại API để tải danh sách sản phẩm mới
            ApiService.get("http://localhost:8080/admin/product/index")
            .then(function (response) {
                $scope.products = response.data;  // Cập nhật danh sách sản phẩm
                $scope.totalPages = Math.ceil($scope.products.length / $scope.pageSize);  // Cập nhật số trang
                $scope.updatePagedProducts();  // Cập nhật sản phẩm theo trang
            })
            .catch(function (error) {
                console.error('Lỗi khi tải lại sản phẩm:', error);
                alert('Error while loading products: ' + (error.data.message || error.statusText));
            });
        })
        .catch(function (error) {
            console.error('Lỗi khi thêm sản phẩm:', error);
            var errorMessage = error.data?.message || error.statusText || "Đã xảy ra lỗi khi thêm sản phẩm.";
            alert(errorMessage);
        });
    };
    
    $scope.updateProduct = function () {
        if ($scope.newProduct.quality == null || $scope.newProduct.quality < 1) {
            alert('Số lượng (Quality) phải lớn hơn hoặc bằng 1.');
            return;
        }
    
        var formData = new FormData();
        formData.append("name", $scope.newProduct.name);
        formData.append("description", $scope.newProduct.description);
        formData.append("categoryId", $scope.newProduct.categoryId);
        formData.append("price", $scope.newProduct.price);
        formData.append("quality", $scope.newProduct.quality);
    
        // Kiểm tra xem có tệp hình ảnh không và thêm vào FormData
        if ($scope.newProduct.images) {
            formData.append("images", $scope.newProduct.images);  
        } else {
            alert("Vui lòng chọn một tệp hình ảnh.");
            return;
        }
        console.log(formData)
        // Truyền ID sản phẩm cần cập nhật
        formData.append("id", $scope.newProduct.id);
    
        // Gửi FormData qua API
        ApiService.put("http://localhost:8080/admin/product/update", formData)
        .then(function (response) {
            if (!response.data || !response.data.product) {
                alert('Không có dữ liệu cập nhật từ server.');
                return;
            }
    
            // Cập nhật sản phẩm trong danh sách
            var updatedProduct = response.data.product;
            var index = $scope.products.findIndex(product => product.id === updatedProduct.id);
            if (index !== -1) {
                $scope.products[index] = updatedProduct;
            }
    
            // Làm mới trang sau khi cập nhật
            $scope.updatePagedProducts();
            alert('Sản phẩm đã được cập nhật thành công!');
            $scope.newProduct = {}; // Reset form
        })
        .catch(function (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            var errorMessage = error.data?.message || error.statusText || "Đã xảy ra lỗi khi cập nhật sản phẩm.";
            alert(errorMessage);
        });
    };
    
    
    
    
    
    

    // Xoá sản phẩm
    $scope.deleteProduct = function (id) {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            ApiService.delete(`http://localhost:8080/admin/product/delete/${id}`)
                .then(response => {
                    // Kiểm tra phản hồi JSON từ server
                    if (response.data && response.data.message) {
                        $scope.successMessage = response.data.message; // Hiển thị thông báo từ server
                        $scope.products = $scope.products.filter(product => product.id !== id);
                        $scope.totalPages = Math.ceil($scope.products.length / $scope.pageSize);
                        $scope.updatePagedProducts(); // Cập nhật sản phẩm theo trang
                    } else {
                        $scope.errorMessage = 'Không thể xóa.';
                    }
                })
                .catch(error => {
                    // Xử lý lỗi từ server
                    if (error.status === 404) {
                        $scope.errorMessage = `Không tìm thấy sản phẩm với ID ${id}.`;
                    } else if (error.status === 500) {
                        $scope.errorMessage = 'Lỗi máy chủ. Không thể xóa sản phẩm.';
                    } else {
                        $scope.errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
                    }
                    console.error('Lỗi khi xóa sản phẩm:', error);
                });
        }
    };
    
    // Sửa sản phẩm
    $scope.editProduct = function (product) {
        $scope.editableProduct = angular.copy(product); // Sao chép sản phẩm vào đối tượng chỉnh sửa
        $scope.newProduct = angular.copy(product); // Đổ dữ liệu vào form
    };
    
    
    
    
    
    // Hủy chỉnh sửa sản phẩm
    $scope.cancelEdit = function () {
        $scope.newProduct = {}; // Xóa dữ liệu trong form
        $scope.editableProduct = null; // Hủy trạng thái chỉnh sửa
    };
}]);
// Khởi tạo controller mới
app.controller('LogoutController', function($scope, $window) {
    // Hàm logout
    $scope.logout = function() {
        // Xóa token khỏi localStorage
        localStorage.removeItem('token');
        
        // Chuyển hướng về trang đăng nhập
        $window.location.href = 'login-register.html';
    };
});



