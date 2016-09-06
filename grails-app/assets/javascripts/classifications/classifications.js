/***********************************
 * classifications.js
 */

console.log("loading classifications.js")


var ClassificationslistController = ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
    $scope.loading = false;
    $scope.loaded = false;
    $scope.failedtoload = false;
    $scope.data = null;
    $scope.response = null;

    $scope.reload = function() {
        $scope.loading = false;
        $scope.loaded = false;
        $scope.failedtoload = false;
        $scope.data = null;
        $scope.response = null;

        if(!$rootScope.namespace) {
            $scope.loaded = true;
            return;
        }

        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/TreeJsonView/listClassifications',
            params: {
                namespace: $rootScope.namespace
            }
        }).then(function successCallback(response) {
            $scope.loading = false;
            $scope.loaded = true;
            $scope.data = response.data;
        }, function errorCallback(response) {
            console.log(response);
            $scope.loading = false;
            $scope.failedtoload = true;
            $scope.response = response;
        });
    };

    $scope.$on('nsl-tree-edit.namespace-changed', $scope.reload);

    $scope.reload();
}];

app.controller('Classificationslist', ClassificationslistController);

app.directive('classificationslist', [ function() {
    return {
        templateUrl: pagesUrl + "/assets/ng/classifications/list.html",
        controller: ClassificationslistController,
        scope: {
        },
    };
}]);

var ClassificationslistrowController = ['$scope', '$rootScope', '$http', 'jsonCache', function ($scope, $rootScope, $http, jsonCache) {
    inheritJsonController($scope, jsonCache);
}];


app.controller('Classificationslistrow', ClassificationslistrowController);

var classificationslistrowDirective = [function() {
    return {
        templateUrl: pagesUrl + "/assets/ng/classifications/row.html",
        controller: ClassificationslistrowController,
        scope: {
            uri: "@uri"
        },
    };
}];

app.directive('classificationslistrow', classificationslistrowDirective);

