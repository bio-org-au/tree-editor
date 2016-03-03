
// a checklist holds a context and a focus. it displays a breadcrumb trail and the tree

// it is initialised with a uri and a 'workspace or classsification' setting.
// if it is initialised with a classigiction, it navigates to the root node.
// if it is initialised with a workspace, it goes to the workspaceRoot.

//= require get-preferred-link

var ChecklistController = function ($scope, $rootScope, $http) {
    $scope.cl_scope = $scope;

    $scope.arrangement = null;
    $scope.cache = {};
    $scope.nodeUI = {}; // this is where I remember which nodes are open, etc
    $scope.path = [];

    $scope.currentJson = function(uri) {
        if(!uri) return null;

        if(!$scope.nodeUI[uri]) {
            $scope.nodeUI[uri] = { open: false };
        }

        if(!$scope.cache[uri]) {
            $scope.cache[uri] = {
                "_links": {"permalink": {"link": uri, "preferred": true}},
                fetching: false,
                fetched: false
            };
        }

        return $scope.cache[uri];
    }

    $scope.needJson = function(uri) {
        if(!uri) return null;
        var json = $scope.currentJson(uri);

        if(!json.fetched) {
            $scope.refetchJson(uri);
        }

        return $scope.cache[uri];
    }

    $scope.refetchJson = function(uri) {
        if(!uri) return null;
        var json = $scope.currentJson(uri);

        if(!json.fetching) {
            json.fetching = true;

            $http({
                method: 'GET',
                url: uri
            }).then(function successCallback(response) {
                $scope.cache[uri] = response.data;
                response.data.fetching = false;
                response.data.fetched = true;
                // if anyone is using this node, let them know
                $scope.$broadcast('nsl-json-fetched', uri, response.data);
            }, function errorCallback(response) {
                $scope.cache[uri].fetching = false;
            });
        }

        return $scope.cache[uri];
    }

    // loads a uri, with a callback

    $scope.loadJson = function(uri, callback) {
        if(!uri) {
            callback(null, null);
            return;
        }

        $scope.needJson(uri);
        var callBackDone;

        function onjsonfetched(event1, uri1, json1) {
            var json = $scope.currentJson(uri);
            if(!json.fetching) {
                callBackDone();
                callback(uri, json);
            }
        }

        callBackDone = $scope.$on('nsl-json-fetched', onjsonfetched);
        onjsonfetched();
    };

    $scope.clickPath = function(i) {
        $scope.focusUri = $scope.path[i];
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
    }

    $scope.clickTrashBookmark = function(uri) {
        $rootScope.removeBookmark('taxa-nodes', uri);
    };
    $scope.clickClearBookmarks = function(uri) {
        $rootScope.clearBookmarks('taxa-nodes');
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

    $scope.arrangement =  $scope.needJson($scope.arrangementUri);
    $scope.needJson($scope.rootUri);
    $scope.needJson($scope.focusUri);

    var deregisterPathInitializationListener;
    function pathInitializationListener(event, uri, json) {
        var arrangement = $scope.currentJson($scope.arrangementUri);
        var root = $scope.currentJson($scope.rootUri);
        var focus = $scope.currentJson($scope.focusUri);

        if(!$scope.rootUri && arrangement && arrangement.fetched) {
            // this needs some more logic. if its a workspace but its not one of ours, use the current rather than working root

            $scope.rootUri = getPreferredLink(arrangement.workingRoot);
            if(!$scope.rootUri) $scope.rootUri = getPreferredLink(arrangement.currentRoot);
            if(!$scope.rootUri) $scope.rootUri = getPreferredLink(arrangement.node);
            $scope.needJson($scope.rootUri);
        }

        // right. we deregister ourselves when we have the path. that's the goal.

        if($scope.rootUri && (!$scope.focusUri || $scope.focusUri==$scope.rootUri)) {
            $scope.focusUri = $scope.rootUri;
            $scope.path = [$scope.rootUri];
            deregisterPathInitializationListener();
        }
        else
        if($scope.rootUri && $scope.focusUri && $scope.focusUri!=$scope.rootUri) {
            $scope.path = [$scope.focusUri];
            deregisterPathInitializationListener();

            $http({
                method: 'GET',
                url: $rootScope.servicesUrl + '/TreeJsonView/findPath',
                params: {
                    root: $scope.rootUri,
                    focus: $scope.focusUri
                }
            }).then(function successCallback(response) {
                $scope.path = response.data;
                for(var i in $scope.path) {
                    $scope.needJson($scope.path[i]);
                    $scope.nodeUI[$scope.path[i]].open = true;
                }

            }, function errorCallback(response) {
                $scope.loadingNamespaces = false;
            });

        }
    }
    deregisterPathInitializationListener = $scope.$on('nsl-json-fetched', pathInitializationListener);
    pathInitializationListener();

    var deregisterArrangementInitializationListener;
    function arrangementInitializationListener(event, uri, json) {
        $scope.arrangement = $scope.currentJson($scope.arrangementUri);
        var root = $scope.currentJson($scope.rootUri);

        if(!$scope.arrangementUri && root && root.fetched) {
            $scope.arrangementUri = getPreferredLink(json.arrangement);
            $scope.needJson($scope.arrangementUri);
        }

        // right. we deregister ourselves when we know what our arrangement is. that's the goal.

        if($scope.arrangement && $scope.arrangement.fetched) {
            deregisterArrangementInitializationListener();
        }
    }
    deregisterArrangementInitializationListener = $scope.$on('nsl-json-fetched', arrangementInitializationListener);
    arrangementInitializationListener();


    // kick off the initialization;
    $scope.$broadcast('nsl-json-fetched', null, null);

    if($scope.focusUri) {
        $scope.focusNode = $scope.focusUri;
        $scope.path = [$scope.focusNode];
        $scope.needJson($scope.focusNode);
    }

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

var GetJsonController = function ($scope) {
    // everyone needs this
    $scope.getPreferredLink = getPreferredLink;
    $scope.cl_scope = $scope.$parent.cl_scope;

    $scope.refetchUriAndJson = function() {
        $scope.json = $scope.cl_scope.needJson($scope.uri);
        if($scope.afterUpdateJson) {
            $scope.afterUpdateJson();
        }
        $scope.cl_scope.loadJson($scope.uri, function(uri, json) {
            $scope.json = json;
            if($scope.afterUpdateJson) {
                $scope.afterUpdateJson();
            }
        });
    };

    $scope.refetchUriAndJson();

    $scope.$watch('uri', $scope.refetchUriAndJson);

}

GetJsonController.$inject = ['$scope'];

app.controller('GetJsonController', GetJsonController);

var shortnodetextDirective = function() {
    return {
        templateUrl: "/tree-editor/assets/ng/checklist/shortnodetext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        },
    };
}

app.directive('shortnodetext', shortnodetextDirective);

var shortnametextDirective = function() {
    return {
        templateUrl: "/tree-editor/assets/ng/checklist/shortnametext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        },
    };
}

app.directive('shortnametext', shortnametextDirective);

var NodelistController = function ($scope, $rootScope, $http) {
    GetJsonController($scope);

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
            uri: "@"
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

    $scope.afterUpdateJson = function() {
        if($scope.json && $scope.json.fetched) {
            $scope.hasSubnodes = $scope.json.subnodes && $scope.json.subnodes.length > 0;
        }
        else {
            $scope.hasSubnodes = false;
        }

        $scope.name = null;
        $scope.taxon = null;
        $scope.resource = null;


        $scope.cl_scope.loadJson($scope.uri, function(node_uri, node_json) {
            $scope.name = null;
            $scope.taxon = null;
            $scope.resource = null;

            if ($scope.json && $scope.json.fetched) {
                if (!$scope.json.taxonUri && $scope.json.nameUri && $scope.json.nameUri.uri) {
                    $scope.cl_scope.loadJson($scope.json.nameUri.uri, function (name_uri, name_json) {
                        $scope.name = name_json;
                    });
                }
                if ($scope.json.taxonUri && $scope.json.taxonUri.uri) {
                    $scope.cl_scope.loadJson($scope.json.taxonUri.uri, function (taxon_uri, taxon_json) {
                        $scope.taxon = taxon_json;
                    });
                }
                //if ($scope.json.resourceUri && $scope.json.resourceUri.uri) {
                //    $scope.cl_scope.loadJson($scope.json.resourceUri.uri, function (resource_uri, resource_json) {
                //        $scope.resource = resource_json;
                //    });
                //}
            }
        });


    };

    GetJsonController($scope);

    $scope.node = $scope.cl_scope.needJson($scope.uri);

    $scope.afterUpdateJson();

    $scope.UI = $scope.cl_scope.nodeUI[$scope.uri];

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
