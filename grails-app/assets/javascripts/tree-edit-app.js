//= require angular
//= require recursionhelper
//= require angular-sanitize
//= require get-preferred-link
//= require app

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
}

$(window).resize(adjust_working_body_height);

var TreeEditAppController = function ($scope, $http, $element) {
    $scope.footer = "this is a footer";
    $scope.rightpanel_select = "cls";

    $scope.leftHeaderUri = null; // "http://localhost:7070/nsl-mapper/boa/tree/apni/1019";
    $scope.rightHeaderUri = null; // "http://localhost:7070/nsl-mapper/boa/tree/apni/3029293";
    $scope.leftBodyUri = null; // "http://localhost:7070/nsl-mapper/boa/tree/apni/1019";
    $scope.rightBodyUri = null; // "http://localhost:7070/nsl-mapper/boa/tree/apni/3029293";

    // TODO: we should load the header uri and ask the header to point the tree at the current root.

    $scope.loadLeft = function(uri) {
        console.log("left uri is now " + uri);
        $scope.appScope.leftHeaderUri = uri;
        $scope.appScope.leftBodyUri = null;
    };

    $scope.loadRight = function(uri) {
        console.log("right uri is now " + uri);
        $scope.appScope.rightHeaderUri = uri;
        $scope.appScope.rightBodyUri = null;
    };

    $scope.$on('headerRootSelection', function(event, pane, uri) {
        if(pane == 'left') {
            $scope.appScope.leftBodyUri = uri;
        }
        else if(pane == 'right') {
            $scope.appScope.rightBodyUri = uri;
        }
    });


    $scope.appScope = $scope;

    $scope.postdigestNotify = function() {
        $scope.$root.$$postDigest(adjust_working_body_height);
    };

    $scope.$watch('leftHeaderUri', $scope.postdigestNotify);
    $scope.$watch('rightHeaderUri', $scope.postdigestNotify);
    $scope.postdigestNotify();

    // LOGION/LOGOUT GEAR

    $scope.user = {};

    $scope.login = function() {
        $http({
            method: 'GET',
            url: $scope.appScope.servicesUrl + '/auth/signInJson',
            params: { username: $scope.user.name, password: $scope.user.password}
        }).then(function successCallback(response) {
            $scope.appScope.user.loginResult = response.data;
        }, function errorCallback(response) {
            $scope.appScope.user.loginResult = response.data;
        });
    };

    $scope.logout = function() {
        $http({
            method: 'GET',
            url: $scope.appScope.servicesUrl + '/auth/signOutJson',
        }).then(function successCallback(response) {
            $scope.appScope.user.loginResult = response.data;
        }, function errorCallback(response) {
            $scope.appScope.user.loginResult = response.data;
        });
    };

    $scope.isLoggedIn = function() {
        return $scope.user && $scope.user.loginResult && $scope.user.loginResult.principal;
    };

    $scope.getUser = function() {
        return $scope.user && $scope.user.loginResult && $scope.user.loginResult.principal;
    };

    $scope.getJwt = function() {
        return $scope.user && $scope.user.loginResult && $scope.user.loginResult.jwt;
    };


    /// NAMESPACE gear

    $scope.namespaceDropdown_toggle = function() {
        $scope.namespaceDropdown_visible = ! $scope.namespaceDropdown_visible;
    };
    $scope.namespaceDropdown_click = function(ns) {
        $scope.appScope.namespace = ns.name;
        $scope.namespaceDropdown_visible = false;
    };
    $scope.namespaceDropdown_visible = false;
    $scope.namespaces = [];
    $scope.appScope.namespace = null;

    $scope.reloadNamespaces = function() {
        $scope.loadingNamespaces = true;
        $scope.namespaces = [];

        $http({
            method: 'GET',
            url: $scope.appScope.servicesUrl + '/TreeJsonView/listNamespaces'
        }).then(function successCallback(response) {
            $scope.loadingNamespaces = false;
            $scope.namespaces = response.data;

            // if the current scope namespace is not in the new namespaces, set it to the first one

            if($scope.namespaces.length == 0) {
                $scope.appScope.namespace = null;
            }
            else {
                var found = false;
                for(var i in $scope.namespaces) {
                    if($scope.namespaces[i].name == $scope.appScope.namespace) {
                        found = true;
                        break;
                    }
                }
                if(!found) {
                    $scope.appScope.namespace = $scope.namespaces[0].name;
                }
            }
        }, function errorCallback(response) {
            $scope.loadingNamespaces = false;
        });
    };

    $scope.flagged = {};

    $scope.toggleFlagged = function(uri) {
        if($scope.flagged[uri])
            $scope.flagged[uri] = false;
        else
            $scope.flagged[uri] = true;
    };

    $scope.removeUnflagged = function() {
        var x = [];
        for(var uri in $scope.flagged) {
            if(!$scope.flagged[uri]) {
                x.push(uri);
            }
        }
        for(var i in x) {
            delete $scope.flagged[x[i]]
        }
    };

    $scope.appScope.$watch('namespace', function() {
        $scope.leftHeaderUri = null;
        $scope.rightHeaderUri = null;
        $scope.leftBodyUri = null;
        $scope.rightBodyUri = null;
        $scope.flagged = {};
    } );

    $scope.reloadNamespaces();
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
        if(! $scope.appScope.namespace) {
            $scope.classifications = [];
            return;
        }

        $scope.loading = true;
        $scope.response = "fetching";
        $scope.classifications = [];

        $http({
            method: 'GET',
            url: $scope.appScope.servicesUrl + '/TreeJsonView/listClassifications',
            params: {
                namespace: $scope.appScope.namespace
            }
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
        $scope.appScope.loadLeft(uri);
    };

    $scope.loadRight = function(uri) {
        $scope.appScope.loadRight(uri);
    };

    $scope.appScope.$watch('namespace', $scope.reload);

    $scope.reload();
};

ClassificationsListController.$inject = ['$scope', '$http', '$element'];

app.controller('ClassificationsListController', ClassificationsListController);

function ClassificationsListDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/ClassificationsList.html",
        scope: {
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
    $scope.workspaces = [];
    $scope.msg = [];

    $scope.pane = "list";

    $scope.clearMessages = function() { $scope.msg = []; };

    $scope.editForm = { uri: null, owner: null, title: null, description: null};

    $scope.reload = function() {

        $scope.loading = true;
        $scope.response = "fetching";
        $scope.workspaces = [];

        console.log('attempting to reload workspaces');

        $http({
            method: 'GET',
            url: $scope.appScope.servicesUrl + '/TreeJsonView/listWorkspaces',
            params: {
                namespace: $scope.appScope.namespace
            }

        }).then(function successCallback(response) {
            console.log(response);
            $scope.loading = false;
            $scope.loaded = true;
            $scope.workspaces = response.data;
            $scope.response = response;
            $scope.appScope.postdigestNotify();
        }, function errorCallback(response) {
            console.log(response);
            $scope.loading = false;
            $scope.response = response;
            $scope.appScope.postdigestNotify();
        });
    };

    $scope.loadLeft = function(uri) {
        $scope.appScope.loadLeft(uri);
    };

    $scope.loadRight = function(uri) {
        $scope.appScope.loadRight(uri);
    };

    $scope.createWorkspace = function() {
        $scope.msg = [];
        $http({
            method: 'POST',
            url: $scope.appScope.servicesUrl + '/TreeJsonEdit/createWorkspace',
            headers: {
                'Access-Control-Request-Headers': 'nsl-jwt',
                'nsl-jwt': $scope.appScope.getJwt()
            },
            params: {
                'namespace': $scope.appScope.namespace,
                'title': $scope.editForm.title,
                'description': $scope.editForm.description,
            }
        }).then(function successCallback(response) {
            $scope.msg = response.data.msg;
            if(response.data.success) {
                $scope.pane = "list";
            }
            $scope.reload();
        }, function errorCallback(response) {
            if(response.data && response.data.msg) {
                $scope.msg = response.data.msg;
            }
            else {
                $scope.msg = [
                    {
                        msg: response.data.status,
                        body: response.data.reason,
                        status: 'danger',  // we use danger because we got no JSON back at all
                    }
                ];
            }
        });
    };

    $scope.saveWorkspace = function() {
        $scope.msg = [];
        $http({
            method: 'POST',
            url: $scope.appScope.servicesUrl + '/TreeJsonEdit/updateWorkspace',
            headers: {
                'Access-Control-Request-Headers': 'nsl-jwt',
                'nsl-jwt': $scope.appScope.getJwt()
            },
            params: {
                'uri': $scope.editForm.uri,
                'title': $scope.editForm.title,
                'description': $scope.editForm.description,
            }
        }).then(function successCallback(response) {
            $scope.msg = response.data.msg;
            if(response.data.success) {
                $scope.pane = "list";
            }
            $scope.reload();
        }, function errorCallback(response) {
            if(response.data && response.data.msg) {
                $scope.msg = response.data.msg;
            }
            else {
                $scope.msg = [
                    {
                        msg: response.data.status,
                        body: response.data.reason,
                        status: 'danger', // we use danger because we got no JSON back at all
                    }
                ];
            }
        });
    };

    $scope.deleteWorkspace = function(ws) {
        $scope.msg = [];
        $http({
            method: 'POST',
            url: $scope.appScope.servicesUrl + '/TreeJsonEdit/deleteWorkspace',
            headers: {
                'Access-Control-Request-Headers': 'nsl-jwt',
                'nsl-jwt': $scope.appScope.getJwt()
            },
            params: {
                'uri': $scope.editForm.uri,
            }
        }).then(function successCallback(response) {
            $scope.msg = response.data.msg;
            if(response.data.success) {
                $scope.pane = "list";
            }
            $scope.reload();
        }, function errorCallback(response) {
            if(response.data && response.data.msg) {
                $scope.msg = response.data.msg;
            }
            else {
                $scope.msg = [
                    {
                        msg: response.data.status,
                        body: response.data.reason,
                        status: 'danger', // we use danger because we got no JSON back at all
                    }
                ];
            }
        });
    };

    $scope.editWorkspace = function(wsUri){
        console.log('editWorkspace');
        $scope.msg = [];
        $scope.editForm = { uri: wsUri, loaded: false, owner: null, title: null, description: null};
        $scope.pane = "edit";

        $http({
            method: 'GET',
            url: wsUri
        }).then(function successCallback(response) {
            $scope.editForm.owner = response.data.owner;
            $scope.editForm.title = response.data.title;
            $scope.editForm.description = response.data.description;
            $scope.editForm.loaded = true;

        }, function errorCallback(response) {
            $scope.msg = [
                {
                    msg: response.data.status,
                    body: response.data.reason,
                    status: 'warning',
                }
            ];
        });
    };

    $scope.editNewWorkspace = function(){
        $scope.msg = [];
        $scope.editForm = { uri: null, owner: $scope.appScope.getUser(), title: null, description: null};
        $scope.editForm.loaded = true;
        $scope.pane = "edit";
    };

    $scope.backToList = function(){
        $scope.pane = "list";
        $scope.msg = [];
    };

    $scope.appScope.$watch('namespace', $scope.reload);

    $scope.reload();
};

WorkspacesPaneController.$inject = ['$scope', '$http', '$element'];

app.controller('WorkspacesPaneController', WorkspacesPaneController);

function WorkspacesPaneDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/appWorkspacePane.html",
        scope: {
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

    $scope.reload = function() {
        if($scope.uri) {
            $scope.loading = true;
            $scope.loaded = false;
            $scope.data = null;
            $scope.response = null;
            $scope.readySubitems = false;
            $scope.subitems = null;
            $scope.isOpen = false;

            if($scope.preReload) {
                $scope.preReload();
            }

            $http({
                method: 'GET',
                url: $scope.uri
            }).then(function successCallback(response) {
                $scope.loading = false;
                $scope.loaded = true;
                $scope.response = response;
                $scope.data = response.data;
                $scope.appScope.postdigestNotify();

                if($scope.postReload) {
                    $scope.postReload();
                }
            }, function errorCallback(response) {
                $scope.loading = false;
                $scope.loaded = false;
                $scope.response = response;
                $scope.appScope.postdigestNotify();

                if($scope.postReload) {
                    $scope.postReload();
                }

            });
        }
        else {
            $scope.loading = false;
            $scope.loaded = true;
            $scope.data = null;
            $scope.response = null;
        }
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
    console.log('item header controller');

    $scope.appScope = $scope.$parent.appScope;
    $scope.itemScope = $scope;

    $rootScope.$$postDigest(function(){adjust_working_body_height()});

    // fetch the history array from the services.


    $scope.selectHistory = function(uri) {
      $scope.selected = uri;
      $scope.$emit('headerRootSelection', $scope.panelabel, uri);
    };


    $scope.dataHistory = null;
    $scope.historyWindow = null;
    $scope.selected = null;

    $scope.reloadHistory = function() {
        console.log('reload history');
        console.log('uri is ' + $scope.uri);
        if($scope.uri) {
            $scope.loadingHistory = true;
            $scope.loadedHistory = false;
            $scope.dataHistory = null;
            $scope.historyWindow = null;
            $scope.historyWindowIndex = null;
            $scope.historyMoreRecent = false;
            $scope.historyLessRecent = false;
            $scope.responseHistory = null;

            if($scope.preReload) {
                $scope.preReload();
            }

            console.log('fetching history for ' + $scope.uri);
            console.log('uri ' + $scope.uri);

            $http({
                method: 'GET',
                url: $scope.appScope.servicesUrl + '/TreeJsonView/getTreeHistory',
                params: {
                    uri: $scope.uri
                }
            }).then(function successCallback(response) {
                console.log('got history ok');
                console.log(response);
                $scope.loadingHistory = false;
                $scope.loadedHistory = true;
                $scope.dataHistory = response.data;
                $scope.appScope.postdigestNotify();

                $scope.setHistoryWindowIndex(0);
                if($scope.dataHistory.length > 0) {
                    $scope.selectHistory($scope.dataHistory[0].uri);
                }

                if($scope.postReload) {
                    $scope.postReload();
                }
            }, function errorCallback(response) {
                console.log('failed to get history');
                console.log(response);
                $scope.loadingHistory = false;
                $scope.loadedHistory = false;
                $scope.responseHistory = response;
                $scope.appScope.postdigestNotify();

                if($scope.postReload) {
                    $scope.postReload();
                }

            });
        }
        else {
            $scope.loadingHistory = false;
            $scope.loadedHistory = true;
            $scope.dataHistory = null;
        }
    };

    $scope.setHistoryWindowIndex = function(n) {
        if($scope.dataHistory) {
            $scope.historyWindowIndex = n;
            if(n+5 > $scope.dataHistory.length) {
                n = $scope.dataHistory.length - 5;
            }
            if(n < 0) {
                n = 0;
            }
            $scope.historyWindowIndex = n;
            $scope.historyWindow = $scope.dataHistory.slice(n, n+5);
            $scope.historyMoreRecent = n > 0;
            $scope.historyLessRecent = n < $scope.dataHistory.length - 5;

        }
        else {
            $scope.historyWindow = null;
            $scope.historyWindowIndex = null;
            $scope.historyMoreRecent = false;
            $scope.historyLessRecent = false;
        }
    };

    $scope.historyMoreRecentClick = function() { $scope.setHistoryWindowIndex($scope.historyWindowIndex-5); }
    $scope.historyLessRecentClick = function() { $scope.setHistoryWindowIndex($scope.historyWindowIndex+5); }

    $scope.$watch('uri', $scope.reloadHistory);

    $scope.reloadHistory();

};

ItemHeaderController.$inject = ['$scope', '$http', '$element', '$rootScope'];

app.controller('ItemHeaderController', ItemHeaderController);

function itemHeaderDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/ItemHeader.html",
        scope: {
            uri: '@uri',
            panelabel: '@panelabel',
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

    $scope.item_body_content_mouseover = function() {
        $scope.body_content_hover = true;
    };

    $scope.item_body_content_mouseleave = function() {
        $scope.body_content_hover = false;
        $scope.body_context_menu = false;
    };

    $scope.open_context_menu = function() {
        $scope.body_context_menu = true;
    };

    $scope.close_context_menu = function() {
        $scope.body_context_menu = false;
    };

    $scope.toggle_flag = function() {
        $scope.appScope.toggleFlagged($scope.uri);
        $scope.flagged = !$scope.flagged;
    };

    $scope.body_content_hover = false;
    $scope.body_context_menu = false;

    $scope.updateFlag = function() {
        $scope.flagged = $scope.appScope.flagged[$scope.uri] ? true : false;
    };

    $scope.updateFlag();
    $scope.appScope.$watch('flagged["'+$scope.uri+'"]', $scope.updateFlag);

    $scope.hideItem = false;
    $scope.hideHandle = false;
    $scope.hideIndent = false;
    $scope.readySubitems = null;
    $scope.subitems = null;
    $scope.isOpen = false;

    $scope.open = function() {
        $scope.subitems = $scope.readySubitems;
        $scope.isOpen = true;
    };

    $scope.close = function() {
        $scope.isOpen = false;
    };

    $scope.preReload = function() {
        // so there are four states
        // 1) !readySubitems
        // 2) readySubitems && !subitems
        // 3) readySubitems && subitems && !open
        // 4) readySubitems && subitems && open

        $scope.readySubitems = null;
        $scope.subitems = null;
        $scope.isOpen = false;

    };

    $scope.postReload = function() {
        if(!$scope.data) return;

        if($scope.data.class == 'au.org.biodiversity.nsl.Arrangement') {
            $scope.readySubitems = [ { contextType: 'arrangement', uri: getPreferredLink($scope.data.node) } ];

            $scope.hideItem = true;
            $scope.hideHandle = true;
            $scope.hideIndent = true;
            $scope.open();
        }

        if($scope.data.class == 'au.org.biodiversity.nsl.Node') {
            $scope.readySubitems = [];
            for(var link in $scope.data.subnodes) {
                $scope.readySubitems.push( {contextType: 'subnode', contextId: link, uri: getPreferredLink($scope.data.subnodes[link].subNode)} );
            }
            if($scope.readySubitems.length == 0) {
                $scope.readySubitems = null;
            }

            if($scope.data.typeUri.uri == "http://biodiversity.org.au/voc/boatree/BOATREE#classification-node"
                || $scope.data.typeUri.uri == "http://biodiversity.org.au/voc/boatree/BOATREE#workspace-node"
            ) {
                $scope.hideItem = true;
                $scope.hideHandle = true;
                $scope.hideIndent = true;
                $scope.open();
            }

            if($scope.data.typeUri.uri == "http://biodiversity.org.au/voc/boatree/BOATREE#classification-root"
                || $scope.data.typeUri.uri == "http://biodiversity.org.au/voc/boatree/BOATREE#workspace-root"
            ) {
                $scope.hideItem = false;
                $scope.hideHandle = true;
                $scope.hideIndent = true;
                $scope.open();
            }

        }
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

////////////////////////////////////////////////////////////

var FlaggedItemsController = function ($scope) {
};

FlaggedItemsController.$inject = ['$scope'];

app.controller('FlaggedItemsController', FlaggedItemsController);


function flaggedItemsDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/flaggedPane.html",
        controller: FlaggedItemsController,
    };
}

app.directive('flaggedItems', flaggedItemsDirective);


////////////////////////////////////////////////////////////

var MessagesController = function ($scope) {
    $scope.appScope = $scope.$parent.appScope;
    $scope.itemScope = $scope.$parent.itemScope;
};

MessagesController.$inject = ['$scope'];

app.controller('MessagesController', MessagesController);


function messagesDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/messages.html",
        controller: MessagesController,
    };
}

app.directive('messages', messagesDirective);
