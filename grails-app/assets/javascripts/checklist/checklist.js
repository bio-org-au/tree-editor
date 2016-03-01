
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
    $scope.top = null;

    $scope.fetchArrangement = function() {
        $http({
            method: 'GET',
            url: $scope.arrangementUri
        }).then(function successCallback(response) {
            $scope.arrangement = response.data;
            if(!$scope.focusUri) {
                $scope.fetchTopNode();
            }
        }, function errorCallback(response) {
            $scope.response = response;
        });
    };

    $scope.fetchTopNode = function() {
        $scope.focusNode = getPreferredLink($scope.arrangement.workingRoot);
        if(!$scope.focusNode) $scope.focusNode = getPreferredLink($scope.arrangement.currentRoot);
        if(!$scope.focusNode) $scope.focusNode = getPreferredLink($scope.arrangement.node);

        $scope.path = [$scope.focusNode];
        $scope.needJson($scope.focusNode);
    };

    $scope.needJson = function(uri) {
        if(!uri) return null;
        $scope.initJson(uri);

        if(!$scope.cache[uri].fetched) {
            $scope.refetchJson(uri);
        }

        return $scope.cache[uri];
    }

    $scope.refetchJson = function(uri) {
        if(!uri) return null;
        $scope.initJson(uri);

        if(!$scope.cache[uri].fetching) {
            $scope.cache[uri].fetching = true;

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

    $scope.initJson = function(uri) {
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
    };

    $scope.clickPath = function(i) {
        $scope.focusNode = $scope.path[i];
        $scope.path = $scope.path.slice(0, i + 1);
    };

    $scope.clickSubPath = function(a) {
        if(a.length < 1) return; // this never happens
        for(u in a) {
            $scope.path.push(a[u]);
        }
        $scope.focusNode = a[a.length - 1];
    }

    $scope.clickNewWindow = function(i) {
        window.open($rootScope.pagesUrl + "/editnode/checklist?arrangement="+ $scope.arrangementUri +"&node=" + $scope.path[i], '_blank');
    };

    $scope.fetchArrangement();

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
            focusUri: "@",
            listType: '@listType',
        },
    };
}

app.directive('checklist', checklistDirective);

var GetJsonController = function ($scope) {
    // everyone needs this
    $scope.getPreferredLink = getPreferredLink;
    $scope.cl_scope = $scope.$parent.cl_scope;

    $scope.json = $scope.cl_scope.needJson($scope.uri);
    if($scope.afterUpdateJson) {
        $scope.afterUpdateJson();
    }

    $scope.checkState = function(event, uri, json) {
        if(uri == $scope.uri) {
            $scope.json = json;
            if($scope.afterUpdateJson) {
                $scope.afterUpdateJson();
            }
        }
    };

    $scope.$on('nsl-json-fetched', $scope.checkState);

    $scope.$watch('uri', function(){
        $scope.json = $scope.cl_scope.needJson($scope.uri);
    });

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
        if($scope.json.fetched) {
            $scope.hasSubnodes = $scope.json.subnodes && $scope.json.subnodes.length > 0;
        }
        else {
            $scope.hasSubnodes = false;
        }
    };

    GetJsonController($scope);

    $scope.UI = $scope.cl_scope.nodeUI[$scope.uri];

    $scope.clickUpArrow = function(){
        $scope.clickSubPath([]);
    };

    $scope.clickSubPath = function(a) {
        a.unshift($scope.uri);
        $scope.$parent.clickSubPath(a);
    }

    $scope.clickNewWindow = function() {
        window.open($rootScope.pagesUrl + "/editnode/checklist?arrangement="+ $scope.cl_scope.arrangementUri +"&node=" + $scope.uri, '_blank');
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
