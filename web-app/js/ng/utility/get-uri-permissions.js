/***********************************
 * get-uri-permissions.js
 */

console.log("loading get-uri-permissions.js")

// this should be an angular service
function get_uri_permissions($rootScope, $http, uri, callback)
{

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
        callback(response.data, true, response);
    }, function errorCallback(response) {
        callback(response.data, false, response);
   });
}