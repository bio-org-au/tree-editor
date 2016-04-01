//= require get-preferred-link
//= require utility/get-json-controller
//= require utility/get-form-json

var FindnameintreeController = function ($scope, $rootScope, $http, $element) {
    setupJsonCache($rootScope, $http);

    GetJsonController($scope, $rootScope);
}

FindnameintreeController.$inject = ['$scope', '$rootScope', '$http', '$element'];

app.controller('Findnameintree', FindnameintreeController);

var findnameintreeDirective = function () {
    return {
        templateUrl: "/tree-editor/assets/ng/search/findnameintree.html",
        controller: FindnameintreeController,
        scope: {
            uri: "@"
        },
        link: function(scope, element, attrs, controller, transcludeFn) {
            // put the services search fomr into #search-container
/*
            console.log("LOADING THE SEARCH FORM");

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
 */
        }
    };
};

app.directive('findnameintree', findnameintreeDirective);
