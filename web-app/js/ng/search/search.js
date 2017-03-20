/***********************************
 * search.js
 */

console.log("loading search.js");

var SearchController = ['$scope', '$rootScope', '$http', 'jsonCache', '$routeParams', function ($scope, $rootScope, $http, jsonCache, $routeParams) {
    // ok. deal with initialisation.

    $scope.treeUri = $routeParams.tree;

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
            url: $rootScope.servicesUrl + '/TreeJsonView/searchNamesInArrangement',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            data: {
                arrangement: $scope.treeUri,
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
        
}];

app.controller('Search', SearchController);

app.directive('search', [ function() {
    return {
        templateUrl: pagesUrl + "/ng/search/search.html",
        controller: SearchController,
        scope: {
            rootUri: '@rootUri',
            focusUri: '@focusUri',
            treeUri: '@treeUri'
        }
    };
}]);
