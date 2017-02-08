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

    $scope.nodeUriCache = {};
    $scope.branchCache = {};


    // this function halts the recusion in the BranchController
    $scope.appendBranchToPath = function () {
    };

    $scope.nodeUI = {}; // this is where I remember which nodes are open, etc
    $scope.getNodeUI = function (node) {
        if (!$scope.nodeUI[node]) {
            $scope.nodeUI[node] = {open: false};
        }
        return $scope.nodeUI[node];
    };

    $scope.clickPathToFocus = function (index) {
        var p = $scope.pathToFocus.concat($scope.pathToSelection.slice(1));
        $scope.pathToFocus = p.slice(0, index+1)
        $scope.pathToSelection = p.slice(index)
        $scope.focusJson = p[index]
        $scope.focusNode = p[index].node;
    };

    $scope.clickPathToSelection = function (index) {
        index += $scope.pathToFocus.length -1;
        var p = $scope.pathToFocus.concat($scope.pathToSelection.slice(1));
        $scope.pathToFocus = p.slice(0, index+1)
        $scope.pathToSelection = p.slice(index)
        $scope.focusJson = p[index]
        $scope.focusNode = p[index].node;
    };


    $scope.reloadNodePath =  function(node) {
        console.log("LOADING NODE PATH");

        $scope.pathToFocus = null;
        $scope.pathToSelection = null;
        $scope.cursorNode = $scope.node;

        $scope.pathState = {loading: true, loaded: false};

        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + "/TreeJsonView/nodePath",
            params: {arrangement: $scope.arrangementUri, node: node}
        })
        .then(function (response) {
            console.log("GET PATH SUCCESS");
            console.log(response);
            $scope.pathState.loading = false;
            $scope.pathState.loaded = true;
            $scope.pathToFocus = response.data.result;

            $scope.focusJson = $scope.pathToFocus[$scope.pathToFocus.length - 1];
            $scope.focusNode = $scope.focusJson.node;

            $scope.pathToSelection = [$scope.focusJson];

            if (!$scope.cursorNode) {
                $scope.cursorNode = $scope.focusJson.node;
                $scope.pathToSelection = [$scope.focusJson];
            }

            for (i in $scope.pathToFocus) {
                $scope.getNodeUI($scope.pathToFocus[i].node).open = true;
            }

        }, function (response) {
            console.log("GET PATH FAIL");
            console.log(response);
            $scope.pathState.loading = false;
            putErrorOnPage($rootScope, response);
        });
    };

    console.log("$scope.reloadNodePath("+$scope.node+");")

    $scope.reloadNodePath($scope.node);

    $scope.quicksearch = {
        serial: 0
    };

    $scope.quicksearch.onchange = function() {
        var myText = $scope.quicksearch.text;
        var mySerial = ++ $scope.quicksearch.serial;
        $scope.quicksearch.open = false;
        $scope.quicksearch.hasResults = false;
        $scope.quicksearch.results = [];
        $scope.quicksearch.hasMore = false;
        $scope.quicksearch.noMatches = false;

        if(myText.length >=3) {
            window.setTimeout(function() {
                if(mySerial == $scope.quicksearch.serial) {
                    console.log("searching " + mySerial + " text " + myText);
                    if(myText.indexOf('%')==-1 && myText.indexOf('_')==-1) {
                        myText = myText + '%';
                    }
                    $scope.doSearch(myText, mySerial);
                }
                else {
                    console.log("not searching " + mySerial + " text " + myText);
                }
            }, 1000);
        }

    };

    $scope.quicksearch.onclickSearchResult = function(i) {
        console.log("item " + i + " selected");
        console.log($scope.quicksearch.results[i]);
        $scope.quicksearch.open = false;
        $scope.reloadNodePath($scope.quicksearch.results[i].node);
    };

    $scope.quicksearch.onclickDropdownbutton = function() {
        if($scope.quicksearch.hasResults) {
            $scope.quicksearch.open = !$scope.quicksearch.open;
        }
    }

    $scope.doSearch = function(myText, mySerial) {
        $rootScope.msg = null;

        if(!$scope.arrangementUri) return;

        $scope.quicksearch.inProgress = mySerial;
        $scope.quicksearch.open = false;
        $scope.quicksearch.hasResults = false;
        $scope.quicksearch.results = [];
        $scope.quicksearch.hasMore = false;
        $scope.quicksearch.noMatches = false;

        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonView/quickSearch',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            data: {
                arrangement: $scope.arrangementUri,
                searchText: myText
            }
        }).then(function successCallback(response) {
            if($scope.quicksearch.inProgress == mySerial) {
                $scope.quicksearch.open = true;
                $scope.quicksearch.hasResults = true;

                $scope.quicksearch.inProgress = null;
                $scope.quicksearch.results = response.data.results;
                $scope.quicksearch.total = response.data.results;
                $scope.quicksearch.hasMore =  response.data.total > response.data.results.length;
                $scope.quicksearch.more =  response.data.total - response.data.results.length;
                $scope.quicksearch.noMatches = response.data.results.length == 0;

            }
        }, function errorCallback(response) {
            if($scope.quicksearch.inProgress == mySerial) {
                $scope.quicksearch.hasResults = false;
                $scope.quicksearch.inProgress = null;
                if (response.data && response.data.msg) {
                    $rootScope.msg = response.data.msg;
                }
                else if (response.data.status) {
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
        });
    };


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
    $scope.branchState = {loading: null, loaded: null};
    $scope.UI = $scope.checklist_scope.getNodeUI($scope.json.node);

    $scope.selectMe = function () {
        $scope.checklist_scope.cursorNode = $scope.json.node;
        $scope.checklist_scope.pathToSelection = [];
        $scope.appendBranchToPath();
    };

    $scope.appendBranchToPath = function () {
        $scope.$parent.appendBranchToPath();
        $scope.checklist_scope.pathToSelection[$scope.checklist_scope.pathToSelection.length] = $scope.json
    };

    $scope.fetchBranch = function () {
        var node = $scope.json.node;

        if (!node) {
            $scope.branchState.loading = null;
            $scope.branchState.loaded = null;
            $scope.branch = [];
            return;
        }

        if ($scope.branchState.loaded == node || $scope.branchState.loading == node) {
            return;
        }

        if(!$scope.arrangementUri || !$scope.UI.open) {
            return;
        }

        if($scope.checklist_scope.branchCache[node]) {
            $scope.branchState.loading = null;
            $scope.branchState.loaded = node;
            $scope.branch = $scope.checklist_scope.branchCache[node];
            return;
        }

        $scope.branchState.loading = node;
        $scope.branchState.loaded = true;
        $scope.branch = {};


        console.log("EXECUTING BRANCH FETCH");
        console.log("$scope.arrangementUri " + $scope.arrangementUri);
        console.log("node " + node);

        $http({
            method: 'GET',
            url: $rootScope.servicesUrl + "/TreeJsonView/nodeBranch",
            params: {arrangement: $scope.arrangementUri, node: node}
        })
            .then(
                function (response) {
                    console.log("GET BRANCH SUCCESS");

                    if (!$scope.json.node == node) {
                        // discard this load
                        return;
                    }
                    else {
                        $scope.branchState.loading = null;
                        $scope.branchState.loaded = node;
                        $scope.branch = response.data.result
                        $scope.checklist_scope.branchCache[node] = $scope.branch;
                    }
                },
                function (response) {
                    console.log("GET BRANCH FAIL");
                    console.log(response);
                    if (!$scope.json.node == node) {
                        // discard this load
                        return;
                    }
                    else {
                        $scope.branchState.loading = null;
                        putErrorOnPage($rootScope, response);
                    }
                });


    }

    $scope.$watch("UI.open", $scope.fetchBranch);
    $scope.$watch("json.node", function() {
        $scope.branchState = {loading: null, loaded: null};
        $scope.UI = $scope.checklist_scope.getNodeUI($scope.json.node);
        $scope.fetchBranch();
    });

}];

