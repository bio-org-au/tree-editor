var ClassificationslistController = function ($scope, $rootScope, $http) {
}

ClassificationslistController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Classificationslist', ClassificationslistController);


function classificationslistDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/classifications/list.html",
        controller: ClassificationslistController,
        scope: {
        },
    };
}

app.directive('classificationslist', classificationslistDirective);

