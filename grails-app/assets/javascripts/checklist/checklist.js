
// a checklist holds a context and a focus. it displays a breadcrumb trail and the tree

// it is initialised with a uri and a 'workspace or classsification' setting.
// if it is initialised with a classigiction, it navigates to the root node.
// if it is initialised with a workspace, it goes to the workspaceRoot.

//= require get-preferred-link
//= require utility/get-json-controller
//= require utility/get-uri-permissions


function allowDropUri(ev) {
    if(ev.dataTransfer.getData("au.org.biodiversity.nsl.uri-list")) {
        ev.preventDefault();
    }
}

function dragUri(ev) {
    var s = $(ev.target).scope();
    ev.dataTransfer.setData("au.org.biodiversity.nsl.uri-list", JSON.stringify(s.getDragUriList()));
}

function dropUri(ev) {
    ev.preventDefault();
    var uriList = JSON.parse(ev.dataTransfer.getData("au.org.biodiversity.nsl.uri-list"))
    var scope;
    for(scope = $(ev.target).closest('.ng-scope').scope(); scope && !scope.dropUriList ; scope = scope.$parent) {
    }
    // have to use timeout to get out of the apply loop
    window.setTimeout(function() {
        scope.$apply(function() {
            scope.dropUriList(uriList);
        });
    }, 0);
}

function CanAcceptDrops($scope, $rootScope, $http) {
    $scope.clearDropState = function() {
        $scope.nodeDropState = {
            open: false,
            inProgress: false,
            msg: null,
            action: null,
            uriList: null,
            chooseAction: null,
        };
    };

    $scope.dropUriList = function(uriList) {
        if($scope.nodeDropState.open) return; // we have another drop in progress
        $scope.clearDropState();
        $scope.nodeDropState.open = true;
        $scope.nodeDropState.uriList = uriList;
        $scope.sendDrop();
    };

    $scope.sendDrop = function() {
        if($scope.nodeDropState.inProgress) return; // we have another drop in progress

        var action = $scope.nodeDropState.action ? $scope.nodeDropState.action.action : null;

        console.log("sending drop");
        console.log({
            'root': $scope.rootUri,
            'focus': $scope.focusUri,
            'target': $scope.uri,
            'dropAction': action,
            'uris': $scope.nodeDropState.uriList
        });

        $scope.nodeDropState.inProgress = true;


        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/dropUrisOntoNode',
            headers: {
                'Access-Control-Request-Headers': 'nsl-jwt',
                'nsl-jwt': $rootScope.getJwt()
            },
            params: {
                'root': $scope.rootUri,
                'focus': $scope.focusUri,
                'target': $scope.uri,
                'dropAction': action,
                'uris': $scope.nodeDropState.uriList
            }
        }).then(function successCallback(response) {
            $scope.nodeDropState.inProgress = false;

            console.log(response);

            // general message message
            if(response.data.msg) {
                $scope.nodeDropState.msg = response.data.msg;
            }

            if(response.data.success) {
                $scope.nodeDropState.open = false;
                $scope.nodeDropState.inProgress = true;

                if(!$rootScope.msg)
                    $rootScope.msg = [response.data.msg];
                else
                    $rootScope.msg.push(response.data.msg);
            }
            else {
                $scope.nodeDropState.chooseAction = response.data.chooseAction;
            }

        }, function errorCallback(response) {
            $scope.nodeDropState.inProgress = false;
            $scope.nodeDropState.open = false;

            if(response.data && response.data.msg) {
                $rootScope.msg = response.data.msg;
            }
            else if(response.data.status) {
                $rootScope.msg = [
                    {
                        msg: response.data.status,
                        body: response.data.reason,
                        status: 'danger',  // we use danger because we got no JSON back at all
                    }
                ];
            }
            else  {
                console.log(response);
                $rootScope.msg = [
                    {
                        msg: 'URL',
                        body: response.config.url,
                        status: 'info',
                    },
                    {
                        msg: response.status,
                        body: response.statusText,
                        status: 'danger',  // we use danger because we got no JSON back at all
                    }
                ];
            }
        });

        if($scope.nodeDropState.action == null) {
            $scope.nodeDropState.msg = null;

        }
        else {
            $scope.nodeDropState.msg = $scope.nodeDropState.action.msg;

        }
        $scope.nodeDropState.action = null;
        $scope.nodeDropState.options = null;


    };

    $scope.clearDropState();

}

