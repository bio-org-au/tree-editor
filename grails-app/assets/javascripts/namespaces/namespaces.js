var NamespaceselectController = function ($scope, $rootScope, $http) {
}


NamespaceselectController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Namespaceselect', NamespaceselectController);


function namespacesdropdownDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/namespaces/dropdown.html",
        controller: NamespaceselectController,
        scope: {
        },
    };
}

app.directive('namespacesdropdown', namespacesdropdownDirective);

