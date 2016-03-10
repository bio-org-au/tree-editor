
//= require get-preferred-link
//= require utility/get-json-controller

var WorkspaceformController = function ($scope, $rootScope, $http, $element) {
    setupJsonCache($rootScope, $http);


    $scope.can_edit = false;
    $scope.form = {};

    $scope.resetForm = $scope.clickReset = $scope.afterUpdateJson = function() {
        if($scope.json) {
            // TODO: we should be asking the service layer what permissions we have,
            // rather than figuring this out clientside
            $scope.can_edit = $scope.json.owner == $rootScope.getUser();
            $scope.form.title = $scope.json.title;
            $scope.form.description = $scope.json.description;
            $element.find('#formDesc').html($scope.form.description);
        }
        else {
            $scope.can_edit = true;
            $scope.form.title = '';
            $scope.form.description = '';
            $element.find('#formDesc').html($scope.form.description);
        }
    };

    GetJsonController($scope, $rootScope);
    $scope.resetForm();

    if ($scope.withTopNode) {
        $rootScope.needJson($scope.withTopNode);
        var deregisterInitializationListener;
        function initializationListener(event, uri, json) {
            if(uri == $scope.withTopNode && $rootScope.currentJson($scope.withTopNode).fetched) {
                $scope.arrangement = $rootScope.needJson($scope.withTopNode).arrangement;
                deregisterInitializationListener();
            }
        }

        deregisterInitializationListener = $rootScope.$on('nsl-json-fetched', initializationListener);
        initializationListener();
    }

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
                'description': $element.find('#formDesc').html()
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
                'checkout': $scope.withTopNode
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
        if(!window.confirm("Delete workspace \"" + $scope.json.title + "\" ?")) return;
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


};


WorkspaceformController.$inject = ['$scope', '$rootScope', '$http', '$element'];

app.controller('Workspaceform', WorkspaceformController);


var workspaceformDirective = function() {
    return {
        templateUrl: "/tree-editor/assets/ng/workspaces/form.html",
        controller: WorkspaceformController,
        scope: {
            uri: "@uri",
            withTopNode: "@withTopNode"
        },
    };
}

app.directive('workspaceform', workspaceformDirective);

