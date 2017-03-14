/***********************************
 * workspaces.js
 */

console.log("loading workspaces.js")

var WorkspaceslistController = ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
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
            url: $rootScope.servicesUrl + '/TreeJsonView/listWorkspaces',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            params: {
                namespace: $rootScope.namespace
            }
        }).then(function successCallback(response) {
            $scope.loading = false;
            $scope.loaded = true;
            $scope.data = (response.data ? response.data : null);
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

app.controller('Workspaceslist', WorkspaceslistController);

var workspaceslistDirective = [function() {
    return {
        templateUrl: pagesUrl + "/ng/workspaces/list.html",
        controller: WorkspaceslistController,
        scope: {
        },
    };
}];

app.directive('workspaceslist', workspaceslistDirective);

var WorkspaceslistrowController = ['$scope', '$rootScope', '$http', 'jsonCache', function ($scope, $rootScope, $http, jsonCache) {
    inheritJsonController($scope, jsonCache);

    $scope.afterUpdateJson = function(){
        $scope.permissions = null;
        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/TreeJsonView/permissions',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            params: {
                uri: $scope.uri
            }
        }).then(function successCallback(response) {
            $scope.permissions = response.data;
        }, function errorCallback(response) {
            console.log(response);
        });
    };        
}];

app.controller('Workspaceslistrow', WorkspaceslistrowController);

var workspaceslistrowDirective = [function() {
    return {
        templateUrl: pagesUrl + "/ng/workspaces/row.html",
        controller: WorkspaceslistrowController,
        scope: {
            uri: "@uri"
        },
    };
}];

app.directive('workspaceslistrow', workspaceslistrowDirective);

