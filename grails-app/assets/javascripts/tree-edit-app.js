var app = angular.module('au.org.biodiversity.nsl.tree-edit-app', []);

var TreeEditAppController = function ($scope, $http, $element) {
    $scope.footer = "this is a footer"
    $scope.rightpanel_select = "fav";
};

TreeEditAppController.$inject = ['$scope', '$http', '$element'];
app.controller('TreeEditAppController', TreeEditAppController);

function TreeEditAppDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/app.html",
        scope: {
            servicesUrl: '@servicesUrl'
        },
        controller: TreeEditAppController
    };
}

app.directive('app', TreeEditAppDirective);
