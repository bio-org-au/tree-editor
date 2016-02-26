var ClassificationslistController = function ($scope, $rootScope, $http) {
    console.log("ClassificationslistController");

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
            $scope.loading = false;
            $scope.failedtoload = true;
            $scope.response = response;
        });
    };

    $scope.$on('nsl-tree-edit-namespace-changed', $scope.reload);

    $scope.reload();
};



ClassificationslistController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Classificationslist', ClassificationslistController);

var classificationslistDirective = function() {
    console.log("classificationslistDirective");

    return {
        templateUrl: "/tree-editor/assets/ng/classifications/list.html",
        controller: ClassificationslistController,
        scope: {
        },
    };
}

app.directive('classificationslist', classificationslistDirective);

var ClassificationslistrowController = function ($scope, $rootScope, $http) {
    console.log("ClassificationslistrowController");

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

        if(!$scope.uri) {
            $scope.loading = false;
            $scope.loaded = true;
            return;
        }

        $scope.loading = true;

        $http({
            method: 'GET',
            url: $scope.uri
        }).then(function successCallback(response) {
            $scope.loading = false;
            $scope.loaded = true;
            $scope.data = response.data;
        }, function errorCallback(response) {
            $scope.loading = false;
            $scope.failedtoload = true;
            $scope.response = response;
        });
    };

    $scope.reload();
};


ClassificationslistController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Classificationslistrow', ClassificationslistrowController);


var classificationslistrowDirective = function() {
    console.log("classificationslistrowDirective");

    return {
        templateUrl: "/tree-editor/assets/ng/classifications/row.html",
        controller: ClassificationslistrowController,
        scope: {
            uri: "@uri"
        },
    };
}

app.directive('classificationslistrow', classificationslistrowDirective);

