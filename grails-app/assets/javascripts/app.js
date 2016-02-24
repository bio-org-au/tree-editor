//= require angular
//= require recursionhelper
//= require angular-sanitize

var app = angular.module('au.org.biodiversity.nsl.tree-edit-app', ['Mark.Lagendijk.RecursionHelper', 'ngSanitize']);

var AppbodyController = function ($rootScope, $element) {
    $rootScope.servicesUrl = $element[0].getAttribute('data-services-url');

    $rootScope.isLoggedIn = function() {
        return localStorage.getItem('nsl-tree-editor.loginlogout.loggedIn')=='Y';
    };

    $rootScope.getUser = function() {
        return localStorage.getItem('nsl-tree-editor.loginlogout.principal');
    };

    $rootScope.getJwt = function() {
        return localStorage.getItem('nsl-tree-editor.loginlogout.jwt');
    };

};

AppbodyController.$inject = ['$rootScope', '$element'];

app.controller('appbody', AppbodyController);
