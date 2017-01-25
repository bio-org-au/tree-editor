/***********************************
 * loginlogout.js
 */


console.log("loading loginlogout.js")

var LoginlogoutController = ['$scope', '$rootScope', '$http', function ($scope, $rootScope, $http) {
    $scope.login = function() {
        localStorage.setItem('nsl-tree-editor.loginlogout.loggedIn', 'N');
        localStorage.setItem('nsl-tree-editor.loginlogout.principal', '');
        localStorage.setItem('nsl-tree-editor.loginlogout.jwt', '');
        $rootScope.$emit('nsl-tree-editor.loginlogout');

        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/auth/signInJson',
            params: { username: $scope.form.name, password: $scope.form.password}
        }).then(function successCallback(response) {
            localStorage.setItem('nsl-tree-editor.loginlogout.loggedIn', 'Y');
            localStorage.setItem('nsl-tree-editor.loginlogout.principal', response.data.principal);
            localStorage.setItem('nsl-tree-editor.loginlogout.jwt', response.data.jwt);
            $rootScope.$emit('nsl-tree-editor.loginlogout');
        }, function errorCallback(response) {
        });
    };

    $scope.logout = function() {
        localStorage.setItem('nsl-tree-editor.loginlogout.loggedIn', 'N');
        localStorage.setItem('nsl-tree-editor.loginlogout.principal', '');
        localStorage.setItem('nsl-tree-editor.loginlogout.jwt', '');
        $rootScope.$emit('nsl-tree-editor.loginlogout');

        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/auth/signOutJson',
        }).then(function successCallback(response) {
        }, function errorCallback(response) {
        });
    };

    $scope.isLoggedIn = $rootScope.isLoggedIn;
    $scope.getUser = $rootScope.getUser;
    $scope.getJwt = $rootScope.getJwt;

    $scope.form = {name: $scope.isLoggedIn() ? $scope.getUser() : '', password: ''};
}];

app.controller('Loginlogout', LoginlogoutController);

var loginlogoutDirective = [function () {
    return {
        templateUrl: pagesUrl + "/ng/loginlogout/loginlogout.html",
        controller: LoginlogoutController,
        scope: {
            servicesUrl: '@servicesUrl'
        },
    };
}];

app.directive('loginlogout', loginlogoutDirective);
