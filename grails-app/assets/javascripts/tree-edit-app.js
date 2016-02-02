//= require angular
//= require recursionhelper
//= require angular-sanitize
//= require get-preferred-link

var app = angular.module('au.org.biodiversity.nsl.tree-edit-app', ['Mark.Lagendijk.RecursionHelper', 'ngSanitize']);

////////////////////////////////////////////////////////////

function adjust_working_body_height () {
    var h = $("#tree-edit-app-working").height() - $('#tree-edit-app-working-header').height();
    if(h<=0) {
        $('#tree-edit-app-working-body').hide();
    }
    else {
        $('#tree-edit-app-working-body').height(h);
        $('#tree-edit-app-working-body').show();
    }
};

$(window).resize(adjust_working_body_height)

var TreeEditAppController = function ($scope, $http, $element) {
    $scope.footer = "this is a footer";
    $scope.rightpanel_select = "cls";

    $scope.leftUri = null; // "http://localhost:7070/nsl-mapper/boa/tree/apni/1019";
    $scope.rightUri = null; // "http://localhost:7070/nsl-mapper/boa/tree/apni/3029293";

    $scope.appScope = $scope;

    $scope.postdigestNotify = function() {
        $scope.$root.$$postDigest(adjust_working_body_height);
    };

    $scope.$watch('leftUri', $scope.postdigestNotify);
    $scope.$watch('rightUri', $scope.postdigestNotify);
    $scope.postdigestNotify();

    $scope.user = {};

    $scope.login = function() {
        $http({
            method: 'GET',
            url: $scope.servicesUrl + '/auth/signInJson',
            params: { username: $scope.user.name, password: $scope.user.password}
        }).then(function successCallback(response) {
            $scope.appScope.user.loginResult = response.data;
        }, function errorCallback(response) {
            $scope.appScope.user.loginResult = response.data;
        });
    }

    $scope.logout = function() {
        $http({
            method: 'GET',
            url: $scope.servicesUrl + '/auth/signOutJson',
        }).then(function successCallback(response) {
            $scope.appScope.user.loginResult = response.data;
        }, function errorCallback(response) {
            $scope.appScope.user.loginResult = response.data;
        });
    }

    $scope.isLoggedIn = function() {
        return $scope.user && $scope.user.loginResult && $scope.user.loginResult.principal;
    };

    $scope.getUser = function() {
        return $scope.user && $scope.user.loginResult && $scope.user.loginResult.principal;
    };

    $scope.getJwt = function() {
        return $scope.user && $scope.user.loginResult && $scope.user.loginResult.jwt;
    };

    $scope.namespaceDropdown_toggle = function() {
        $scope.namespaceDropdown_visible = ! $scope.namespaceDropdown_visible;
    };

    $scope.namespaceDropdown_visible = false;

    $scope.namespaces =
        [{
            "class": "au.org.biodiversity.nsl.Namespace",
            "name": "AMANI",
            "descriptionHtml": "(description of <b>AMANI<\u002fb>)"
        }, {
            "class": "au.org.biodiversity.nsl.Namespace",
            "name": "ANHSIR",
            "descriptionHtml": "(description of <b>ANHSIR<\u002fb>)"
        }, {
            "class": "au.org.biodiversity.nsl.Namespace",
            "name": "APNI",
            "descriptionHtml": "(description of <b>APNI<\u002fb>)"
        }];

};

TreeEditAppController.$inject = ['$scope', '$http', '$element'];

app.controller('TreeEditAppController', TreeEditAppController);

function TreeEditAppDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/app.html",
        scope: {
            servicesUrl: '@servicesUrl'
        },
        controller: TreeEditAppController
    };
}

app.directive('app', TreeEditAppDirective);

////////////////////////////////////////////////////////////

