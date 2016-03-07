
// this should be an angular "service". Too busy to servicify it now.

function setupJsonCache($rootScope, $http) {

    $rootScope.jsonCache = {};

    $rootScope.currentJson = function(uri) {
        if(!uri) return null;

        if(!$rootScope.jsonCache[uri]) {
            $rootScope.jsonCache[uri] = {
                "_links": {"permalink": {"link": uri, "preferred": true}},
                fetching: false,
                fetched: false
            };
        }

        return $rootScope.jsonCache[uri];
    }

    $rootScope.needJson = function(uri) {
        if(!uri) return null;
        var json = $rootScope.currentJson(uri);

        if(!json.fetched) {
            $rootScope.refetchJson(uri);
        }

        return $rootScope.jsonCache[uri];
    }

    $rootScope.refetchJson = function(uri) {
        if(!uri) return null;
        var json = $rootScope.currentJson(uri);

        if(!json.fetching) {
            json.fetching = true;
            $rootScope.$broadcast('nsl-json-state', uri, json);

            $http({
                method: 'GET',
                url: uri
            }).then(function successCallback(response) {
                json = response.data;
                $rootScope.jsonCache[uri] = json;
                response.data.fetching = false;
                response.data.fetched = true;
                $rootScope.$broadcast('nsl-json-state', uri, json);
                $rootScope.$broadcast('nsl-json-fetched', uri, json);
            }, function errorCallback(response) {
                if(uri=='http://localhost:7070/nsl-mapper/tree/apni/1133571') {
                    console.log('failure! ' + uri);
                }
                $rootScope.jsonCache[uri].fetching = false;
                $rootScope.$broadcast('nsl-json-state', uri, json);
            });
        }

        return $rootScope.jsonCache[uri];
    }

    // loads a uri, with a callback

    $rootScope.loadJson = function(uri, callback) {
        if(!uri) {
            callback(null, null);
            return;
        }

        $rootScope.needJson(uri);
        var callBackDone;

        function onjsonfetched(event1, uri1, json1) {
            var json = $rootScope.currentJson(uri);
            if(!json.fetching) {
                callBackDone();
                callback(uri, json);
            }
        }

        callBackDone = $rootScope.$on('nsl-json-fetched', onjsonfetched);
        onjsonfetched();
    };


};

var GetJsonController = function ($scope, $rootScope) {
    // everyone needs this
    $scope.getPreferredLink = getPreferredLink;

    $scope.refetchUriAndJson = function() {
        $scope.json = $rootScope.needJson($scope.uri);
        if($scope.afterUpdateJson) {
            $scope.afterUpdateJson();
        }
        $rootScope.loadJson($scope.uri, function(uri, json) {
            $scope.json = json;
            if($scope.afterUpdateJson) {
                $scope.afterUpdateJson();
            }
        });
    };

    $scope.refetchUriAndJson();

    $scope.$watch('uri', $scope.refetchUriAndJson);

}

GetJsonController.$inject = ['$scope', '$rootScope'];

app.controller('GetJsonController', GetJsonController);

var shortnodetextDirective = function() {
    return {
        templateUrl: "/tree-editor/assets/ng/utility/shortnodetext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        },
    };
}

app.directive('shortnodetext', shortnodetextDirective);

var shortnametextDirective = function() {
    return {
        templateUrl: "/tree-editor/assets/ng/utility/shortnametext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        },
    };
}

app.directive('shortnametext', shortnametextDirective);
