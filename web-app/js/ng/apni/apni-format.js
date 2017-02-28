var ApniFormatController = ['$scope', '$rootScope', '$http', '$sce', function ($scope, $rootScope, $http, $sce) {
    $scope.loading = false;
    $scope.loaded = false;
    $scope.failedtoload = false;
    $scope.html = 'Select something on the left.';

    $scope.load = function () {
        $http({
            method: 'GET',
            url: $scope.uri + '/api/apni-format-embed'
        }).then(function successCallback(response) {
            $scope.loading = false;
            $scope.loaded = true;
            $scope.html = response.data;
        }, function errorCallback(response) {
            console.log(response);
            $scope.loading = false;
            $scope.failedtoload = true;
            $scope.response = response;
        });
    };

    $scope.$watch('uri', $scope.load);

    $scope.trustedHtml = function() {
        return $sce.trustAsHtml($scope.html);
    };

    if ($scope.uri) {
        $scope.load();
    }
}];

var apniFormatDirective = [function () {
    return {
        restrict: 'E',
        templateUrl: pagesUrl + "/ng/apni/apniFormat.html",
        controller: ApniFormatController,
        scope: {
            uri: '@uri'
        }
    };
}];
app.directive('apniFormat', apniFormatDirective);