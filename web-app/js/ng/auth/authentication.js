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
    var STORE_REFRESH_JWT = 'nsl-tree-editor.loginlogout.refreshJwt';

    var get_uri_permissions_cache = {};

    function clear() {
        localStorage.setItem(STORE_LOGGEDIN, 'N');
        localStorage.setItem(STORE_PRINCIPAL, '');
        localStorage.setItem(STORE_JWT, '');
        localStorage.setItem(STORE_REFRESH_JWT, '');
    }

    function isLoggedIn() {
        return localStorage.getItem(STORE_LOGGEDIN) == 'Y';
    }

    function principal() {
        return localStorage.getItem(STORE_PRINCIPAL);
    }

    function getJwt() {
        return localStorage.getItem(STORE_JWT);
    }

    function getRefreshToken() {
        return localStorage.getItem(STORE_REFRESH_JWT);
    }

    function http(params) {
        if (isLoggedIn()) {
            $http({
                method: params.method,
                url: params.url,
                params: params.params,
                data: params.data,
                headers: {
                    'Authorization': 'JWT ' + getJwt()
                }
            }).then(function successCallback(response) {
                params.success(response);
            }, function errorCallback(response) {
                if (response.status == 401) {
                    // re-authenticate if we can?
                    $log.info("authentication error, trying re auth:" + response);
                    reAuthenticate(function (){
                        http(params);
                    });
                } else {
                    params.fail(response);
                }
            });
        } else {
            $location.path('/login/');
        }
    }

    function reAuthenticate(success) {
        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/auth/reauth',
            headers: {
                'Authorization': 'JWT ' + getRefreshToken()
            }
        }).then(function successCallback(response) {
            localStorage.setItem(STORE_LOGGEDIN, 'Y');
            localStorage.setItem(STORE_PRINCIPAL, response.data.principal);
            localStorage.setItem(STORE_JWT, response.data.jwt);
            localStorage.setItem(STORE_REFRESH_JWT, response.data.refreshToken);
            success();
        }, function errorCallback(response) {
            clear();
            $rootScope.msg = [
                {
                    msg: "Sorry, your session timed out.",
                    status: 'warning'
                }
            ];
            $log.error("authentication error" + response);
            $location.path('/login/');
        });
    }

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
                localStorage.setItem(STORE_REFRESH_JWT, response.data.refreshToken);
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
                clear();
                if (response.status == 401) {
                    $location.path('/login/');
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
        http: http,
        isLoggedIn: isLoggedIn,
        principal: principal,
        getJwt: getJwt,
        get_uri_permissions: function (uri, callback) {
            if (get_uri_permissions_cache[uri]) {
                var p = get_uri_permissions_cache[uri];
                callback(p.data, p.success);
            }
            else {
                console.log("fetch permission for " + uri);

                http({
                    method: 'POST',
                    url: $rootScope.servicesUrl + '/TreeJsonView/permissions',
                    params: {
                        'uri': uri
                    },
                    success: function successCallback(response) {
                        $log.log("fetch permission for " + uri + " SUCCESS");
                        $log.log(response);
                        get_uri_permissions_cache[uri] = {data: response.data, success: true};
                        callback(response.data, true);
                    },
                    fail: function errorCallback(response) {
                        $log.log("fetch permission for " + uri + " FAIL");
                        $log.log(response);
                        get_uri_permissions_cache[uri] = {data: response.data, success: false};
                        callback(response.data, false);
                    }
                });
            }
        }
    };
}]);