var ClassificationsListController = function ($scope, $http, $element) {
    $scope.appScope = $scope.$parent.appScope;

    $scope.loading = false;
    $scope.loaded = false;
    $scope.response = "init";
    $scope.classifications = [];

    $scope.reload = function() {
        $scope.loading = true;
        $scope.response = "fetching";
        $scope.classifications = [];

        $http({
            method: 'GET',
            url: $scope.servicesUrl + '/TreeJsonView/listClassifications'
        }).then(function successCallback(response) {
            $scope.loading = false;
            $scope.loaded = true;
            $scope.classifications = response.data;
            $scope.response = response;
            $scope.appScope.postdigestNotify();
        }, function errorCallback(response) {
            $scope.loading = false;
            $scope.response = response;
            $scope.appScope.postdigestNotify();
        });
    };

    $scope.loadLeft = function(uri) {
        $scope.appScope.leftUri = uri;
    };

    $scope.loadRight = function(uri) {
        $scope.appScope.rightUri = uri;
    };

    $scope.reload();
};

ClassificationsListController.$inject = ['$scope', '$http', '$element'];

app.controller('ClassificationsListController', ClassificationsListController);

function ClassificationsListDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/ClassificationsList.html",
        scope: {
            servicesUrl: '@',
            appScope: '&appScope',
        },
        controller: ClassificationsListController
    };
}

app.directive('classificationsList', ClassificationsListDirective);

////////////////////////////////////////////////////////////

var WorkspacesPaneController = function ($scope, $http, $element) {
    $scope.appScope = $scope.$parent.appScope;

    $scope.loading = false;
    $scope.loaded = false;
    $scope.response = "init";
    $scope.classifications = [];
    $scope.msg = [];

    $scope.newWorkspace = { description: null};

    $scope.reload = function() {
        $scope.loading = true;
        $scope.response = "fetching";
        $scope.classifications = [];

        $http({
            method: 'GET',
            url: $scope.servicesUrl + '/TreeJsonView/listClassifications'
        }).then(function successCallback(response) {
            $scope.loading = false;
            $scope.loaded = true;
            $scope.classifications = response.data;
            $scope.response = response;
            $scope.appScope.postdigestNotify();
        }, function errorCallback(response) {
            $scope.loading = false;
            $scope.response = response;
            $scope.appScope.postdigestNotify();
        });
    };

    $scope.loadLeft = function(uri) {
        $scope.appScope.leftUri = uri;
    };

    $scope.loadRight = function(uri) {
        $scope.appScope.rightUri = uri;
    };

    $scope.createWorkspace = function() {
        $scope.msg = [];
        $http({
            method: 'POST',
            url: $scope.servicesUrl + '/TreeJsonEdit/createWorkspace',
            headers: {
                'Access-Control-Request-Headers': 'nsl-jwt',
                'nsl-jwt': $scope.appScope.getJwt()
            },
            params: {
                'description': $scope.newWorkspace.description,
            }
        }).then(function successCallback(response) {
            $scope.msg = response.data.msg;
            $scope.foo = response.data;
            $scope.reload();
        }, function errorCallback(response) {
            $scope.msg = [
                {
                    msg: response.data.status,
                    body: response.data.reason,
                    status: 'warning',
                }
            ];
            $scope.foo = response.data;
        });
    };

    $scope.reload();
};

WorkspacesPaneController.$inject = ['$scope', '$http', '$element'];

app.controller('WorkspacesPaneController', WorkspacesPaneController);

function WorkspacesPaneDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/appWorkspacePane.html",
        scope: {
            servicesUrl: '@',
            appScope: '&appScope',
        },
        controller: WorkspacesPaneController
    };
}

app.directive('workspacesPane', WorkspacesPaneDirective);

////////////////////////////////////////////////////////////