var ChecklistController = function ($scope, $rootScope, $http) {
    $scope.foo = "I AM A CHECKLIST!";
    $scope.cl_scope = $scope;

    setupJsonCache($rootScope, $http);

    $scope.rootPermissions = {};

    $scope.focusPermissions = {};

    $scope.refreshPermissions = function() {
        $scope.rootPermissions = {};
        get_uri_permissions($rootScope, $http, $scope.rootUri, function(data, success) {
            if(success)
                $scope.rootPermissions = data;
        });
        $scope.focusPermissions = {};
        get_uri_permissions($rootScope, $http, $scope.focusUri, function(data, success) {
            if(success)
                $scope.focusPermissions = data;
        });
    };

    $scope.getRootUri = function() {return "I AM A ROOT URI";};
    $scope.getFocusUri = function() {return $scope.getFocusUri;};

    $scope.$watch('rootUri', $scope.refreshPermissions);

    $scope.$watch('focusUri', $scope.refreshPermissions);

    $rootScope.$on('nsl-tree-editor.loginlogout', $scope.refreshPermissions);

    $scope.arrangement = null;
    $scope.nodeUI = {}; // this is where I remember which nodes are open, etc
    $scope.path = [];

    $scope.getNodeUI = function(uri) {
        if(!$scope.nodeUI[uri]) {
            $scope.nodeUI[uri] = { open: false };
        }
        return $scope.nodeUI[uri];
    };

    $scope.clickPath = function(i) {
        $scope.focusUri = $scope.path[i];
        $scope.focus = $rootScope.needJson($scope.focusUri);
        $scope.path = $scope.path.slice(0, i + 1);
    };

    $scope.clickPathBookmark = function(i) {
        $rootScope.addBookmark('taxa-nodes', $scope.path[i]);
    };

    $scope.clickPathNewWindow = function(i) {
        window.open($rootScope.pagesUrl + "/editnode/checklist?root="+ $scope.rootUri +"&focus=" + $scope.path[i], '_blank');
    };

    $scope.clickSubPath = function(a) {
        if(a.length < 1) return; // this never happens
        for(u in a) {
            $scope.path.push(a[u]);
        }
        $scope.focusUri = a[a.length - 1];
        $scope.focus = $rootScope.needJson($scope.focusUri);
    }

    $scope.clickBookmark = function(uri) {
        window.location = $rootScope.pagesUrl + "/editnode/checklist?focus=" + uri;
    };
    $scope.clickTrashBookmark = function(uri) {
        $rootScope.removeBookmark('taxa-nodes', uri);
    };
    $scope.clickClearBookmarks = function(uri) {
        $rootScope.clearBookmarks('taxa-nodes');
    };

    $scope.clickSearchAddNames = function() {
        window.open($rootScope.pagesUrl + "/editnode/searchEmbedded?root="+ $scope.rootUri +"&focus=" + $scope.focusUri);
    };

    // bookmark gear
    $scope.taxanodes_bookmarks = $rootScope.getBookmarks('taxa-nodes');
    $scope.$on('nsl-tree-edit.bookmark-changed', function(event, category, uri, status){
        if(category == 'taxa-nodes') {
            $scope.taxanodes_bookmarks = $rootScope.getBookmarks('taxa-nodes');
        }
    });
    $scope.$on('nsl-tree-edit.namespace-changed', function(event) {
        $scope.taxanodes_bookmarks = $rootScope.getBookmarks('taxa-nodes');
    });


    // ok. deal with initialisation.

    $scope.arrangement =  $rootScope.needJson($scope.arrangementUri);
    $scope.root = $rootScope.needJson($scope.rootUri);
    $scope.focus =  $rootScope.needJson($scope.focusUri);
    $scope.decidedOnPath = false;

    var deregisterInitializationListener = [];

    function initializationListener(oldvalue, newvalue) {
        console.log("Executing initialization listener " + oldvalue + " --> " + newvalue);

        var madeAChange;
        do {
            madeAChange = false;

            // set the arrangement to the root arrangement if we can and need to

            if (!$scope.arrangementUri && $scope.rootUri && $scope.root.fetched) {
                $scope.arrangementUri = getPreferredLink(root.arrangement);
                $scope.arrangement = $rootScope.needJson($scope.arrangementUri);
                madeAChange = true;
            }

            // set the arrangement to the focus is we can and need to


            if (!$scope.arrangementUri && $scope.focusUri && $scope.focus.fetched) {
                console.log("setting the arrangement from the focus");
                console.log($scope.focus);

                $scope.arrangementUri = getPreferredLink($scope.focus.arrangement);
                $scope.arrangement = $rootScope.needJson($scope.arrangementUri);
                madeAChange = true;
            }

            // get the root off the arrangement if we can and need to

            if (!$scope.rootUri && $scope.arrangementUri && $scope.arrangement.fetched) {
                console.log("getting the root off the arramngement");
                console.log($scope.arrangement);

                // this needs some more logic. if its a workspace but its not one of ours, use the current rather than working root
                $scope.rootUri = getPreferredLink($scope.arrangement.node);
                if (!$scope.rootUri) $scope.rootUri = getPreferredLink($scope.arrangement.currentRoot);
                $scope.root = $rootScope.needJson($scope.rootUri);
                madeAChange = true;
                return;
            }

            // set the focus to the root, if we can and need to
            if (!$scope.focusUri && $scope.rootUri) {
                console.log("setting the focus to the root");

                $scope.focusUri = $scope.rootUri;
                $scope.focus = $rootScope.needJson($scope.focusUri);
                madeAChange = true;
            }
        }
        while(madeAChange);


        // if we have a root and a focus, set up the path

        if (!$scope.decidedOnPath && $scope.rootUri && $scope.focusUri) {
            $scope.decidedOnPath = true;

            if ($scope.focusUri == $scope.rootUri) {
                $scope.path = [$scope.rootUri];
            }
            else {
                $http({
                    method: 'GET',
                    url: $rootScope.servicesUrl + '/TreeJsonView/findPath',
                    params: {
                        root: $scope.rootUri,
                        focus: $scope.focusUri
                    }
                }).then(function successCallback(response) {
                    $scope.path = response.data;

                    if ($scope.path.length == 0) {
                        // no path from the root to the focus. just use the focus as the root.
                        console.log("no path from the root to the focus. just use the focus as the root");
                        $scope.rootUri = $scope.focusUri;
                        $scope.path = [$scope.rootUri];
                    }
                    else {
                        for (var i in $scope.path) {
                            $rootScope.needJson($scope.path[i]);
                            $scope.getNodeUI($scope.path[i]).open = true;
                        }
                    }
                }, function errorCallback(response) {
                    console.log("setting path to focus because failed to get path");
                    console.log(response);
                    $scope.rootUri = $scope.focusUri;
                    $scope.path = [$scope.focusUri];
                });

            }
        }

        if($scope.arrangementUri && $scope.arrangement.fetched && $scope.rootUri && $scope.root.fetched && $scope.focusUri && $scope.focus.fetched) {
            for(var i in deregisterInitializationListener) {
                deregisterInitializationListener[i]();
            }
        }

    }

    deregisterInitializationListener.push($scope.$watch("arrangementUri", initializationListener));
    deregisterInitializationListener.push($scope.$watch("arrangement.fetched", initializationListener));
    deregisterInitializationListener.push($scope.$watch("rootUri", initializationListener));
    deregisterInitializationListener.push($scope.$watch("root.fetched", initializationListener));
    deregisterInitializationListener.push($scope.$watch("focusUri", initializationListener));
    deregisterInitializationListener.push($scope.$watch("focus.fetched", initializationListener));

    $scope.getDragUriList = function() {
        return [$scope.focusUri];
    }

    CanAcceptDrops($scope, $rootScope, $http);

};

