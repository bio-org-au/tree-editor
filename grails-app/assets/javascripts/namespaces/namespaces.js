var NamespaceselectController = function ($scope, $rootScope, $http) {
    $rootScope.namespace = localStorage.getItem('nsl-tree-editor.namespaces.namespace');
    if(!$rootScope.namespace || $rootScope.namespace=='') {
        $rootScope.namespace = null;
    }

    $scope.setNamespace = function(ns_name) {
        localStorage.setItem('nsl-tree-editor.namespaces.namespace', ns_name ? ns_name : '');
        $rootScope.namespace = ns_name;
        $rootScope.$broadcast('nsl-tree-edit.namespace-changed', ns_name);
    };

    $scope.namespaceDropdown_toggle = function() {
        $scope.namespaceDropdown_visible = ! $scope.namespaceDropdown_visible;
    };
    $scope.namespaceDropdown_click = function(ns) {
        $scope.setNamespace(ns.name);
    };
    $scope.namespaceDropdown_visible = false;
    $scope.namespaces = [];

    $scope.reloadNamespaces = function() {
        $scope.loadingNamespaces = true;
        $scope.namespaces = [];

        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + '/TreeJsonView/listNamespaces'
        }).then(function successCallback(response) {
            $scope.loadingNamespaces = false;
            $scope.namespaces = response.data;

            // if the current scope namespace is not in the new namespaces, set it to the first one

            if($scope.namespaces.length == 0) {
                $scope.setNamespace(null);
            }
            else {
                var found = false;
                for(var i in $scope.namespaces) {
                    if($scope.namespaces[i].name == $rootScope.namespace) {
                        found = true;
                        break;
                    }
                }
                if(!found) {
                    $scope.setNamespace($scope.namespaces[0].name);
                }
            }
        }, function errorCallback(response) {
            $scope.loadingNamespaces = false;
        });
    };

    $scope.getNamespace = function() { return $rootScope.namespace; };

    $scope.reloadNamespaces();
}


NamespaceselectController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Namespaceselect', NamespaceselectController);

function namespacesdropdownDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/namespaces/dropdown.html",
        controller: NamespaceselectController,
        scope: {
            namespace: '&'
        },
    };
}

app.directive('namespacesdropdown', namespacesdropdownDirective);
