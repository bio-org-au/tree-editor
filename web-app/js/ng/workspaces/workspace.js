/***********************************
 * workspace.js
 */

console.log("loading workspace.js");

var WorkspaceformController = ['$scope', '$rootScope', '$http', '$element', 'jsonCache', function ($scope, $rootScope, $http, $element, jsonCache) {
    $scope.can_edit = false;
    $scope.form = {};

    $scope.baseClassificationDropdown_toggle = function() {
        $scope.baseClassificationDropdown_visible = ! $scope.baseClassificationDropdown_visible;
    };
    $scope.baseClassificationDropdown_click = function(uri) {
        $scope.form.baseClassification = uri;
        $scope.baseClassificationDropdown_visible = false;
    };
    $scope.baseClassificationDropdown_visible = false;

    $scope.reloadWorkspaces = function() {
        $scope.classifications  = {};

        if(!$rootScope.namespace) {
            return;
        }

        console.log("FETCHIONG classifications");

        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/TreeJsonView/listClassifications',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            params: {
                namespace: $rootScope.namespace
            }
        }).then(function successCallback(response) {
            console.log("GOT classifications");
            console.log(response.data);
            $scope.classifications = response.data;
        }, function errorCallback(response) {
            console.log(response);
        });
    };

    $scope.$on('nsl-tree-edit.namespace-changed', $scope.reloadWorkspaces);
    $scope.reloadWorkspaces();

    $scope.resetForm = $scope.clickReset = $scope.afterUpdateJson = function() {
        if($scope.json) {
            // TODO: we should be asking the service layer what permissions we have,
            // rather than figuring this out clientside
            $scope.can_edit = $scope.json.owner == $rootScope.getUser();
            $scope.form.title = $scope.json.title;
            $scope.form.description = $scope.json.description;
            $scope.form.shared = $scope.json.shared;
            $scope.form.baseClassification = $scope.json.root;
            $element.find('#formDesc').html($scope.form.description);
        }
        else {
            $scope.can_edit = true;
            $scope.form.title = '';
            $scope.form.description = '';
            $scope.form.baseClassification = null;
            $scope.form.shared = true;
            $element.find('#formDesc').html($scope.form.description);
        }
    };

    inheritJsonController($scope, jsonCache);
    $scope.resetForm();

    if ($scope.withTopNode) {
        jsonCache.needJson($scope.withTopNode);
        var deregisterInitializationListener;
        function initializationListener(event, uri, json) {
            if(uri == $scope.withTopNode && jsonCache.currentJson($scope.withTopNode).fetched) {
                $scope.arrangement = jsonCache.needJson($scope.withTopNode).arrangement;
                deregisterInitializationListener();
            }
        }

        deregisterInitializationListener = $rootScope.$on('nsl-json-fetched', initializationListener);
        initializationListener();
    }

    $scope.clickSave = function() {
        console.log("clickSave");
        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/updateWorkspace',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            params: {
                'uri': $scope.uri,
                'title': $scope.form.title,
                'description': $element.find('#formDesc').html(),
                'shared': $scope.form.shared,
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
                        status: 'danger'  // we use danger because we got no JSON back at all
                    }
                ];
            }
        });

    };

    $scope.clickCreate = function() {
        if(!$scope.form.title) return;

        console.log("clickCreate");

        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/createWorkspace',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            params: {
                'namespace': $rootScope.namespace,
                'title': $scope.form.title,
                'description': $element.find('#formDesc').html(),
                'checkout': $scope.withTopNode,
                'shared': $scope.form.shared,
                'baseTree': $scope.form.baseClassification
            }
        }).then(function successCallback(response) {
            window.location = $rootScope.pagesUrl + "/workspaces/checklist?tree=" + response.data.uri;
        }, function errorCallback(response) {
            if(response.data && response.data.msg) {
                $rootScope.msg = response.data.msg;
            }
            else {
                if(response.status == 401) {
                    $rootScope.msg = [
                        {
                            msg: "Unauthorized:",
                            body: "You need to log in to do this, or you don't have permission.",
                            status: 'danger'
                        }
                    ];
                } else {
                    $rootScope.msg = [
                        {
                            msg: response.data.status,
                            body: response.data.reason,
                            status: 'danger'
                        }
                    ];
                }
            }
        });
    };

    $scope.clickDelete = function() {
        if(!window.confirm("Delete workspace \"" + $scope.json.title + "\" ?")) return;
        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/deleteWorkspace',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
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
}];


app.controller('Workspaceform', WorkspaceformController);

var workspaceformDirective = [function() {
    return {
        templateUrl: pagesUrl + "/ng/workspaces/form.html",
        controller: WorkspaceformController,
        scope: {
            uri: "@",
            withTopNode: "@"
        },
    };
}];

app.directive('workspaceform', workspaceformDirective);

