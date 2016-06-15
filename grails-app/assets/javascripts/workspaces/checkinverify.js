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

