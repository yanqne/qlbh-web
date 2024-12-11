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
const productUrl='http://localhost:8080/index/product';
// Service để xử lý API
app.service('ApiService', ['$http', function ($http) {
    this.get = function (url) {
        return $http.get(url);
    };

    this.post = function (url, data) {
        return $http.post(url, data);
    };
}]);
app.controller('ProductController', ['$scope','ApiService', function($scope,ApiService){
    $scope.product= [];
    $scope.loading= true;
    $scope.errorMessage = null;

    ApiService.get(productUrl).then(function (Response){
        $scope.product = Response.data;
    })
    .catch(function (error){
        console.error("Lỗi khi gọi sản phẩm", error);
        $scope.errorMessage = 'Không thể tải dữ liệu';
    })
    .finally(function(){
        $scope.loading = false;    
    });
}]);