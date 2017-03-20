/***********************************
 * loginlogout.js
 */


console.log("loading loginlogout.js");

var AuthenticationController = ['$scope', '$rootScope', '$http', '$location', 'auth', function ($scope, $rootScope, $http, $location, auth) {
    $scope.login = function () {
        auth.login($scope.form.name, $scope.form.password);
        $scope.form.name = '';
        $scope.form.password = '';
    };

    $scope.logout = function () {
        auth.logout();
    };

    $scope.isLoggedIn = auth.isLoggedIn;
    $scope.principal = auth.principal;
    $scope.getJwt = auth.getJwt;

    $scope.form = {name: ($scope.isLoggedIn() ? $scope.principal() : ''), password: ''};
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

app.factory('auth', ['$interval', '$http', '$log', '$rootScope', '$location', function ($interval, $http, $log, $rootScope, $location) {

    var STORE_LOGGEDIN = 'nsl-tree-editor.loginlogout.loggedIn';
    var STORE_PRINCIPAL = 'nsl-tree-editor.loginlogout.principal';
    var STORE_JWT = 'nsl-tree-editor.loginlogout.jwt';
    var get_uri_permissions_cache = {};

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

    // $interval(checkLoggedIn(), 10000);

    return {
        login: function (userName, password) {
            clear();
            $http({
                method: 'GET',
                url: $rootScope.servicesUrl + '/auth/signInJson',
                params: {username: userName, password: password}
            }).then(function successCallback(response) {
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
                    'Authorization': 'JWT ' + this.getJwt()
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
        principal: function () {
            return localStorage.getItem(STORE_PRINCIPAL);
        },
        getJwt: function () {
            return localStorage.getItem(STORE_JWT);
        },
        get_uri_permissions: function (uri, callback) {
            if (get_uri_permissions_cache[uri]) {
                var p = get_uri_permissions_cache[uri];
                callback(p.data, p.success);
            }
            else {
                console.log("fetch permission for " + uri);

                $http({
                    method: 'POST',
                    url: $rootScope.servicesUrl + '/TreeJsonView/permissions',
                    headers: {
                        // 'Access-Control-Request-Headers': 'Authorization',
                        'Authorization': 'JWT ' + this.getJwt()
                    },
                    params: {
                        'uri': uri
                    }
                }).then(function successCallback(response) {
                    $log.log("fetch permission for " + uri + " SUCCESS");
                    $log.log(response);
                    get_uri_permissions_cache[uri] = {data: response.data, success: true};
                    callback(response.data, true);
                }, function errorCallback(response) {
                    $log.log("fetch permission for " + uri + " FAIL");
                    $log.log(response);
                    get_uri_permissions_cache[uri] = {data: response.data, success: false};
                    callback(response.data, false);
                });
            }
        }
    };
}]);