ChecklistController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Checklist', ChecklistController);

var checklistDirective = function() {
    return {
        templateUrl: "/tree-editor/assets/ng/checklist/checklist.html",
        controller: ChecklistController,
        scope: {
            arrangementUri: "@",
            rootUri: "@",
            focusUri: "@"
        },
    };
}

app.directive('checklist', checklistDirective);

var NodelistController = function ($scope, $rootScope, $http) {
    $scope.foo = "I AM A NODE LIST!";

    $scope.cl_scope = $scope.$parent.cl_scope;
    GetJsonController($scope, $rootScope);

    $scope.getRootUri = function() {return "I am a root uri!"};
    $scope.getFocusUri = function() {$scope.$parent.getFocusUri();};

    $scope.clickSubPath = function(a) {
        $scope.$parent.clickSubPath(a);
    }

};

NodelistController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Nodelist', NodelistController);

var nodelistDirective = function(RecursionHelper) {
    return {
        templateUrl: "/tree-editor/assets/ng/checklist/nodelist.html",
        controller: NodelistController,
        scope: {
            uri: "@",
        },
        compile: function(element) {
            return RecursionHelper.compile(element, function (scope, iElement, iAttrs, controller, transcludeFn) {
                // Define your normal link function here.
                // Alternative: instead of passing a function,
                // you can also pass an object with
                // a 'pre'- and 'post'-link function.
            });
        },
    };
};

