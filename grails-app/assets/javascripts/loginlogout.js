//= require angular
//= require app

var LoginlogoutController = function ($scope, $http) {
    $scope.login = function() {
        localStorage.setItem('nsl-tree-editor.loginlogout.loggedIn', 'N');
        localStorage.setItem('nsl-tree-editor.loginlogout.principal', '');
        localStorage.setItem('nsl-tree-editor.loginlogout.jwt', '');
        $http({
            method: 'GET',
            url: $scope.servicesUrl + '/auth/signInJson',
            params: { username: $scope.form.name, password: $scope.form.password}
        }).then(function successCallback(response) {
            localStorage.setItem('nsl-tree-editor.loginlogout.loggedIn', 'Y');
            localStorage.setItem('nsl-tree-editor.loginlogout.principal', response.data.principal);
            localStorage.setItem('nsl-tree-editor.loginlogout.jwt', response.data.jwt);
        }, function errorCallback(response) {
        });
    };

    $scope.logout = function() {
        localStorage.setItem('nsl-tree-editor.loginlogout.loggedIn', 'N');
        localStorage.setItem('nsl-tree-editor.loginlogout.principal', '');
        localStorage.setItem('nsl-tree-editor.loginlogout.jwt', '');
        $http({
            method: 'GET',
            url: $scope.servicesUrl + '/auth/signOutJson',
        }).then(function successCallback(response) {
        }, function errorCallback(response) {
        });
    };

    $scope.isLoggedIn = function() {
        return localStorage.getItem('nsl-tree-editor.loginlogout.loggedIn')=='Y';
    };

    $scope.getUser = function() {
        return localStorage.getItem('nsl-tree-editor.loginlogout.principal');
    };

    $scope.getJwt = function() {
        return localStorage.getItem('nsl-tree-editor.loginlogout.jwt');
    };

    $scope.form = {name: $scope.isLoggedIn() ? $scope.getUser() : '', password: ''};
};

LoginlogoutController.$inject = ['$scope', '$http'];

app.controller('Loginlogout', LoginlogoutController);


function loginlogoutDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/loginlogout/loginlogout.html",
        controller: LoginlogoutController,
        scope: {
            servicesUrl: '@servicesUrl'
        },
    };
}

app.directive('loginlogout', loginlogoutDirective);
