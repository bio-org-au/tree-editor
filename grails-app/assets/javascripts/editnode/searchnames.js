//= require get-preferred-link
//= require utility/get-json-controller

var SearchnamesController = function ($scope, $rootScope, $http) {
    setupJsonCache($rootScope, $http);

    $scope.form = {};

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

        if($scope.arrangement && $scope.arrangement.fetched) {
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

    $scope.changeReference = function() {
        dorefbuttons();
        console.log($scope.form.reference);
        if($scope.form.reference)
        console.log($scope.form.reference.length);
    };

    $scope.clickNamesOnly = function() {
        $scope.form.namesOnly = !$scope.form.namesOnly;
        dorefbuttons();
    };

    $scope.clickAllReferences = function() {
        $scope.form.allReferences = !$scope.form.allReferences;
        dorefbuttons();
    };

    $scope.clickSearch = function() {
        $scope.searchError = null;
        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/TreeJsonView/searchNamesRefs',
            params: {
                namespace: $rootScope.namespace,
                name: $scope.form.name,
                reference: $scope.form.reference,
                namesOnly: $scope.form.namesOnly,
                allReferences: $scope.form.allReferences,
                includeSubreferences: $scope.form.includeSubreferences,
                primaryInstancesOnly: $scope.form.primaryInstancesOnly
            }
        }).then(function successCallback(response) {
            $scope.searchResults = response.data;
        }, function errorCallback(response) {
            console.log(response);
            console.log(response.data);
            $scope.searchError = response;
        });
    }

}

SearchnamesController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Searchnames', SearchnamesController);

var searchnamesDirective = function() {
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
