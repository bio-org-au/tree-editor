/***********************************
 * checkinverify.js
 */

console.log("loading checkinverify.js")

var CheckinverifyController = ['$scope', '$rootScope', '$http', '$element', function ($scope, $rootScope, $http, $element) {

    $scope.verifying = false;
    $scope.checkingIn = false;
    $scope.verificationResults = null;
    $scope.checkinResults = null;
    
    $scope.performVerification = function() {
        $scope.verifying = true;
        $scope.checkingIn = false;
        $scope.verificationResults = null;
        $scope.checkinResults = null;
        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/verifyCheckin',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            params: {
                'uri': $scope.checkinUri,
            }
        }).then(function successCallback(response) {
            $rootScope.msg = response.data.msg;
            $scope.verifying = false;
            $scope.verificationResults = response.data.verificationResults;
        }, function errorCallback(response) {
            $scope.verifying = false;
            if(response.data && response.data.msg) {
                $rootScope.msg = response.data.msg;
            }
            else {
                $rootScope.msg = [
                    {
                        msg: response.data.status,
                        body: response.data.reason,
                        status: 'danger',  // we use danger because we got no JSON back at all
                    }
                ];
            }
        });
    };

    $scope.performCheckin = function() {
        $scope.verifying = false;
        $scope.checkingIn = true;
        $scope.checkinResults = null;
        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/performCheckin',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            params: {
                'uri': $scope.checkinUri,
            }
        }).then(function successCallback(response) {
            $rootScope.msg = response.data.msg;
            $scope.checkingIn = false;
            $scope.verificationResults = null;
            $scope.checkinResults = response.data.checkinResults;
        }, function errorCallback(response) {
            $scope.verifying = false;
            if(response.data && response.data.msg) {
                $rootScope.msg = response.data.msg;
            }
            else {
                $rootScope.msg = [
                    {
                        msg: response.data.status,
                        body: response.data.reason,
                        status: 'danger',  // we use danger because we got no JSON back at all
                    }
                ];
            }
        });
    };

    var deregisterInitializationListener = [];
    
    var initializationListener = function(oldvalue, newvalue) {
        if($scope.checkinJson && $scope.checkinJson.fetched && $scope.checkinJson.arrangement._uri && !$scope.checkinTreeUri) {
            $scope.checkinTreeUri = $scope.checkinJson.arrangement._uri;
            $scope.checkinTreeJson = $rootScope.needJson($scope.checkinTreeUri);
        }

        if($scope.checkinJson && $scope.checkinJson.fetched && $scope.checkinJson.prev._uri && !$scope.targetUri) {
            $scope.targetUri = $scope.checkinJson.prev._uri;
            $scope.targetJson = $rootScope.needJson($scope.targetUri);
        }

        if($scope.targetJson && $scope.targetJson.fetched && $scope.targetJson.arrangement._uri && !$scope.targetTreeUri) {
            $scope.targetTreeUri = $scope.targetJson.arrangement._uri;
            $scope.targetTreeJson = $rootScope.needJson($scope.targetTreeUri);
        }

        if($scope.checkinJson.fetched && (!$scope.checkinJson.prev._uri || $scope.targetJson.fetched)) {
            for (var i in deregisterInitializationListener) {
                deregisterInitializationListener[i]();
            }
        }

    }

    deregisterInitializationListener.push($scope.$watch("checkinJson", initializationListener));
    deregisterInitializationListener.push($scope.$watch("checkinJson.fetched", initializationListener));
    deregisterInitializationListener.push($scope.$watch("targetJson", initializationListener));
    deregisterInitializationListener.push($scope.$watch("targetJson.fetched", initializationListener));

    $scope.checkinJson = $rootScope.needJson($scope.checkinUri);
    initializationListener();

    $scope.performVerification();
}];


app.controller('Checkinverify', CheckinverifyController);

var checkinverifyDirective = [function() {
    return {
        templateUrl: pagesUrl + "/assets/ng/workspaces/checkinverify.html",
        controller: CheckinverifyController,
        scope: {
            checkinUri: '@'
        },
    };
}];

app.directive('checkinverify', checkinverifyDirective);

