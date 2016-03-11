//= require get-preferred-link
//= require utility/get-json-controller
//= require utility/get-form-json

var SearchembeddedController = function ($scope, $rootScope, $http, $element) {
    setupJsonCache($rootScope, $http);

    if (!$scope.focusUri && $scope.rootUri) {
        $scope.focusUri = $scope.rootUri;
    }

    $scope.root = $rootScope.needJson($scope.rootUri);
    $scope.focus =$rootScope.needJson($scope.focusUri);

    $scope.selected = [];

    $scope.submissionCount = 0;

    $scope.hasResults = false;
    $scope.hasSelectedNames = false;
    $scope.tab = 'searchTab';

    $scope.swipeOn = true;

    $scope.formSubmitted = function() {
        $scope.submissionCount++;

        var searchParams = {};
        var a = $element.find('#search').serializeArray();
        for(i in a) {
            searchParams[a[i].name] = a[i].value;
        }

        searchParams['product'] = $rootScope.namespace;

        $scope.searching = true;

        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonView/searchNames',
            params: searchParams
        }).then(function successCallback(response) {
            $scope.searching = false;
            $scope.searchResults = response.data;
            $scope.searchError = null;
            $scope.hasResults = true;
        }, function errorCallback(response) {
            $scope.searching = false;
            $scope.searchError = response;
        });

        $scope.tab = 'resultsTab';

    };

    $scope.clickSearchTab = function() {
        $scope.tab = 'searchTab';
    };

    $scope.clickResultsTab = function() {
        if($scope.hasResults)
            $scope.tab = 'resultsTab';
    };

    $scope.clickSelectedNamesTab = function() {
        if($scope.hasSelectedNames)
            $scope.tab = 'selectedNamesTab';
    };


    $scope.toggleSelection = function (uri) {
        var found = false;
        var newselected = new Array;
        for (i in $scope.selected) {
            if ($scope.selected[i] == uri) {
                found = true;
            }
            else {
                newselected.push($scope.selected[i]);
            }
        }
        if (!found) {
            newselected.push(uri);
        }

        $scope.selected = newselected;
        $scope.swipeOn = !found;

        $scope.$broadcast('nsl-tree-editor.selection', uri, !found);
    };

    $scope.clickSelectAll = function () {
        for (i in $scope.searchResults) {
            var uri_i = $scope.searchResults[i];
            var found_j = false;
            for (j in $scope.selected) {
                var uri_j = $scope.selected[j];
                if (uri_i == uri_j) {
                    found_j = true;
                    break;
                }
            }
            if (!found_j) {
                $scope.selected.push(uri_i);
                $scope.$broadcast('nsl-tree-editor.selection', uri_i, true);

            }
        }
    };

    $scope.clickDeselectAll = function () {
        var newselected = new Array;

        for (i in $scope.selected) {
            var uri_i = $scope.selected[i];
            var found_j = false;
            for (j in $scope.searchResults) {
                var uri_j = $scope.searchResults[j];
                if (uri_i == uri_j) {
                    found_j = true;
                    break;
                }
            }
            if (!found_j) {
                newselected.push(uri_i);
            }
        }

        $scope.selected = newselected;

        for (j in $scope.searchResults) {
            var uri_j = $scope.searchResults[j];
            $scope.$broadcast('nsl-tree-editor.selection', uri_j, false);
        }
    };


    $scope.clickAddNames = function() {
        console.log ({
            'root': $scope.rootUri,
            'focus': $scope.focusUri,
            'names': $scope.selected
        });


        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/addNamesToNode',
            headers: {
                'Access-Control-Request-Headers': 'nsl-jwt',
                'nsl-jwt': $rootScope.getJwt()
            },
            params: {
                'root': $scope.rootUri,
                'focus': $scope.focusUri,
                'names': $scope.selected
            }
        }).then(function successCallback(response) {
            window.location = $rootScope.pagesUrl + "/Editnode/addRemoveNames?root=" + $scope.rootUri + "&focus=" + $scope.focusUri;
        }, function errorCallback(response) {
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
    };
};

GetJsonController.$inject = ['$scope', '$rootScope', '$http', '$element'];

app.controller('Searchembedded', SearchembeddedController);

var searchembeddedDirective = function () {
    return {
        templateUrl: "/tree-editor/assets/ng/editnode/searchembedded.html",
        controller: SearchembeddedController,
        scope: {
            rootUri: "@root",
            focusUri: "@focus"
        },
        link: function(scope, element, attrs, controller, transcludeFn) {
            // put the services search fomr into #search-container
            $(element).find("#search-container").load("http://localhost:8080/services/search/form", null, function() {
                // once the search container has been loaded, hijack it by
                // catching the form submit event
                $("#search").submit(function(event) {
                    // on a submit, kill the default behavior, then re-enter angular and call a scope function
                    event.preventDefault();
                    scope.$apply(function() {
                        scope.formSubmitted();
                    });
                });
            });
        }
    };
};

app.directive('searchembedded', searchembeddedDirective);

var SearchresultrowController = function ($scope, $rootScope, $http) {
    GetJsonController($scope, $rootScope);

    $scope.selected = false;

    for (u in $scope.$parent.selected) {
        if ($scope.$parent.selected[u] == $scope.uri) {
            $scope.selected = true;
        }
    }

    $scope.$on('nsl-tree-editor.selection', function (event, uri, selected) {
        if (uri == $scope.uri) $scope.selected = selected;
    });

    $scope.clickSelection = function () {
        $scope.$parent.toggleSelection($scope.uri);
    }

    $scope.swipeSelection = function () {
        if($scope.$parent.swipeOn != $scope.selected) {
            $scope.$parent.toggleSelection($scope.uri);
        }
    }
};

SearchresultrowController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Searchresultrow', SearchresultrowController);

var searchresultrowDirective = function () {
    return {
        templateUrl: "/tree-editor/assets/ng/editnode/searchresultrow.html",
        controller: SearchresultrowController,
        scope: {
            uri: "@"
        },
    };
}

app.directive('searchresultrow', searchresultrowDirective);
