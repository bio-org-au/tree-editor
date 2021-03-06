/***********************************
 * checkinverify.js
 */

console.log("loading verify.js");

var ChangesController = ['$scope', '$rootScope', 'jsonCache', '$routeParams', 'auth', function ($scope, $rootScope, jsonCache, $routeParams, auth) {

    $scope.uri = $routeParams.focus;
    $scope.tree = $routeParams.tree;
    $scope.findingChanges = false;
    $scope.changes = null;

    $scope.findChanges = function () {
        $scope.findingChanges = true;
        $scope.changes = null;
        auth.http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonView/listChanges',
            params: {
                'uri': $scope.uri
            },
            success: function successCallback(response) {
                $rootScope.msg = response.data.msg;
                $scope.findingChanges = false;
                $scope.changes = response.data.changes;
            },
            fail: function errorCallback(response) {
                console.log(response);
                $scope.findingChanges = false;
                if (response.data && response.data.msg) {
                    $rootScope.msg = response.data.msg;
                }
                else {
                    $rootScope.msg = [
                        {
                            msg: response.status,
                            body: response.statusText,
                            html: response.data,
                            status: 'danger'  // we use danger because we got no JSON back at all
                        }
                    ];
                }
            }
        });
    };

    var deregisterInitializationListener = [];

    var initializationListener = function (oldvalue, newvalue) {
        if ($scope.json && $scope.json.fetched && $scope.json.arrangement._uri && !$scope.treeUri) {
            $scope.treeUri = $scope.json.arrangement._uri;
            $scope.treeJson = jsonCache.needJson($scope.treeUri);
        }

        if ($scope.json && $scope.json.fetched && $scope.json.prev._uri && !$scope.prevUri) {
            $scope.prevUri = $scope.json.prev._uri;
            $scope.prevJson = jsonCache.needJson($scope.prevUri);
        }

        if ($scope.prevJson && $scope.prevJson.fetched && $scope.prevJson.arrangement._uri && !$scope.prevTreeUri) {
            $scope.prevTreeUri = $scope.prevJson.arrangement._uri;
            $scope.prevTreeJson = jsonCache.needJson($scope.prevTreeUri);
        }

        if ($scope.json && $scope.json.fetched && (!$scope.json.prev._uri || $scope.prevJson.fetched)) {
            for (var i in deregisterInitializationListener) {
                deregisterInitializationListener[i]();
            }
        }

    };

    deregisterInitializationListener.push($scope.$watch("json", initializationListener));
    deregisterInitializationListener.push($scope.$watch("json.fetched", initializationListener));
    deregisterInitializationListener.push($scope.$watch("prevJson", initializationListener));
    deregisterInitializationListener.push($scope.$watch("prevJson.fetched", initializationListener));

    $scope.json = null;
    $scope.treeJson = null;
    $scope.prevJson = null;
    $scope.prevTreeJson = null;
    $scope.treeJsonUri = null;
    $scope.prevJsonUri = null;
    $scope.prevTreeJsonUri = null;


    initializationListener();
    $scope.json = jsonCache.needJson($scope.uri);
    $scope.findChanges();
}];


app.controller('Changes', ChangesController);

// var changesDirective = [function() {
//     return {
//         templateUrl: pagesUrl + "/ng/verification/changes.html",
//         controller: ChangesController,
//         scope: {
//             uri: '@'
//         }
//     };
// }];
//
// app.directive('changes', changesDirective);

