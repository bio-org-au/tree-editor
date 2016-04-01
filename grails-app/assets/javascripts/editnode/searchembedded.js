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

    $scope.selected = {};

    $scope.hasResults = false;
    $scope.hasSelectedNames = false;
    $scope.tab = 'searchTab';

    $scope.swipeOn = true;

    $scope.amAddingNames = false;

    $scope.formSubmitted = function() {
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

    $scope.getUriInSelected = function(uri) {
        return $scope.selected[uri];
    };

    $scope.isSelected = function(uri) {
        var nugget = $scope.getUriInSelected(uri);
        return nugget ? nugget.selected : false;
    };

    $scope.isAnySelected = function() {
        for(i in $scope.selected) {
            return true;
        }
        return false;
    }

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

    $scope.select = function (uri) {
        var nugget = $scope.getUriInSelected(uri);

        if(!nugget) {
            nugget = { uri: uri, selected: true};
            $scope.selected[uri] = nugget;
        }
        else {
            nugget.selected = true;
        }

        $scope.swipeOn = nugget.selected;
        $scope.$broadcast('nsl-tree-editor.selection', uri, nugget.selected);
        $scope.hasSelectedNames = $scope.isAnySelected();
    };

    $scope.deselect = function (uri) {
        var nugget = $scope.getUriInSelected(uri);

        if(!nugget) {
            return;
        }
        else {
            nugget.selected = false;
        }

        $scope.swipeOn = nugget.selected;
        $scope.$broadcast('nsl-tree-editor.selection', uri, nugget.selected);
        $scope.hasSelectedNames = $scope.isAnySelected();
    };

    $scope.clickSelectAll = function () {
        for (i in $scope.searchResults) {
            $scope.select($scope.searchResults[i]);
        }
    };

    $scope.clickDeselectAll = function () {
        for (i in $scope.searchResults) {
            $scope.deselect($scope.searchResults[i]);
        }
    };

    $scope.clickClearResults = function() {
        $scope.searchResults.lenght = 0;
        $scope.hasResults = false;
        $scope.tab = 'searchTab';
    }

    $scope.clickSelectAllSelected = function() {
        for (i in $scope.selected) {
            $scope.select($scope.selected[i].uri);
        }
    };

    $scope.clickDeselectAllSelected = function() {
        for (i in $scope.selected) {
            $scope.deselect($scope.selected[i].uri);
        }
    };

    $scope.clickClearUnselected = function() {
        var nuggets = [];
        for(i in $scope.selected) {
            if($scope.selected[i].selected) {
                nuggets.push($scope.selected[i]);
            }
        }

        $scope.selected = {};
        for(i in nuggets) {
            $scope.selected[nuggets[i].uri] = nuggets[i];
        }

        $scope.hasSelectedNames = $scope.isAnySelected();

        if(!$scope.hasSelectedNames) {
            if($scope.hasResults) {
                $scope.tab = 'resultsTab';
            }
            else {
                $scope.tab = 'searchTab';
            }

        }
    };

    $scope.clickAddNames = function() {

        var names = [];
        for(i in $scope.selected) {
            if($scope.selected[i].selected)
                names.push(i);
        }


        console.log ({
            'root': $scope.rootUri,
            'focus': $scope.focusUri,
            'names': names
        });


        $scope.amAddingNames = true;

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
                'names': names
            }
        }).then(function successCallback(response) {
            $scope.amAddingNames = false;
            window.location = $rootScope.pagesUrl + "/Editnode/checklist?root=" + $scope.rootUri + "&focus=" + $scope.focusUri;
        }, function errorCallback(response) {
            $scope.amAddingNames = false;
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
            rootUri: "@",
            focusUri: "@"
        },
        link: function(scope, element, attrs, controller, transcludeFn) {
            // put the services search fomr into #search-container

            console.log("LOADING THE SEARCH FORM");

            $(element).find("#search-container").load("http://localhost:8080/services/search/form", null, function() {
                console.log("SEARCH FORM IS LOADED");

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

    $scope.selected = $scope.$parent.isSelected($scope.uri);

    $scope.$on('nsl-tree-editor.selection', function (event, uri, selected) {
        if (uri == $scope.uri) $scope.selected = selected;
    });

    $scope.clickSelection = function () {
        if($scope.selected) {
            $scope.$parent.deselect($scope.uri);
        }
        else {
            $scope.$parent.select($scope.uri);
        }
    }

    $scope.swipeSelection = function () {
        if($scope.$parent.swipeOn) {
            $scope.$parent.select($scope.uri);
        }
        else {
            $scope.$parent.deselect($scope.uri);
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
