/***********************************
 * get-json-controller.js
 */

console.log("loading get-json-controller.js")

// this should be an angular "service". Too busy to servicify it now.

app.factory('jsonCache', ['$http', '$rootScope', '$interval', function ($http, $rootScope, $interval) {
    var jsonCache = {};

    function currentJson(uri) {
        if (!uri) return null;

        if (!jsonCache[uri]) {
            jsonCache[uri] = {
                "_links": {"permalink": {"link": uri, "preferred": true}},
                fetching: false,
                fetched: false,
                _uri: uri
            };
        }

        return jsonCache[uri];
    }

    function needJson(uri) {
        if (!uri) return null;
        var json = currentJson(uri);

        if (!json.fetched) {
            refetchJson(uri);
        }

        return jsonCache[uri];
    }

    // recursively run through the object, use getPreferredLink to stamp every object with it it _uri

    function stampJson(json) {
        // I have to do this nonrecursively
        // I can just use a queue, because I know that json objects don't contain internal links or cycles
        var todoQueue = [json];
        while (todoQueue.length > 0) {
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
        while (todoQueue.length > 0) {
            o = todoQueue.pop();

            var uri = getPreferredLink(o); // this will set _uri

            // if this object is a marshalled object, then we should *not* go down into it to get the other objects,
            // because these other objects will be brief objects rather than full ones.

            // if this object is not a marshalled object, then it's some sort of search result or something and will
            // contain the whole thing

            if (uri) {
                var cache_o = currentJson(uri);

                // we move all the properties into the existing item, rather than replacing it
                for (i in cache_o) {
                    delete cache_o[i];
                }
                for (i in o) {
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

    var bulkUrisPending = [];
    var bulkUrisInProgress = [];

    function refetchJson(uri) {
        if (!uri) return null;
        var json = currentJson(uri);

        if(!json.fetching && !json.queued_for_fetching) {
            json.queued_for_fetching = true;

            bulkUrisPending.push(uri);

            manageBulkState();
        }


        return json;
    }

    function manageBulkState() {

        if(bulkUrisInProgress.length > 0) return;
        if(bulkUrisPending.length == 0) return;

        // ok. time to push.
        for(var i = 0; i<50; i++) if(bulkUrisPending.length > 0) {
            var json = currentJson(bulkUrisPending.shift());
            json.fetching = true;
            json.queued_for_fetching = false;
            json._fetchError = null;
            bulkUrisInProgress.push(json._uri);
        }

        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + "/api/bulk-fetch",
            data: bulkUrisInProgress
        }).then(function (response) {
            console.log("BULK FETCH SUCCESS");
            console.log(response);

            stampJson(response.data);
            scanJson(response.data);

            while(bulkUrisInProgress.length > 0) {
                var json = currentJson(bulkUrisInProgress.shift());
                json.fetching = false;
                json._fetchError = null;
            }

            // re-fire immediately after the HTTP comes back
            manageBulkState();
        }, function (response) {
            console.log("BULK FETCH FAIL");
            console.log(response);
            while(bulkUrisInProgress.length > 0) {
                var json = currentJson(bulkUrisInProgress.shift());
                json.fetching = false;
                json._fetchError = response;
            }

            // re-fire immediately after the HTTP comes back
            manageBulkState();
        });


    }

    // loads a uri, with a callback

    function loadJson(uri, callback) {
        console.log("loadjson is deprecated");

        if (!uri) {
            callback(null, null);
            return;
        }

        callback(uri, needJson(uri));
    }

    console.log("instantiating jsonCache service");

    return {
        currentJson: currentJson,
        needJson: needJson,
        refetchJson: refetchJson,
        loadJson: loadJson
    };

}]);

var GetJsonController = ['$scope', 'jsonCache', function ($scope, jsonCache) {
    // everyone needs this
    $scope.getPreferredLink = getPreferredLink;
    $scope.json = jsonCache.needJson($scope.uri);
    $scope.$watch('uri', function () {
        $scope.json = jsonCache.needJson($scope.uri);
        if ($scope.afterUpdateJson) {
            $scope.afterUpdateJson();
            if ($scope.json) {
                var deregisterLoading = $scope.$watch(
                        '(json.fetching?0:1) + (json.queued_for_fetching?0:2)',
                    function () {
                    $scope.afterUpdateJson();
                    if (!$scope.json || (!$scope.json.fetching && !$scope.json.queued_for_fetching)) {
                        deregisterLoading();
                    }
                });
            }
        }
    });
}];

var inheritJsonController = GetJsonController[2];

app.controller('GetJsonController', GetJsonController);

var shortnodetextDirective = [function () {
    return {
        templateUrl: pagesUrl + "/ng/utility/shortnodetext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        }
    };
}];

app.directive('shortnodetext', shortnodetextDirective);

var shortnametextDirective = [function () {
    return {
        templateUrl: pagesUrl + "/ng/utility/shortnametext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        }
    };
}];
app.directive('shortnametext', shortnametextDirective);

var shortarrangementtextDirective = [function () {
    return {
        templateUrl: pagesUrl + "/ng/utility/shortarrangementtext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        }
    };
}];
app.directive('shortarrangementtext', shortarrangementtextDirective);

var shortinsttextnonameDirective = [function () {
    return {
        templateUrl: pagesUrl + "/ng/utility/shortinsttextnoname.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        }
    };
}];
app.directive('shortinsttextnoname', shortinsttextnonameDirective);

var shortinsttextDirective = [function () {
    return {
        templateUrl: pagesUrl + "/ng/utility/shortinsttext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        }
    };
}];
app.directive('shortinsttext', shortinsttextDirective);

var shortinstcitestextDirective = [function () {
    return {
        templateUrl: pagesUrl + "/ng/utility/shortinstcitestext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        }
    };
}];
app.directive('shortinstcitestext', shortinstcitestextDirective);

var shortinstcitedbytextDirective = [function () {
    return {
        templateUrl: pagesUrl + "/ng/utility/shortinstcitedbytext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        }
    };
}];
app.directive('shortinstcitedbytext', shortinstcitedbytextDirective);

var nameonlytextDirective = [function () {
    return {
        templateUrl: pagesUrl + "/ng/utility/nameonlytext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        }
    };
}];
app.directive('nameonlytext', nameonlytextDirective);

var nameonlynodetextDirective = [function () {
    return {
        templateUrl: pagesUrl + "/ng/utility/nameonlynodetext.html",
        controller: GetJsonController,
        scope: {
            uri: '@uri'
        }
    };
}];
app.directive('nameonlynodetext', nameonlynodetextDirective);

var EventtextController = ['$scope', 'jsonCache', function ($scope, jsonCache) {
    inheritJsonController($scope, jsonCache);

    $scope.afterUpdateJson = function() {
        if($scope.json && $scope.json.fetched && $scope.json.timeStamp) {
            var d = new Date(Date.parse($scope.json.timeStamp))
            $scope.timestampString = d.toLocaleString();
        }
        else {
            $scope.timestampString = null;
        }
    }
}];

var eventextDirective = [function () {
    return {
        templateUrl: pagesUrl + "/ng/utility/eventtext.html",
        controller: EventtextController,
        scope: {
            uri: '@uri'
        }
    };
}];
app.directive('eventtext', eventextDirective);
