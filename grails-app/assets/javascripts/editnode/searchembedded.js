//= require get-preferred-link
//= require utility/get-json-controller

var SearchembeddedController = function ($scope, $rootScope, $http) {
    setupJsonCache($rootScope, $http);

    $scope.submissionCount = 0;

    $scope.formSubmitted = function() {
        $scope.submissionCount++;
    };

};

GetJsonController.$inject = ['$scope', '$rootScope', '$http'];

app.controller('Searchembedded', SearchembeddedController);

var searchembeddedDirective = function () {
    return {
        templateUrl: "/tree-editor/assets/ng/editnode/searchembedded.html",
        controller: SearchembeddedController,
        scope: {
            rootUri: "@root",
            focusUri: "@focus"
        },
        link: function(scope, element, attrs, controller, transcludeFn) {
            // put the services search fomr into #search-container
            $(element).find("#search-container").load("http://localhost:8080/services/search/form", null, function() {
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

app.directive('searchembedded', searchembeddedDirective);
