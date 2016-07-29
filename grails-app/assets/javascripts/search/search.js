/***********************************
 * search.js
 */

console.log("loading search.js");

var SearchController = ['$scope', '$rootScope', '$http', 'jsonCache', function ($scope, $rootScope, $http, jsonCache) {


    // ok. deal with initialisation.

    $scope.tree = jsonCache.needJson($scope.treeUri);
    $scope.root = jsonCache.needJson($scope.rootUri);
    $scope.focus = jsonCache.needJson($scope.focusUri);
    $scope.decidedOnPath = false;

    $scope.showLimitDropdown = false;
    $scope.pagesUrl = $rootScope.pagesUrl;

    $scope.inProgress = false;

    $scope.clickSearchSubtree = function(p) {
        $scope.searchSubtree = p;
        $scope.showLimitDropdown = false;
    };

    $scope.clickToggleDropdown = function() {
        $scope.showLimitDropdown = !$scope.showLimitDropdown;
    };

    $scope.hideDropdown = function() {
        $scope.showLimitDropdown = false;
    };

    $scope.clickGoButton = function() {
        $rootScope.msg = null;

        if($scope.inProgress) {
            $rootScope.msg = { msg: 'in progress', status: 'info', body: 'search is already in progress' };
            return;
        }

        $scope.inProgress = true;

        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonView/searchNamesInSubtree',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            data: {
                searchSubtree: $scope.searchSubtree ? $scope.searchSubtree : $scope.rootUri,
                searchText: $scope.searchText
            }
        }).then(function successCallback(response) {
            $scope.inProgress = false;
            if (response.data && response.data.msg) {
                $rootScope.msg = response.data.msg;
            }

            $scope.results = [];
            for(var results_i in response.data.results) {
              var r =  response.data.results[results_i];
                $scope.results[results_i] = { nodeUri: r.node, node: jsonCache.needJson(r.node), matchedUri: r.matched, matched: jsonCache.needJson(r.matched)};
            }

        }, function errorCallback(response) {
            if (response.data && response.data.msg) {
                $rootScope.msg = response.data.msg;
            }
            else if (response.data.status) {
                $rootScope.msg = [
                    {
                        msg: 'URL',
                        body: response.config.url,
                        status: 'info'
                    },
                    {
                        msg: response.data.status,
                        body: response.data.reason,
                        status: 'danger'
                    }
                ];
            }
            else {
                $rootScope.msg = [
                    {
                        msg: 'URL',
                        body: response.config.url,
                        status: 'info'
                    },
                    {
                        msg: response.status,
                        body: response.statusText,
                        status: 'danger'
                    }
                ];
            }
        });
    };
        
    var deregisterInitializationListener = [];

    function initializationListener(oldvalue, newvalue) {
        var madeAChange;
        do {
            madeAChange = false;

            // set the arrangement to the root arrangement if we can and need to

            if (!$scope.treeUri && $scope.rootUri && $scope.root.fetched) {
                $scope.treeUri = getPreferredLink($scope.root.arrangement);
                $scope.tree = jsonCache.needJson($scope.treeUri);
                madeAChange = true;
            }

            // set the arrangement to the focus is we can and need to

            if (!$scope.treeUri && $scope.focusUri && $scope.focus.fetched) {
                $scope.treeUri = getPreferredLink($scope.focus.arrangement);
                $scope.tree = jsonCache.needJson($scope.treeUri);
                madeAChange = true;
            }

            // get the root off the arrangement if we can and need to

            if (!$scope.rootUri && $scope.treeUri && $scope.tree.fetched) {
                // this needs some more logic. if its a workspace but its not one of ours, use the current rather than working root
                $scope.rootUri = getPreferredLink($scope.tree.node);
                if (!$scope.rootUri) $scope.rootUri = getPreferredLink($scope.tree.currentRoot);
                $scope.root = jsonCache.needJson($scope.rootUri);
                madeAChange = true;
                return;
            }

            // set the focus to the root, if we can and need to
            if (!$scope.focusUri && $scope.rootUri) {
                $scope.focusUri = $scope.rootUri;
                $scope.focus = jsonCache.needJson($scope.focusUri);
                madeAChange = true;
            }
        }
        while (madeAChange);


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
                        $scope.rootUri = $scope.focusUri;
                        $scope.path = [$scope.rootUri];
                    }
                    else {
                        for (var i in $scope.path) {
                            jsonCache.needJson($scope.path[i]);
                        }
                        $scope.searchSubtree = $scope.path[$scope.path.length-1];
                    }

                }, function errorCallback(response) {
                    $scope.rootUri = $scope.focusUri;
                    $scope.path = [$scope.focusUri];
                });

            }
        }

        if ($scope.treeUri && $scope.tree.fetched && $scope.rootUri && $scope.root.fetched && $scope.focusUri && $scope.focus.fetched) {
            for (var i in deregisterInitializationListener) {
                deregisterInitializationListener[i]();
            }
        }

    }

    deregisterInitializationListener.push($scope.$watch("treeUri", initializationListener));
    deregisterInitializationListener.push($scope.$watch("tree.fetched", initializationListener));
    deregisterInitializationListener.push($scope.$watch("rootUri", initializationListener));
    deregisterInitializationListener.push($scope.$watch("root.fetched", initializationListener));
    deregisterInitializationListener.push($scope.$watch("focusUri", initializationListener));
    deregisterInitializationListener.push($scope.$watch("focus.fetched", initializationListener));
    
    
    
    
}];

app.controller('Search', SearchController);

app.directive('search', [ function() {
    return {
        templateUrl: pagesUrl + "/assets/ng/search/search.html",
        controller: SearchController,
        scope: {
            rootUri: '@rootUri',
            focusUri: '@focusUri',
            treeUri: '@treeUri'
        }
    };
}]);
