/***********************************
 * get-uri-permissions.js
 */

console.log("loading get-uri-permissions.js")

var get_uri_permissions_cache = {};


// this should be an angular service
function get_uri_permissions($rootScope, $http, uri, callback)
{
    if(get_uri_permissions_cache[uri]) {
        var p = get_uri_permissions_cache[uri];
        callback(p.data, p.success);
    }
    else {
        console.log("fetch permission for " + uri);

        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonView/permissions',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            params: {
                'uri': uri
            }
        }).then(function successCallback(response) {
            console.log("fetch permission for " + uri + " SUCCESS");
            console.log(response);
            get_uri_permissions_cache[uri] = { data: response.data, success: true};
            callback(response.data, true);
        }, function errorCallback(response) {
            console.log("fetch permission for " + uri + " FAIL");
            console.log(response);
            get_uri_permissions_cache[uri] = { data: response.data, success: false};
            callback(response.data, false);
        });
    }
}

