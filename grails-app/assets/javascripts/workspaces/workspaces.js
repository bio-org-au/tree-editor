var WorkspaceslistController = function ($scope, $rootScope, $http) {
    console.log("WorkspaceslistController");

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



WorkspaceslistController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Workspaceslist', WorkspaceslistController);

var workspaceslistDirective = function() {
    console.log("workspaceslistDirective");

    return {
        templateUrl: "/tree-editor/assets/ng/workspaces/list.html",
        controller: WorkspaceslistController,
        scope: {
        },
    };
}

app.directive('workspaceslist', workspaceslistDirective);

var WorkspaceslistrowController = function ($scope, $rootScope, $http) {
    console.log("WorkspaceslistrowController");

    $scope.loading = false;
    $scope.loaded = false;
    $scope.failedtoload = false;
    $scope.data = null;
    $scope.response = null;

    $scope.can_edit = false;

    $scope.reload = function() {
        $scope.loading = false;
        $scope.loaded = false;
        $scope.failedtoload = false;
        $scope.data = null;
        $scope.response = null;

        $scope.can_edit = false;

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
            // TODO: we should be asking the service layer what permissions we have,
            // rather than figuring this out clientside
            $scope.can_edit = $scope.data.owner == $rootScope.getUser();
        }, function errorCallback(response) {
            $scope.loading = false;
            $scope.failedtoload = true;
            $scope.response = response;
        });
    };

    $scope.reload();
};


WorkspaceslistrowController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Workspaceslistrow', WorkspaceslistrowController);


var workspaceslistrowDirective = function() {
    console.log("workspaceslistrowDirective");

    return {
        templateUrl: "/tree-editor/assets/ng/workspaces/row.html",
        controller: WorkspaceslistrowController,
        scope: {
            uri: "@uri"
        },
    };
}

app.directive('workspaceslistrow', workspaceslistrowDirective);