app.controller('Branch', BranchController);

var branchDirective = ['RecursionHelper', function (RecursionHelper) {
    return {
        templateUrl: pagesUrl + "/ng/checklist2/branch.html",
        controller: BranchController,
        scope: {
            arrangementUri: '@',
            json: '=',
            index: '=',
            node: '='
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

var InfoPaneController = ['$scope', '$rootScope', '$http', 'jsonCache', function ($scope, $rootScope, $http, jsonCache) {
    $scope.checklist_scope = $scope.$parent.checklist_scope;

    $scope.nodeUrisStatus = {fetching: false, fetched: false}
    $scope.nodeUris = null

    $scope.nodeJson = null
    $scope.nameJson = null
    $scope.instanceJson = null

    $scope.checklist_scope.activeTab = "syn"

    $scope.pagesUrl = pagesUrl;
    $scope.instanceEditorUrl = instanceEditorUrl;

    $scope.$watch("node", function () {
        if ($scope.node) {
            if ($scope.checklist_scope.nodeUriCache[$scope.node]) {
                $scope.nodeUrisStatus = {fetching: false, fetched: true}
                $scope.nodeUris = $scope.checklist_scope.nodeUriCache[$scope.node]
                $scope.nodeJson = jsonCache.needJson($scope.nodeUris.nodeUri)
                $scope.nameJson = jsonCache.needJson($scope.nodeUris.nameUri)
                $scope.instanceJson = jsonCache.needJson($scope.nodeUris.instanceUri)
            }
            else {
                $scope.nodeUrisStatus = {fetching: true, fetched: false}
                $scope.nodeUris = null

                $scope.nodeJson = null
                $scope.nameJson = null
                $scope.instanceJson = null

                $http({
                    method: 'GET',
                    url: $rootScope.servicesUrl + "/TreeJsonView/nodeUris",
                    params: {arrangement: $scope.arrangementUri, node: $scope.node}
                })
                    .then(
                        function (response) {
                            console.log("GET BRANCH URI SUCCESS");
                            $scope.nodeUrisStatus.fetching = false;
                            $scope.nodeUrisStatus.fetched = true;
                            $scope.nodeUris = response.data.result
                            $scope.checklist_scope.nodeUriCache[$scope.node] = $scope.nodeUris;
                            $scope.nodeJson = jsonCache.needJson($scope.nodeUris.nodeUri)
                            $scope.nameJson = jsonCache.needJson($scope.nodeUris.nameUri)
                            $scope.instanceJson = jsonCache.needJson($scope.nodeUris.instanceUri)
                        },
                        function (response) {
                            console.log("GET BRANCH URI FAIL");
                            console.log(response);
                            $scope.nodeUrisStatus.fetching = false;
                            putErrorOnPage($rootScope, response);
                        });
            }
        }
    });


}];

app.controller('InfoPane', InfoPaneController);

var infoPaneDirective = [function () {
    return {
        templateUrl: pagesUrl + "/ng/checklist2/infopane.html",
        controller: InfoPaneController,
        scope: {
            arrangementUri: '@',
            node: '@',
        }
    };
}];

app.directive('infoPane', infoPaneDirective);

