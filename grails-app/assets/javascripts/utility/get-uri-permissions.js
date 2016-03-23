
// this shhould be an angular service
function get_uri_permissions($rootScope, $http, uri, callback)
{

    $http({
        method: 'POST',
        url: $rootScope.servicesUrl + '/TreeJsonView/permissions',
        headers: {
            'Access-Control-Request-Headers': 'nsl-jwt',
            'nsl-jwt': $rootScope.getJwt()
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