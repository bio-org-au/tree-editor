//= require get-preferred-link
//= require utility/get-json-controller

var AddremovenamesController = function ($scope, $rootScope, $http) {
    setupJsonCache($rootScope, $http);

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
};

AddremovenamesController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Addremovenames', AddremovenamesController);

var addremovenamesDirective = function() {
    return {
        templateUrl: "/tree-editor/assets/ng/editnode/addremovenames.html",
        controller: AddremovenamesController,
        scope: {
            rootUri: "@",
            focusUri: "@"
        },
    };
}

app.directive('addremovenames', addremovenamesDirective);

