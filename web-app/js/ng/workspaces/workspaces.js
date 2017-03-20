/***********************************
 * workspaces.js
 */

console.log("loading workspaces.js")

var WorkspaceslistController = ['$scope', '$rootScope', 'auth', function ($scope, $rootScope, auth) {
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

        auth.http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/TreeJsonView/listWorkspaces',
            params: {
                namespace: $rootScope.namespace
            },
            success: function successCallback(response) {
                $scope.loading = false;
                $scope.loaded = true;
                $scope.data = (response.data ? response.data : null);
            },
            fail: function errorCallback(response) {
                console.log(response);
                $scope.loading = false;
                $scope.failedtoload = true;
                $scope.response = response;
            }
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

var WorkspaceslistrowController = ['$scope', '$rootScope', 'jsonCache', 'auth', function ($scope, $rootScope, jsonCache, auth) {
    inheritJsonController($scope, jsonCache);

    $scope.afterUpdateJson = function(){
        $scope.permissions = null;
        auth.http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/TreeJsonView/permissions',
            params: {
                uri: $scope.uri
            },
            success: function successCallback(response) {
                $scope.permissions = response.data;
            },
            fail: function errorCallback(response) {
                console.log(response);
            }
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

