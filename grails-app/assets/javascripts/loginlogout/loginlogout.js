var LoginlogoutController = function ($scope, $rootScope, $http) {
    $scope.login = function() {
        localStorage.setItem('nsl-tree-editor.loginlogout.loggedIn', 'N');
        localStorage.setItem('nsl-tree-editor.loginlogout.principal', '');
        localStorage.setItem('nsl-tree-editor.loginlogout.jwt', '');
        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/auth/signInJson',
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
            url: $rootScope.servicesUrl + '/auth/signOutJson',
        }).then(function successCallback(response) {
        }, function errorCallback(response) {
        });
    };

    $scope.isLoggedIn = $rootScope.isLoggedIn;
    $scope.getUser = $rootScope.getUser;
    $scope.getJwt = $rootScope.getJwt;

    $scope.form = {name: $scope.isLoggedIn() ? $scope.getUser() : '', password: ''};
};

LoginlogoutController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Loginlogout', LoginlogoutController);

function loginlogoutDirective() {
    console.log("we have a loginlogout directive");
    return {
        templateUrl: "/tree-editor/assets/ng/loginlogout/loginlogout.html",
        controller: LoginlogoutController,
        scope: {
            servicesUrl: '@servicesUrl'
        },
    };
}

app.directive('loginlogout', loginlogoutDirective);

console.log("loginlogout is set up");
