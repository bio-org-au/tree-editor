//= require get-preferred-link
//= require utility/get-json-controller
//= require utility/get-form-json

var FindnameintreeController = function ($scope, $rootScope, $http, $element) {
    setupJsonCache($rootScope, $http);

    GetJsonController($scope, $rootScope);

    $scope.hasResults = true;
    $scope.tab = 'searchTab';
    $scope.searching = false;
    $scope.searchResults = [];

    $scope.clickSearchTab = function() {
        $scope.tab = 'searchTab';
    };

    $scope.clickResultsTab = function() {
        if($scope.hasResults)
            $scope.tab = 'resultsTab';
    };


    $scope.formSubmitted = function() {
        var searchParams = {};
        var a = $element.find('#search').serializeArray();
        for(i in a) {
            searchParams[a[i].name] = a[i].value;
        }

        searchParams['product'] = $rootScope.namespace;
        searchParams['tree_uri'] = $scope.uri;

        $scope.searching = true;

        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonView/searchNamesInTree',
            params: searchParams
        }).then(function successCallback(response) {
            $scope.searching = false;
            $scope.searchResults = response.data;
            $scope.searchError = null;
            $scope.hasResults = true;
        }, function errorCallback(response) {
            $scope.searching = false;
            $scope.searchError = response;
        });

        $scope.tab = 'resultsTab';
    };
}

FindnameintreeController.$inject = ['$scope', '$rootScope', '$http', '$element'];

app.controller('Findnameintree', FindnameintreeController);

var findnameintreeDirective = function () {
    return {
        templateUrl: "/tree-editor/assets/ng/search/findnameintree.html",
        controller: FindnameintreeController,
        scope: {
            uri: "@",
            type: "@"
        },
        link: function(scope, element, attrs, controller, transcludeFn) {
            // put the services search fomr into #search-container
            console.log("EXECUTING LINK");

            $(element).find("#search-container").load("http://localhost:8080/services/search/form", null, function() {
                console.log("SEARCH FORM IS LOADED");

                // once the search container has been loaded, hijack it by
                // catching the form submit event
                $("#search").submit(function(event) {
                    // on a submit, kill the default behavior, then re-enter angular and call a scope function
                    event.preventDefault();
                    scope.$apply(function() {
                        scope.formSubmitted();
                    });
                });
            });
        }
    };
};

app.directive('findnameintree', findnameintreeDirective);
