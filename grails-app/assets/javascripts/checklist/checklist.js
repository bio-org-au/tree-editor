
// a checklist holds a context and a focus. it displays a breadcrumb trail and the tree

// it is initialised with a uri and a 'workspace or classsification' setting.
// if it is initialised with a classigiction, it navigates to the root node.
// if it is initialised with a workspace, it goes to the workspaceRoot.

//= require get-preferred-link

var ChecklistController = function ($scope, $rootScope, $http) {
    $scope.cl_scope = $scope;

    $scope.arrangement = null;
    $scope.cache = {};
    $scope.nodeUi = {}; // this is where I remember which nodes are open, etc
    $scope.path = [];
    $scope.top = null;

    $scope.fetchArrangement = function() {
        $http({
            method: 'GET',
            url: $scope.initialUri
        }).then(function successCallback(response) {
            $scope.arrangement = response.data;
            $scope.fetchTopNode();
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

        /*
        $http({
            method: 'GET',
            url: $scope.initialUri
        }).then(function successCallback(response) {
            $scope.arrangement = response.data;
            $scope.fetchTopNode();
        }, function errorCallback(response) {
            $scope.response = response;
        });
        */
    };


    $scope.fetchArrangement();

    $scope.needJson = function(uri) {
        if(!uri) return null;

        if(!$scope.cache[uri]) {
            $scope.refetchJson(uri);
        }

        return $scope.cache[uri];
    }

    $scope.refetchJson = function(uri) {
        if(!uri) return null;

        if(!$scope.cache[uri]) {
            $scope.cache[uri] = {
                "_links": {"permalink": {"link": uri, "preferred": true}},
                fetching: false,
                fetched: false
            };
        }


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

        return $scope.cache[uri];
    }
};

ChecklistController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Checklist', ChecklistController);

var checklistDirective = function() {
    return {
        templateUrl: "/tree-editor/assets/ng/checklist/checklist.html",
        controller: ChecklistController,
        scope: {
            initialUri: '@uri',
            listType: '@listType',
        },
    };
}

app.directive('checklist', checklistDirective);

var GetJsonController = function ($scope) {
    $scope.cl_scope = $scope.$parent.cl_scope;

    $scope.json = $scope.cl_scope.needJson($scope.uri);

    $scope.checkState = function(event, uri, json) {
        if(uri == $scope.uri) {
            $scope.json = json;
        }
    };

    $scope.$on('nsl-json-fetched', $scope.checkState);
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

