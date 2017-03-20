/***********************************
 * loginlogout.js
 */


console.log("loading loginlogout.js");

var AuthenticationController = ['$scope', '$rootScope', '$http', '$location', 'auth', function ($scope, $rootScope, $http, $location, auth) {
    $scope.login = function () {
        localStorage.setItem('nsl-tree-editor.loginlogout.loggedIn', 'N');
        localStorage.setItem('nsl-tree-editor.loginlogout.principal', '');
        localStorage.setItem('nsl-tree-editor.loginlogout.jwt', '');
        $rootScope.$emit('nsl-tree-editor.loginlogout');

        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/auth/signInJson',
            params: {username: $scope.form.name, password: $scope.form.password}
        }).then(function successCallback(response) {
            $scope.form.name = '';
            $scope.form.password = '';
            localStorage.setItem('nsl-tree-editor.loginlogout.loggedIn', 'Y');
            localStorage.setItem('nsl-tree-editor.loginlogout.principal', response.data.principal);
            localStorage.setItem('nsl-tree-editor.loginlogout.jwt', response.data.jwt);
            $rootScope.$emit('nsl-tree-editor.loginlogout');
            $location.path('/classification/');
            $rootScope.msg = undefined;
        }, function errorCallback(response) {
            $rootScope.msg = [
                {
                    msg: "Nope.",
                    body: "Sorry that didn't work. Try again?",
                    status: 'warning'
                }
            ];
        });
    };

    $scope.logout = function () {
        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/auth/signOutJson',
            headers: {
                'Authorization': 'JWT ' + $rootScope.getJwt()
            }
        }).then(function successCallback(response) {
            localStorage.setItem('nsl-tree-editor.loginlogout.loggedIn', 'N');
            localStorage.setItem('nsl-tree-editor.loginlogout.principal', '');
            localStorage.setItem('nsl-tree-editor.loginlogout.jwt', '');
            $rootScope.$emit('nsl-tree-editor.loginlogout');
            $location.path('/login/');
            $rootScope.msg = undefined;
        }, function errorCallback(response) {
            if (response.status == 401) {
                $rootScope.msg = [
                    {
                        msg: "Unauthorized:",
                        body: "You need to log in to do this, or you don't have permission.",
                        status: 'danger'
                    }
                ];
            } else {
                $rootScope.msg = [
                    {
                        msg: response.data.status,
                        body: response.data.reason,
                        status: 'danger'
                    }
                ];
            }
        });
    };

    $scope.isLoggedIn = $rootScope.isLoggedIn;
    $scope.getUser = $rootScope.getUser;
    $scope.getJwt = $rootScope.getJwt;

    $scope.form = {name: $scope.isLoggedIn() ? $scope.getUser() : '', password: ''};
}];

app.controller('Authentication', AuthenticationController);

var AuthenticateDirective = [function () {
    return {
        restrict: 'E',
        templateUrl: pagesUrl + "/ng/auth/logout.html",
        controller: AuthenticationController,
        scope: {
            servicesUrl: '@servicesUrl'
        }
    };
}];

app.directive('authenticate', AuthenticateDirective);

app.factory('auth', ['$interval', '$http', '$log', '$rootScope', function ($interval, $http, $log, $rootScope) {

    var STORE_LOGGEDIN = 'nsl-tree-editor.loginlogout.loggedIn';
    var STORE_PRINCIPAL = 'nsl-tree-editor.loginlogout.principal';
    var STORE_JWT = 'nsl-tree-editor.loginlogout.jwt';

    function clear() {
        localStorage.setItem(STORE_LOGGEDIN, 'N');
        localStorage.setItem(STORE_PRINCIPAL.principal, '');
        localStorage.setItem(STORE_JWT.jwt, '');
    }

    function checkLoggedIn() {
        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/auth/check',
            headers: {
                'Authorization': 'JWT ' + localStorage.getItem(STORE_JWT)
            }
        }).then(function successCallback(response) {
            clear();
            $location.path('/login/');
        }, function errorCallback(response) {
            $log.log(response.data);
            $rootScope.msg = [
                {
                    msg: "Sorry you're logged out.",
                    body: "You need to log in again.",
                    status: 'warning'
                }
            ];
        });
    }

    $interval(checkLoggedIn(), 10000);

    return {
        login: function () {
            clear();
            $http({
                method: 'GET',
                url: $rootScope.servicesUrl + '/auth/signInJson',
                params: {username: $scope.form.name, password: $scope.form.password}
            }).then(function successCallback(response) {
                $scope.form.name = '';
                $scope.form.password = '';
                localStorage.setItem(STORE_LOGGEDIN, 'Y');
                localStorage.setItem(STORE_PRINCIPAL, response.data.principal);
                localStorage.setItem(STORE_JWT, response.data.jwt);
                $location.path('/classification/');
                $rootScope.msg = undefined;
            }, function errorCallback(response) {
                $rootScope.msg = [
                    {
                        msg: "Nope.",
                        body: "Sorry that didn't work. Try again?",
                        status: 'warning'
                    }
                ];
            });
        },
        logout: function () {
            $http({
                method: 'GET',
                url: $rootScope.servicesUrl + '/auth/signOutJson',
                headers: {
                    'Authorization': 'JWT ' + $rootScope.getJwt()
                }
            }).then(function successCallback(response) {
                clear();
                $location.path('/login/');
                $rootScope.msg = undefined;
            }, function errorCallback(response) {
                if (response.status == 401) {
                    $rootScope.msg = [
                        {
                            msg: "Unauthorized:",
                            body: "You need to log in to do this, or you don't have permission.",
                            status: 'danger'
                        }
                    ];
                } else {
                    $rootScope.msg = [
                        {
                            msg: response.data.status,
                            body: response.data.reason,
                            status: 'danger'
                        }
                    ];
                }
            });
        },
        isLoggedIn: function () {
            return localStorage.getItem(STORE_LOGGEDIN) == 'Y';
        },
        getUser: function () {
            return localStorage.getItem(STORE_PRINCIPAL);
        },
        getJwt: function () {
            return localStorage.getItem(STORE_JWT);
        }
    };
}]);