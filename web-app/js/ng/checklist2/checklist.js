
function putErrorOnPage($rootScope, response) {
    if (response.data && response.data.msg) {
        $rootScope.msg = response.data.msg;
    }
    else if (response.data && response.data.status) {
        $rootScope.msg = [
            {
                msg: 'URL',
                body: response.config.url,
                status: 'info'
            },
            {
                msg: response.data.status,
                body: response.data.reason,
                status: 'danger'
            }
        ];
    }
    else {
        $rootScope.msg = [
            {
                msg: 'URL',
                body: response.config.url,
                status: 'info'
            },
            {
                msg: response.status,
                body: response.statusText,
                status: 'danger'
            }
        ];
    }
}

var ChecklistController = ['$scope', '$rootScope', '$http', 'jsonCache', function ($scope, $rootScope, $http, jsonCache) {
    $scope.checklist_scope = $scope;

    $scope.arrangement = jsonCache.needJson($scope.arrangementUri);
    $scope.path = null;
    $scope.pathState = {loading: false, loaded: false};
    $scope.cursorNode = $scope.node;

    $scope.appendBranchToPath = function() {};

    $scope.nodeUI = {}; // this is where I remember which nodes are open, etc
    $scope.getNodeUI = function (node) {
        if (!$scope.nodeUI[node]) {
            $scope.nodeUI[node] = {open: false};
        }
        return $scope.nodeUI[node];
    };

    $scope.clickPath = function(index) {
        console.log("path item " + index + " clicked");
    };


    $http({
        method: 'GET',
        url: $rootScope.servicesUrl + "/TreeJsonView/nodePath",
        params: {arrangement: $scope.arrangementUri, focus: $scope.focusUri}
    })
        .then(function (response) {
            console.log("GET PATH SUCCESS");
            $scope.pathState.loading = false;
            $scope.pathState.loaded = true;
            $scope.path = response.data.result;

            $scope.focusJson = $scope.path[$scope.path.length - 1];

            if (!$scope.cursorNode) {
                $scope.cursorNode = $scope.focusJson.node
            }

            for (i in $scope.path) {
                $scope.getNodeUI($scope.path[i].node).open = true;
            }

        }, function (response) {
            console.log("GET PATH FAIL");
            console.log(response);
            $scope.pathState.loading = false;
            putErrorOnPage($rootScope, response);
        });
}];

app.controller('Checklist', ChecklistController);

var checklistDirective = [function () {
    return {
        templateUrl: pagesUrl + "/ng/checklist2/checklist.html",
        controller: ChecklistController,
        scope: {
            arrangementUri: "@",
            node: "@"
        }
    };
}];

app.directive('checklist', checklistDirective);


var BranchController = ['$scope', '$rootScope', '$http', 'jsonCache', function ($scope, $rootScope, $http, jsonCache) {
    $scope.checklist_scope = $scope.$parent.checklist_scope;

    $scope.branchState = {loading: false, loaded: false};

    $scope.UI = $scope.checklist_scope.getNodeUI($scope.json.node)
    
    $scope.selectMe = function() {
        $scope.checklist_scope.cursorNode = $scope.json.node;
        $scope.checklist_scope.path = [];
        $scope.appendBranchToPath();
    };

    $scope.appendBranchToPath = function() {
        $scope.$parent.appendBranchToPath();
        $scope.checklist_scope.path[$scope.checklist_scope.path.length] = $scope.json
    };

    var deregisterLoading = $scope.$watch("UI.open", function () {
            if ($scope.UI.open && $scope.arrangementUri && !$scope.branchState.loading) {

                console.log("EXECUTING BRANCH FETCH");
                console.log("$scope.arrangementUri" + $scope.arrangementUri);
                console.log("$scope.json.uri" + $scope.json.uri);

                // only do this once
                deregisterLoading();

                $scope.branchState.loading = true;

                $http({
                    method: 'GET',
                    url: $rootScope.servicesUrl + "/TreeJsonView/nodeBranch",
                    params: {arrangement: $scope.arrangementUri, node: $scope.json.node}
                })
                    .then(
                        function (response) {
                            console.log("GET BRANCH SUCCESS");
                            $scope.branchState.loading = false;
                            $scope.branchState.loaded = true;
                            $scope.branch = response.data.result
                        },
                        function (response) {
                            console.log("GET BRANCH FAIL");
                            console.log(response);
                            $scope.branchState.loading = false;
                            putErrorOnPage($rootScope, response);
                        });
            }
        }
    );

}];

app.controller('Branch', BranchController);

var branchDirective = ['RecursionHelper', function (RecursionHelper) {
    return {
        templateUrl: pagesUrl + "/ng/checklist2/branch.html",
        controller: BranchController,
        scope: {
            arrangementUri: '@',
            json: '=',
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
}];

app.directive('branch', branchDirective);

