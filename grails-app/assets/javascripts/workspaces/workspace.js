var WorkspaceformController = function ($scope, $rootScope, $http, $element) {
    console.log("WorkspaceformController");

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
        $scope.form = {}

        $scope.can_edit = false;

        if(!$scope.uri) {
            // new workspace
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

            $scope.resetForm();

        }, function errorCallback(response) {
            $scope.loading = false;
            $scope.failedtoload = true;
            $scope.response = response;
        });
    };

    $scope.reload();

    $scope.clickSave = function() {
        if(!$scope.form.title) return;
        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/updateWorkspace',
            headers: {
                'Access-Control-Request-Headers': 'nsl-jwt',
                'nsl-jwt': $rootScope.getJwt()
            },
            params: {
                'uri': $scope.uri,
                'title': $scope.form.title,
                'description': $element.find('#formDesc').html(),
            }
        }).then(function successCallback(response) {
            window.location = $rootScope.pagesUrl + "/workspaces/index";
        }, function errorCallback(response) {
            if(response.data && response.data.msg) {
                $rootScope.msg = response.data.msg;
            }
            else {
                $rootScope.msg = [
                    {
                        msg: response.data.status,
                        body: response.data.reason,
                        status: 'danger',  // we use danger because we got no JSON back at all
                    }
                ];
            }
        });
    };

    $scope.clickCreate = function() {
        if(!$scope.form.title) return;

        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/createWorkspace',
            headers: {
                'Access-Control-Request-Headers': 'nsl-jwt',
                'nsl-jwt': $rootScope.getJwt()
            },
            params: {
                'namespace': $rootScope.namespace,
                'title': $scope.form.title,
                'description': $element.find('#formDesc').html(),
            }
        }).then(function successCallback(response) {
            window.location = $rootScope.pagesUrl + "/workspaces/index";
        }, function errorCallback(response) {
            if(response.data && response.data.msg) {
                $rootScope.msg = response.data.msg;
            }
            else {
                $rootScope.msg = [
                    {
                        msg: response.data.status,
                        body: response.data.reason,
                        status: 'danger',  // we use danger because we got no JSON back at all
                    }
                ];
            }
        });
    };

    $scope.clickDelete = function() {
        if(!window.confirm("Delete workspace \"" + $scope.data.title + "\" ?")) return;
        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/deleteWorkspace',
            headers: {
                'Access-Control-Request-Headers': 'nsl-jwt',
                'nsl-jwt': $rootScope.getJwt()
            },
            params: {
                'uri': $scope.uri,
            }
        }).then(function successCallback(response) {
            window.location = $rootScope.pagesUrl + "/workspaces/index";
        }, function errorCallback(response) {
            if(response.data && response.data.msg) {
                $rootScope.msg = response.data.msg;
            }
            else {
                $rootScope.msg = [
                    {
                        msg: response.data.status,
                        body: response.data.reason,
                        status: 'danger',  // we use danger because we got no JSON back at all
                    }
                ];
            }
        });
    };

    $scope.resetForm = $scope.clickReset = function() {
        // TODO: we should be asking the service layer what permissions we have,
        // rather than figuring this out clientside
        $scope.can_edit = $scope.data.owner == $rootScope.getUser();
        $scope.form.title = $scope.data.title;
        $scope.form.description = $scope.data.description;
        $element.find('#formDesc').html($scope.form.description);
    };


};


WorkspaceformController.$inject = ['$scope', '$rootScope', '$http', '$element'];

app.controller('Workspaceform', WorkspaceformController);


var workspaceformDirective = function() {
    console.log("workspaceformDirective");

    return {
        templateUrl: "/tree-editor/assets/ng/workspaces/form.html",
        controller: WorkspaceformController,
        scope: {
            uri: "@uri"
        },
    };
}

app.directive('workspaceform', workspaceformDirective);