nodelistDirective.$inject = ['RecursionHelper'];

app.directive('nodelist', nodelistDirective);

var NodeitemController = function ($scope, $rootScope, $http) {
    $scope.foo = "I AM A NODE ITEM!";

    $scope.cl_scope = $scope.$parent.cl_scope;

    $scope.afterUpdateJson = function() {
        if($scope.json && $scope.json.fetched) {
            $scope.hasSubnodes = $scope.json.subnodes && $scope.json.subnodes.length > 0;
        }
        else {
            $scope.hasSubnodes = false;
        }
    };

    GetJsonController($scope, $rootScope);

    $scope.getRootUri = function() {"I, also, am a root uri!"};
    $scope.getFocusUri = function() {$scope.$parent.getFocusUri();};

    $scope.node = $rootScope.needJson($scope.uri);

    $scope.UI = $scope.cl_scope.getNodeUI($scope.uri);

    $scope.rootUri = $scope.$parent.rootUri;
    $scope.focusUri = $scope.$parent.focusUri;


    CanAcceptDrops($scope, $rootScope, $http);

    $scope.getDragUriList = function() {
        return [$scope.uri];
    }

    $scope.clickBookmark = function() {
        $rootScope.addBookmark('taxa-nodes', $scope.uri);
    };

    $scope.clickUpArrow = function(){
        $scope.UI.open = true;
        $scope.clickSubPath([]);
    };

    $scope.clickSubPath = function(a) {
        a.unshift($scope.uri);
        $scope.$parent.clickSubPath(a);
    }

    $scope.clickNewWindow = function() {
        window.open($rootScope.pagesUrl + "/editnode/checklist?root="+ $scope.cl_scope.rootUri +"&focus=" + $scope.uri, '_blank');
    };

};

NodeitemController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Nodeitem', NodeitemController);

var nodeitemDirective = function() {
    return {
        templateUrl: "/tree-editor/assets/ng/checklist/nodeitem.html",
        controller: NodeitemController,
        scope: {
            uri: "@"
        },
    };
};

app.directive('nodeitem', nodeitemDirective);


var droptargetDirective = function() {
    return {
        templateUrl: "/tree-editor/assets/ng/checklist/droptarget.html"
    };
};

app.directive('droptarget', droptargetDirective);
