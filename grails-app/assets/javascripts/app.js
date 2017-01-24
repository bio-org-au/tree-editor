/***********************************
 * app.js
 */

var app = angular.module('au.org.biodiversity.nsl.tree-edit-app', ['Mark.Lagendijk.RecursionHelper', 'ngSanitize']);

var AppbodyController = ['$rootScope', '$element', function($rootScope, $element) {
    // not using a directive to manage scope values - I'll just do this here
    $rootScope.servicesUrl = $element[0].getAttribute('data-services-url');
    $rootScope.pagesUrl = $element[0].getAttribute('data-pages-url');
    $rootScope.namespace = $element[0].getAttribute('data-namespace');

    $rootScope.isLoggedIn = function() {
        return localStorage.getItem('nsl-tree-editor.loginlogout.loggedIn')=='Y';
    };

    $rootScope.getUser = function() {
        return localStorage.getItem('nsl-tree-editor.loginlogout.principal');
    };

    $rootScope.getJwt = function() {
        return localStorage.getItem('nsl-tree-editor.loginlogout.jwt');
    };

    function getBm(category) {
        if(!category || !$rootScope.namespace) return {};


        var mod = false;

        var bm = JSON.parse(localStorage.getItem('nsl-tree-editor.bookmarks'));

        if(!bm) {
            bm = {};
            mod = true;
        }

        if(!bm[$rootScope.namespace]) {
            bm[$rootScope.namespace] = {};
            mod = true;
        }

        if(!bm[$rootScope.namespace][category]) {
            bm[$rootScope.namespace][category] = {};
            mod = true;
        }

        if(!bm[$rootScope.namespace][category].set) {
            bm[$rootScope.namespace][category].set = {};
            mod = true;
        }

        if(!bm[$rootScope.namespace][category].vec) {
            bm[$rootScope.namespace][category].vec = [];
            mod = true;
        }

        if(mod) {
            localStorage.setItem('nsl-tree-editor.bookmarks', JSON.stringify(bm));
        }

        return bm;
    }

    $rootScope.getBookmarks = function(category) {
        var bm = getBm(category);
        return bm[$rootScope.namespace][category];
    };

    $rootScope.clearBookmarks = function(category) {
        var bm = getBm(category);
        var thebiz = bm[$rootScope.namespace][category];

        thebiz.set = {};
        thebiz.vec = [];
        localStorage.setItem('nsl-tree-editor.bookmarks', JSON.stringify(bm));
        $rootScope.$broadcast('nsl-tree-edit.bookmark-changed', category);
    };


    $rootScope.addBookmark = function(category, uri) {
        var bm = getBm(category);
        var thebiz = bm[$rootScope.namespace][category];

        // i'm going to do this the easy way
        var newVec = new Array;
        for(var vec_i in thebiz.vec) {
            if(thebiz.vec[vec_i] != uri) {
                newVec.push(thebiz.vec[vec_i]);
            }
        }
        newVec.push(uri);

        var newSet = {};
        for(var i in newVec) {
            newSet[newVec[i]] = i;
        }

        thebiz.vec= newVec;
        thebiz.set = newSet;

        localStorage.setItem('nsl-tree-editor.bookmarks', JSON.stringify(bm));
        $rootScope.$broadcast('nsl-tree-edit.bookmark-changed', category, uri, true);
    };

    $rootScope.removeBookmark = function(category, uri) {
        var bm = getBm(category);
        var thebiz = bm[$rootScope.namespace][category];

        // i'm going to do this the easy way
        var newVec = [];
        for(var vec_i in thebiz.vec) {
            if(thebiz.vec[vec_i] != uri) {
                newVec.push(thebiz.vec[vec_i]);
            }
        }

        var newSet = {};
        for(var vec_i in newVec) {
            newSet[newVec[vec_i]] = vec_i;
        }

        thebiz.vec= newVec;
        thebiz.set = newSet;

        localStorage.setItem('nsl-tree-editor.bookmarks', JSON.stringify(bm));
        $rootScope.$broadcast('nsl-tree-edit.bookmark-changed', category, uri, true);
    };


    $rootScope.clickBookmark = function (uri) {
        window.location = $rootScope.pagesUrl + "/checklist/checklist?focus=" + uri;
    };
    $rootScope.clickTrashBookmark = function (uri) {
        $rootScope.removeBookmark('taxa-nodes', uri);
    };
    $rootScope.clickClearBookmarks = function (uri) {
        $rootScope.clearBookmarks('taxa-nodes');
    };

    // bookmark gear
    $rootScope.taxanodes_bookmarks = $rootScope.getBookmarks('taxa-nodes');
    $rootScope.$on('nsl-tree-edit.bookmark-changed', function (event, category, uri, status) {
        if (category == 'taxa-nodes') {
            $rootScope.taxanodes_bookmarks = $rootScope.getBookmarks('taxa-nodes');
        }
    });
    $rootScope.$on('nsl-tree-edit.namespace-changed', function (event) {
        $rootScope.taxanodes_bookmarks = $rootScope.getBookmarks('taxa-nodes');
    });


}];

app.controller('appbody', AppbodyController);

var NestedMessageController = ['$scope', '$rootScope', '$http', 'jsonCache', function ($scope, $rootScope, $http, jsonCache) {
    $scope.msg = $scope.usemessage();
    
    $scope.linksDropdown = false;

    $scope.closeLinksDropdown = function() { $scope.linksDropdown = false;}
    $scope.toggleLinksDropdown = function() { $scope.linksDropdown = !$scope.linksDropdown; }

}];


app.controller('NestedMessage', NestedMessageController);

app.directive('nestedMessage', [ 'RecursionHelper', function(RecursionHelper) {
    return {
        templateUrl: pagesUrl + "/assets/ng/utility/nestedmessage.html",
        controller: NestedMessageController,
        scope: {
            usemessage: "&"
        },
        compile: function (element) {
            return RecursionHelper.compile(element, function (scope, iElement, iAttrs, controller, transcludeFn) {
                // Define your normal link function here.
                // Alternative: instead of passing a function,
                // you can also pass an object with
                // a 'pre'- and 'post'-link function.
            });
        }
    };
}]);