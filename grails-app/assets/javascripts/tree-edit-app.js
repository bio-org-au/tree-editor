var app = angular.module('au.org.biodiversity.nsl.tree-edit-app', []);

////////////////////////////////////////////////////////////


var TreeEditAppController = function ($scope, $http, $element) {
    $scope.footer = "this is a footer";
    $scope.rightpanel_select = "cls";

    $scope.leftUri = null; // "http://localhost:7070/nsl-mapper/boa/tree/apni/1019";
    $scope.rightUri = null; // "http://localhost:7070/nsl-mapper/boa/tree/apni/3029293";

    $scope.appScope = $scope;
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

////////////////////////////////////////////////////////////

var ClassificationsListController = function ($scope, $http, $element) {
    $scope.appScope = $scope.$parent.appScope;

    $scope.loading = false;
    $scope.loaded = false;
    $scope.response = "init";
    $scope.classifications = [];

    $scope.reload = function() {
        $scope.loading = true;
        $scope.response = "fetching";
        $scope.classifications = [];

        $http({
            method: 'GET',
            url: $scope.servicesUrl + '/TreeJsonView/listClassifications'
        }).then(function successCallback(response) {
            $scope.loading = false;
            $scope.loaded = true;
            $scope.classifications = response.data;
            $scope.response = response;
        }, function errorCallback(response) {
            $scope.loading = false;
            $scope.response = response;
        });
    };

    $scope.loadLeft = function(uri) {
        $scope.appScope.leftUri = uri;
    };

    $scope.loadRight = function(uri) {
        $scope.appScope.rightUri = uri;
    };

    $scope.reload();
};

ClassificationsListController.$inject = ['$scope', '$http', '$element'];

app.controller('ClassificationsListController', ClassificationsListController);

function ClassificationsListDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/ClassificationsList.html",
        scope: {
            servicesUrl: '@',
            appScope: '&appScope',
        },
        controller: ClassificationsListController
    };
}

app.directive('classificationsList', ClassificationsListDirective);

////////////////////////////////////////////////////////////

var ItemController = function ($scope, $http, $element) {
    $scope.appScope = $scope.$parent.appScope;
    $scope.itemScope = $scope;

    $scope.loading = true;
    $scope.loaded = false;
    $scope.data = null;

    $scope.reload = function() {
        $scope.loading = true;
        $scope.loaded = false;
        $scope.data = null;
        $scope.response = null;

        $http({
            method: 'GET',
            url: $scope.uri
        }).then(function successCallback(response) {
            $scope.loading = false;
            $scope.loaded = true;
            $scope.response = response;
            $scope.data = response.data;
        }, function errorCallback(response) {
            $scope.loading = false;
            $scope.loaded = false;
            $scope.response = response;
        });
    };

    $scope.reload();
};

ItemController.$inject = ['$scope', '$http', '$element'];

app.controller('ItemController', ItemController);

function ItemDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/Item.html",
        scope: {
            uri: '@'
        },
        controller: ItemController
    };
}

app.directive('item', ItemDirective);


////////////////////////////////////////////////////////////

var ItemHeaderController = function ($scope, $http, $element, $rootScope) {
    $scope.appScope = $scope.$parent.appScope;
    $scope.itemScope = $scope;
//    $scope.itemScope.watch("uri", function() { console.log($scope.itemScope.uri ? 'loaded' : 'empty') } );

    $rootScope.$$postDigest(function(){adjust_working_body_height()});
}

ItemHeaderController.$inject = ['$scope', '$http', '$element', '$rootScope'];

app.controller('ItemHeaderController', ItemHeaderController);

function itemHeaderDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/ItemHeader.html",
        scope: {
            uri: '@uri',
        },
        controller: ItemHeaderController
    };
}

app.directive('itemheader', itemHeaderDirective);

////////////////////////////////////////////////////////////

var ItemBodyController = function ($scope, $http, $element) {
    $scope.appScope = $scope.$parent.appScope;
    $scope.itemScope = $scope;
}

ItemBodyController.$inject = ['$scope', '$http', '$element'];

app.controller('ItemBodyController', ItemBodyController);

function itemBodyDirective() {
    return {
        templateUrl: "/tree-editor/assets/ng/treeEdit/ItemBody.html",
        scope: {
            uri: '@uri',
        },
        controller: ItemBodyController
    };
}

app.directive('itembody', itemBodyDirective);
