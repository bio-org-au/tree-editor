
// this should be an angular "service". Too busy to servicify it now.

function setupJsonCache($rootScope, $http) {

    $rootScope.jsonCache = {};

    $rootScope.currentJson = function(uri) {
        if(!uri) return null;

        if(!$rootScope.jsonCache[uri]) {
            $rootScope.jsonCache[uri] = {
                "_links": {"permalink": {"link": uri, "preferred": true}},
                fetching: false,
                fetched: false,
                _uri: uri
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

    // recursively run through the object, use getPreferredLink to stamp every object with it it _uri

    function stampJson(json) {
        // I have to do this nonrecursively
        // I can just use a queue, because I know that json objects don't contain internal links or cycles
        var todoQueue = [json];
        while(todoQueue.length > 0) {
            o = todoQueue.pop();
            var uri = getPreferredLink(o); // this will set _uri
            for (var prop in o) {
                if (o[prop] && (typeof o[prop] == 'object')) {
                    todoQueue.push(o[prop]);
                }
            }
        }
    }

    // recursively run through the object, finding anything with a preferred link and then putting it in the cache
    function scanJson(json) {
        // I have to do this nonrecursively
        // I can just use a queue, because I know that json objects don't contain internal links or cycles

        var todoQueue = [json];
        while(todoQueue.length > 0) {
            o = todoQueue.pop();

            var uri = getPreferredLink(o); // this will set _uri

            // if this object is a marshalled object, then we should *not* go down into it to get the other obejcts,
            // because these other objects will be brief objects rather than full ones.

            // if this object is not a marshalled object, then it's some sort of search reasult or something and will
            // contain the whole thing

            if (uri) {
                var cache_o = $rootScope.currentJson(uri);

                // we move all the properties into the existing item, rather than replacing it
                for(i in cache_o) {
                    delete cache_o[i];
                }
                for(i in o) {
                    cache_o[i] = o[i];
                }
                cache_o.fetching = false;
                cache_o.fetched = true;
            }
            else {
                for (var prop in o) {
                    if (o[prop] && (typeof o[prop] == 'object')) {
                        todoQueue.push(o[prop]);
                    }
                }
            }
        }
    }


    $rootScope.refetchJson = function(uri) {
        if(!uri) return null;
        var json = $rootScope.currentJson(uri);

        if(!json.fetching) {
            json.fetching = true;
            json._fetchError = null;
            $http({
                method: 'GET',
                url: uri
            }).then(function successCallback(response) {
                stampJson(response.data);
                scanJson(response.data);
                json.fetching = false;
            }, function errorCallback(response) {
                json.fetching = false;
                json._fetchError = response;
            });
        }

        return json;
    }

    // loads a uri, with a callback

    $rootScope.loadJson = function(uri, callback) {
        console.log("loadjson is deprecated");

        if(!uri) {
            callback(null, null);
            return;
        }

        callback(uri, $rootScope.needJson(uri));
    };


};

var GetJsonController = function ($scope, $rootScope) {
    // everyone needs this
    $scope.getPreferredLink = getPreferredLink;
    $scope.json = $rootScope.needJson($scope.uri);
    $scope.$watch('uri', function() {
        $scope.json = $rootScope.needJson($scope.uri)
        if($scope.afterUpdateJson) {
            $scope.afterUpdateJson();
            if($scope.json) {
                var deregisterLoading = $scope.$watch('json.fetching', function() {
                    $scope.afterUpdateJson();
                    if(!$scope.json || !$scope.json.fetching) {
                        deregisterLoading();
                    }
                });
            }
        }
    });
}

GetJsonController.$inject = ['$scope', '$rootScope'];

app.controller('GetJsonController', GetJsonController);

app.directive('shortnodetext', function() {
    return {
        templateUrl: "/tree-editor/assets/ng/utility/shortnodetext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        },
    };
});

app.directive('shortnametext', function() {
    return {
        templateUrl: "/tree-editor/assets/ng/utility/shortnametext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        },
    };
});

app.directive('shortarrangementtext', function() {
    return {
        templateUrl: "/tree-editor/assets/ng/utility/shortarrangementtext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        },
    };
});

app.directive('shortinstreftext', function() {
    return {
        templateUrl: "/tree-editor/assets/ng/utility/shortinstreftext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        },
    };
});
