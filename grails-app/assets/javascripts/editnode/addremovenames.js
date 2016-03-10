//= require get-preferred-link
//= require utility/get-json-controller

var AddremovenamesController = function ($scope, $rootScope, $http) {
    setupJsonCache($rootScope, $http);

    if (!$scope.focusUri && $scope.rootUri) {
        $scope.focusUri = $scope.rootUri;
    }

    $scope.root = $rootScope.needJson($scope.rootUri);
    $scope.focus = $rootScope.needJson($scope.focusUri);
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

