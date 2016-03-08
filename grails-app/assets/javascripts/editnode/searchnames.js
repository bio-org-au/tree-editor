//= require get-preferred-link
//= require utility/get-json-controller

var SearchnamesController = function ($scope, $rootScope, $http) {
    setupJsonCache($rootScope, $http);

    $scope.form = {
        name: '',
        includeSubnames: false,
        reference: '',
        namesOnly: false,
        allReferences: false,
        includeSubreferences: false,
        primaryInstancesOnly: true
    };
    $scope.selected = [];

    $rootScope.needJson($scope.rootUri);
    $rootScope.needJson($scope.focusUri);

    if (!$scope.focusUri && $scope.rootUri) {
        $scope.focusUri = $scope.rootUri;
    }

    var deregisterInitializationListener;

    function initializationListener(event, uri, json) {
        var root = $rootScope.needJson($scope.rootUri);

        // set the arrangement to the root arrangement if we can and need to
        if (!$scope.arrangementUri && root && root.fetched) {
            $scope.arrangementUri = getPreferredLink(root.arrangement);
            $rootScope.needJson($scope.arrangementUri);
        }

        $scope.arrangement = $rootScope.currentJson($scope.arrangementUri);

        if ($scope.arrangement && $scope.arrangement.fetched) {
            deregisterInitializationListener();
        }
    }

    deregisterInitializationListener = $scope.$on('nsl-json-fetched', initializationListener);
    initializationListener();

    function dorefbuttons() {
        var rr = !!$scope.form.reference;

        $("#inputReference").prop('disabled', $scope.form.namesOnly || $scope.form.allReferences);
        $("#inputNamesOnly").prop('disabled', rr || $scope.form.allReferences);
        $("#inputAllReferences").prop('disabled', rr || $scope.form.namesOnly);
    }

    $scope.changeReference = function () {
        dorefbuttons();
        console.log($scope.form.reference);
        if ($scope.form.reference)
            console.log($scope.form.reference.length);
    };

    $scope.clickNamesOnly = function () {
        $scope.form.namesOnly = !$scope.form.namesOnly;
        dorefbuttons();
    };

    $scope.clickAllReferences = function () {
        $scope.form.allReferences = !$scope.form.allReferences;
        dorefbuttons();
    };

    $scope.clickSearch = function () {
        $scope.searchError = null;
        $scope.searchResults = null;
        $scope.searching = true;
        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/TreeJsonView/searchNamesRefs',
            params: {
                namespace: $rootScope.namespace,
                name: $scope.form.name,
                includeSubnames: $scope.form.includeSubnames,
                reference: $scope.form.reference,
                namesOnly: $scope.form.namesOnly,
                allReferences: $scope.form.allReferences,
                includeSubreferences: $scope.form.includeSubreferences,
                primaryInstancesOnly: $scope.form.primaryInstancesOnly
            }
        }).then(function successCallback(response) {
            $scope.searching = false;
            $scope.searchResults = response.data;
        }, function errorCallback(response) {
            $scope.searching = false;
            console.log(response);
            console.log(response.data);
            $scope.searchError = response;
        });
    }

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
        $scope.$broadcast('nsl-tree-editor.selection', uri, !found);
    }

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
        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/addNamesToNode',
            headers: {
                'Access-Control-Request-Headers': 'nsl-jwt',
                'nsl-jwt': $rootScope.getJwt()
            },
            params: {
                'root': $scope.rootUrl,
                'focus': $scope.focusUrl,
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
}

SearchnamesController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Searchnames', SearchnamesController);

var searchnamesDirective = function () {
    return {
        templateUrl: "/tree-editor/assets/ng/editnode/searchnames.html",
        controller: SearchnamesController,
        scope: {
            rootUri: "@",
            focusUri: "@"
        },
    };
}

app.directive('searchnames', searchnamesDirective);

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