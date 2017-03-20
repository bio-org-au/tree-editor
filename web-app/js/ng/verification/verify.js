/***********************************
 * checkinverify.js
 */

console.log("loading verify.js");

var VerifyController = ['$scope', '$rootScope', 'jsonCache', '$routeParams', 'auth', function ($scope, $rootScope, jsonCache, $routeParams, auth) {

    if ($routeParams) {
        if ($routeParams.focus) {
            $scope.uri = $routeParams.focus;
        }
        if ($routeParams.tree) {
            $scope.tree = $routeParams.tree;
        }
    }

    $scope.verifying = false;
    $scope.verificationResults = null;

    $scope.permissions = {};
    $scope.prevTreePermissions = {};

    auth.get_uri_permissions($scope.uri, function (data, success) {
        if (success)
            $scope.permissions = data;
    });

    $scope.hasCheckinPermission = function () {
        return $scope.permissions
            && $scope.permissions.uriPermissions.isWorkspace
            && $scope.permissions.uriPermissions.canEdit
            && $scope.prevTreePermissions
            && $scope.prevTreePermissions.uriPermissions.isClassification
            && $scope.prevTreePermissions.uriPermissions.canEdit
            ;
    };

    $scope.performVerification = function () {
        $scope.verifying = true;
        $scope.verificationResults = null;
        auth.http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/verifyCheckin',
            params: {
                'uri': $scope.uri
            },
            success: function successCallback(response) {
                $rootScope.msg = response.data.msg;
                $scope.verifying = false;
                $scope.verificationResults = response.data.verificationResults;
            },
            fail: function errorCallback(response) {
                $scope.verifying = false;
                if (response.data && response.data.msg) {
                    $rootScope.msg = response.data.msg;
                }
                else {
                    $rootScope.msg = [
                        {
                            msg: response.data.status,
                            body: response.data.reason,
                            status: 'danger'  // we use danger because we got no JSON back at all
                        }
                    ];
                }
            }
        });
    };

    $scope.checkinInitial = function () {
        $scope.showAreYouSure = true;
    };

    $scope.checkinCancel = function () {
        $scope.showAreYouSure = false;
    };

    $scope.checkinConfirm = function () {
        $scope.showAreYouSure = false;
        $scope.checkingIn = true;
        auth.http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/performCheckin',
            params: {
                'uri': $scope.uri
            },
            success: function successCallback(response) {
                $rootScope.msg = response.data.msg;
                $scope.checkingIn = false;

                // the node will still be in the tree, but it will now be in the tree because
                // its from the base classification
                window.location.href = $rootScope.pagesUrl + "/checklist/checklist?tree=" + $scope.treeUri + "&focus=" + $scope.uri;

            },
            fail: function errorCallback(response) {
                $scope.checkingIn = true;
                if (response.data && response.data.msg) {
                    $rootScope.msg = response.data.msg;
                }
                else {
                    $rootScope.msg = [
                        {
                            msg: response.data.status,
                            body: response.data.reason,
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

            auth.get_uri_permissions($scope.prevTreeUri, function (data, success) {
                if (success)
                    $scope.prevTreePermissions = data;
            });

        }

        if ($scope.json.fetched && (!$scope.json.prev._uri || $scope.prevJson.fetched)) {
            for (var i in deregisterInitializationListener) {
                deregisterInitializationListener[i]();
            }
        }

    };

    deregisterInitializationListener.push($scope.$watch("json", initializationListener));
    deregisterInitializationListener.push($scope.$watch("json.fetched", initializationListener));
    deregisterInitializationListener.push($scope.$watch("prevJson", initializationListener));
    deregisterInitializationListener.push($scope.$watch("prevJson.fetched", initializationListener));

    $scope.json = jsonCache.needJson($scope.uri);
    initializationListener();

    $scope.performVerification();
}];


app.controller('Verify', VerifyController);

// var verifyDirective = [function () {
//     return {
//         templateUrl: pagesUrl + "/ng/verification/verify.html",
//         controller: VerifyController,
//         scope: {
//             uri: '@'
//         }
//     };
// }];
//
// app.directive('verify', verifyDirective);