var ItemController = function ($scope, $http, $element) {
    $scope.appScope = $scope.$parent.appScope;
    $scope.itemScope = $scope.$parent.itemScope ? $scope.$parent.itemScope : $scope;

    $scope.loading = true;
    $scope.loaded = false;
    $scope.data = null;

    // readySubitems and subitems is a list of uris.
    // the subitems are not loaded from readySubitems into subitems until the first 'open' event.

    // so there are four states
    // 1) !readySubitems
    // 2) readySubitems && !subitems
    // 3) readySubitems && subitems && !open
    // 4) readySubitems && subitems && open

    $scope.readySubitems = null;
    $scope.subitems = null;
    $scope.open = false;

    $scope.reload = function() {
        if($scope.uri) {
            $scope.loading = true;
            $scope.loaded = false;
            $scope.data = null;
            $scope.response = null;
            $scope.readySubitems = false;
            $scope.subitems = null;
            $scope.isOpen = false;

            // dataextract is the processed, digested data. What gets put into it depends on the data type
            $scope.dataExtract = null;

            $http({
                method: 'GET',
                url: $scope.uri
            }).then(function successCallback(response) {
                $scope.loading = false;
                $scope.loaded = true;
                $scope.response = response;
                $scope.data = response.data;
                $scope.appScope.postdigestNotify();

                if($scope.data.class == 'au.org.biodiversity.nsl.Arrangement') {
                    $scope.readySubitems = [ { contextType: 'arrangement', uri: getPreferredLink($scope.data.node) } ];
                }

                if($scope.data.class == 'au.org.biodiversity.nsl.Node') {
                    $scope.readySubitems = [];
                    for(var link in $scope.data.subnodes) {
                        $scope.readySubitems.push( {contextType: 'subnode', contextId: link, uri: getPreferredLink($scope.data.subnodes[link].subNode)} );
                    }
                    if($scope.readySubitems.length == 0) {
                        $scope.readySubitems = null;
                    }

                    $scope.dataExtract = {
                        nameUri: $scope.data.name ? getPreferredLink($scope.data.name.name) : null,
                        instanceUri: $scope.data.instance ? getPreferredLink($scope.data.instance.instance) : null,
                    };

                }

            }, function errorCallback(response) {
                $scope.loading = false;
                $scope.loaded = false;
                $scope.response = response;
                $scope.appScope.postdigestNotify();
            });
        }
        else {
            $scope.loading = false;
            $scope.loaded = true;
            $scope.data = null;
            $scope.response = null;
        }
    };

    $scope.open = function() {
        $scope.subitems = $scope.readySubitems;
        $scope.isOpen = true;
    };
    $scope.close = function() {
        $scope.isOpen = false;
    };

    $scope.$watch('uri', $scope.reload);
};

ItemController.$inject = ['$scope', '$http', '$element'];

app.controller('ItemController', ItemController);

function ItemDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/Item.html",
        scope: {
            uri: '@'
        },
        controller: ItemController
    };
}

app.directive('item', ItemDirective);


////////////////////////////////////////////////////////////

var ItemHeaderController = function ($scope, $http, $element, $rootScope) {
    $scope.appScope = $scope.$parent.appScope;
    $scope.itemScope = $scope;

    $rootScope.$$postDigest(function(){adjust_working_body_height()});
}

ItemHeaderController.$inject = ['$scope', '$http', '$element', '$rootScope'];

app.controller('ItemHeaderController', ItemHeaderController);

function itemHeaderDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/ItemHeader.html",
        scope: {
            uri: '@uri',
        },
        controller: ItemHeaderController
    };
}

app.directive('itemheader', itemHeaderDirective);

////////////////////////////////////////////////////////////

var ItemBodyController = function ($scope, $http, $element) {
    // inherit the gear from itemcontroller
    ItemController($scope, $http, $element);

    if($scope == $scope.itemScope) {
      $scope.itemScope.selectedUri = null;
    }

    $scope.selectItem = function() {
        $scope.itemScope.selectedUri = $scope.uri;
    };

    $scope.isSelected = function() {
        return $scope.itemScope.selectedUri == $scope.uri;
    };
};

ItemBodyController.$inject = ['$scope', '$http', '$element'];

app.controller('ItemBodyController', ItemBodyController);


function itemBodyDirective(RecursionHelper) {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/ItemBody.html",
        scope: {
            uri: '@uri',
            contextType: '@contextType',
            contextId: '@contextId',
        },
        controller: ItemBodyController,
        compile: function(element) {
            return RecursionHelper.compile(element, function (scope, iElement, iAttrs, controller, transcludeFn) {
                // Define your normal link function here.
                // Alternative: instead of passing a function,
                // you can also pass an object with
                // a 'pre'- and 'post'-link function.
            });
        },
    };
}

app.directive('itembody', itemBodyDirective);

