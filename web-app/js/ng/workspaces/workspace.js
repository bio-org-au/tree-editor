/***********************************
 * workspace.js
 */

console.log("loading workspace.js");

var WorkspaceformController = ['$scope', '$rootScope', '$element', 'jsonCache', '$location', 'auth', function ($scope, $rootScope, $element, jsonCache, $location, auth) {
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

        console.log("FETCHING classifications");

        auth.http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/TreeJsonView/listClassifications',
            params: {
                namespace: $rootScope.namespace
            },
            success: function successCallback(response) {
                console.log("GOT classifications");
                console.log(response.data);
                $scope.classifications = response.data;
            },
            fail: function errorCallback(response) {
                console.log(response);
            }
        });
    };

    $scope.$on('nsl-tree-edit.namespace-changed', $scope.reloadWorkspaces);
    $scope.reloadWorkspaces();

    $scope.resetForm = $scope.clickReset = $scope.afterUpdateJson = function() {
        if($scope.json) {
            // TODO: we should be asking the service layer what permissions we have,
            // rather than figuring this out clientside
            $scope.can_edit = $scope.json.owner == auth.principal();
            $scope.form.title = $scope.json.title;
            $scope.form.description = $scope.json.description;
            $scope.form.shared = $scope.json.shared;
            $scope.form.baseClassification = $scope.json.baseArrangement._uri;
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
        auth.http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/updateWorkspace',
            params: {
                'uri': $scope.uri,
                'title': $scope.form.title,
                'description': $scope.form.description,
                'shared': $scope.form.shared
            },
            success: function successCallback(response) {
                $scope.json.fetched = false;
                jsonCache.needJson($scope.uri);
                $location.path("workspaces");
            },
            fail: function errorCallback(response) {
                if (response.data && response.data.msg) {
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
            }
        });

    };

    $scope.clickCreate = function() {
        if(!$scope.form.title) return;

        console.log("clickCreate");

        auth.http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/createWorkspace',
            params: {
                'namespace': $rootScope.namespace,
                'title': $scope.form.title,
                'description': $scope.form.description,
                'checkout': $scope.withTopNode,
                'shared': $scope.form.shared,
                'baseTree': $scope.form.baseClassification
            },
            success: function successCallback(response) {
                console.log("redirect to: checklist?tree=" + response.data.uri);
                $location.path("checklist").search({tree: response.data.uri});
            }, fail: function errorCallback(response) {
                if (response.data && response.data.msg) {
                    $rootScope.msg = response.data.msg;
                }
                else {
                    if (response.status == 401) {
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
            }
        });
    };

    $scope.clickDelete = function() {
        if(!window.confirm("Delete workspace \"" + $scope.json.title + "\" ?")) return;
        auth.http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/deleteWorkspace',
            params: {
                'uri': $scope.uri
            },
            success: function successCallback(response) {
                $location.path("workspaces");
            },
            fail: function errorCallback(response) {
                if (response.data && response.data.msg) {
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
        }
    };
}];

app.directive('workspaceform', workspaceformDirective);


var WorkspaceController = ['$scope', '$rootScope', '$routeParams',function ($scope, $rootScope, $routeParams) {
    $scope.tree = $routeParams.tree;
    $scope.new = $scope.tree ? 'Edit' : 'New';
}];

app.controller('Workspace', WorkspaceController);
