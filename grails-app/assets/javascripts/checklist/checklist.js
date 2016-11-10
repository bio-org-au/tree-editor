/***********************************
 * checklist.js
 */

console.log("loading checklist.js")

// a checklist holds a context and a focus. it displays a breadcrumb trail and the tree

// it is initialised with a uri and a 'workspace or classsification' setting.
// if it is initialised with a classigiction, it navigates to the root node.
// if it is initialised with a workspace, it goes to the workspaceRoot.

function dragUriStart(ev) {
    var s = $(ev.target).scope();
    ev.dataTransfer.setData("text/uri-list", s.getDragUriList().join('\n'));
}


function dragUriEnd(ev) {
}

function dragCitedStart(ev) {
    ev.dataTransfer.setData("text/uri-list", $(ev.target).data('uri'));
    ev.dataTransfer.setData("text/tree-editor-drag", 'citing');
}

function dragCitedEnd(ev) {
}

function dragCitationStart(ev) {
    ev.dataTransfer.setData("text/uri-list", $(ev.target).data('uri'));
    ev.dataTransfer.setData("text/tree-editor-drag", 'cited');
}

function dragCitationEnd(ev) {
}


function dropUriOver(ev) {
    if (!ev.dataTransfer.types.contains("text/uri-list")) return;

    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
}

var currentDropTarget = null;

function dropUriEnter(ev) {
    if (!ev.dataTransfer.types.contains("text/uri-list")) return;

    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';

    var z = $(ev.target).closest('.droppable-uri');
    if (currentDropTarget && z != currentDropTarget) {
        currentDropTarget.removeClass('dragover');
        currentDropTarget = null;
    }

    currentDropTarget = z;
    currentDropTarget.addClass('dragover');
}

function dropUriLeave(ev) {
    var z = $(ev.target).closest('.droppable-uri');
    if (currentDropTarget && z == currentDropTarget) {
        z.removeClass('dragover');
        currentDropTarget = null;
    }
}


function dropUri(ev) {
    if (!ev.dataTransfer.types.contains("text/uri-list")) return;
    ev.preventDefault();

    if (currentDropTarget) {
        currentDropTarget.removeClass('dragover');
        currentDropTarget = null;
    }

    var uriList;
    try {
        uriList = ev.dataTransfer.getData("text/uri-list").split('\n');
    }
    catch (e) {
        alert(e);
        throw e;
    }

    var extradata = ev.dataTransfer.getData("text/tree-editor-drag");

    var scope;
    for (scope = $(ev.target).closest('.ng-scope').scope(); scope && !scope.dropUriList; scope = scope.$parent) {
    }
    if (!scope) return;
    // have to use timeout to get out of the apply loop
    window.setTimeout(function () {
        scope.$apply(function () {
            scope.dropUriList(uriList, extradata);
        });
    }, 0);
}

/*
 And angular object with a serverside opertaion session is a thing that can ask the 
 server to do a thing, and handle replies from the server asking for more information.

 This method uses a scope variable named 'serversideState'. It contains
 - 'url'
 - 'params'
 - an 'inProgress' flag

 The reply from the server will be a json object containing 
 - a 'success' boolean
 - a 'msg' message
 - a 'chooseAction' array
 - a focusPath
 - an array of refetch paths

 On receiving the reply, 

 */


function CanAcceptDrops($scope, $rootScope, $http, jsonCache) {
    $scope.clearServersideOperationState = function () {
        $scope.serversideOperationState = {
            open: false,
            inProgress: false,
            msg: null,
            confirm: null,
            chooseAction: null,
            params: {}
        };
    };

    $scope.clickRemove = function () {
        if ($scope.serversideOperationState.open) return; // we have another operation in progress
        $scope.clearServersideOperationState();
        $scope.serversideOperationState.open = true;
        $scope.serversideOperationState.action = 'removeNode';
        $scope.sendServersideOperation();
    };

    $scope.clickCheckin = function () {
        window.open($rootScope.pagesUrl + "/workspaces/checkinVerify?uri=" + $scope.getTargetUri());
    };


    $scope.nodeTypeDropdown = false;
    $scope.toggleNodeTypeDropdown = function () {
        $scope.nodeTypeDropdown = !$scope.nodeTypeDropdown;
    };
    $scope.closeNodeTypeDropdown = function () {
        $scope.nodeTypeDropdown = false;
    };
    $scope.clickNodeType = function (nsPart, idPart) {
        if ($scope.serversideOperationState.open) return; // we have another operation in progress
        $scope.clearServersideOperationState();
        $scope.serversideOperationState.open = true;
        $scope.serversideOperationState.action = 'setNodeType';
        $scope.serversideOperationState.params.nsPart = nsPart;
        $scope.serversideOperationState.params.idPart = idPart;
        $scope.sendServersideOperation();
    };

    $scope.clickRevert = function () {
        if ($scope.serversideOperationState.open) return; // we have another operation in progress
        $scope.clearServersideOperationState();
        $scope.serversideOperationState.open = true;
        $scope.serversideOperationState.action = 'revertNode';
        $scope.sendServersideOperation();
    };

    $scope.dropUriList = function (uriList, extradata) {
        if ($scope.serversideOperationState.open) return; // we have another operation in progress
        $scope.clearServersideOperationState();
        $scope.serversideOperationState.open = true;
        $scope.serversideOperationState.action = 'dropUrisOntoNode';
        $scope.serversideOperationState.params.uris = uriList;
        $scope.serversideOperationState.params.relationshipType = extradata;
        $scope.sendServersideOperation();
    };

    $scope.sendServersideOperation = function () {

        if(!$scope.isTargetEditable()) return; // meh

        if ($scope.serversideOperationState.inProgress) return; // we have another drop in progress

        $scope.serversideOperationState.inProgress = true;

        $scope.serversideOperationState.params.wsNode = $scope.cl_scope.rootUri;
        $scope.serversideOperationState.params.focus = $scope.cl_scope.focusUri;
        $scope.serversideOperationState.params.target = $scope.getTargetUri();
        $scope.serversideOperationState.params.linkSuper = $scope.getTargetLinkSuper();
        $scope.serversideOperationState.params.linkSeq = $scope.getTargetLinkSeq();

        for (c in $scope.serversideOperationState.moreInfoNeeded) {
            var cc = $scope.serversideOperationState.moreInfoNeeded[c];
            $scope.serversideOperationState.params[cc.name] = cc.selected;
        }

        $scope.serversideOperationState.msg = null;

        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonEdit/' + $scope.serversideOperationState.action,
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            data: $scope.serversideOperationState.params
        }).then(function successCallback(response) {
            $scope.serversideOperationState.inProgress = false;

            if (response.data.success) {
                $rootScope.msg = response.data.msg;
                $scope.serversideOperationState.open = false;

                if (response.data.focusPath) {
                    $scope.cl_scope.path = response.data.focusPath;
                    $scope.cl_scope.focusUri = response.data.focusPath[response.data.focusPath.length - 1];

                    $scope.cl_scope.focus = jsonCache.needJson($scope.cl_scope.focusUri);

                    for (p in response.data.focusPath) {
                        $scope.cl_scope.focus = jsonCache.refetchJson(response.data.focusPath[p]);
                    }
                }

                for (p in response.data.refetch) {
                    for (pp in response.data.refetch[p]) {
                        jsonCache.refetchJson(response.data.refetch[p][pp]);
                        $scope.cl_scope.getNodeUI(response.data.refetch[p][pp]).open = true;
                    }
                }

            }
            else {
                $scope.serversideOperationState.chooseAction = response.data.chooseAction;
                $scope.serversideOperationState.moreInfoNeeded = response.data.moreInfoNeeded;
                $scope.serversideOperationState.msg = response.data.msg;
            }

        }, function errorCallback(response) {
            $scope.serversideOperationState.inProgress = false;
            $scope.serversideOperationState.open = false;

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
        });
    };

    $scope.clearServersideOperationState();

}

var ChecklistController = ['$scope', '$rootScope', '$http', 'jsonCache', function ($scope, $rootScope, $http, jsonCache) {
    $scope.foo = "I AM A CHECKLIST!";
    $scope.cl_scope = $scope;
    $scope.ni_scope = $scope;

    $scope.showUntreatedNames = false;

    $scope.rootPermissions = {};

    $scope.focusPermissions = {};

    $scope.refreshPermissions = function () {
        $scope.rootPermissions = {};
        get_uri_permissions($rootScope, $http, $scope.rootUri, function (data, success) {
            if (success)
                $scope.rootPermissions = data;
        });
        $scope.focusPermissions = {};
        get_uri_permissions($rootScope, $http, $scope.focusUri, function (data, success) {
            if (success)
                $scope.focusPermissions = data;
        });
    };

    $scope.getRootUri = function () {
        return "I AM A ROOT URI";
    };
    $scope.getFocusUri = function () {
        return $scope.getFocusUri;
    };

    $scope.$watch('rootUri', $scope.refreshPermissions);

    $scope.$watch('focusUri', $scope.refreshPermissions);

    $scope.$watch('focusUri', function () {
        $scope.UI = $scope.getNodeUI($scope.focusUri)
    });

    $rootScope.$on('nsl-tree-editor.loginlogout', $scope.refreshPermissions);

    $scope.arrangement = null;
    $scope.nodeUI = {}; // this is where I remember which nodes are open, etc
    $scope.path = [];

    $scope.getNodeUI = function (uri) {
        if (!$scope.nodeUI[uri]) {
            $scope.nodeUI[uri] = {open: false};
        }
        return $scope.nodeUI[uri];
    };

    $scope.clickPath = function (i) {
        $scope.focusUri = $scope.path[i];
        $scope.focus = jsonCache.needJson($scope.focusUri);
        $scope.path = $scope.path.slice(0, i + 1);
    };

    $scope.clickPathAddBookmark = function (i) {
        $rootScope.addBookmark('taxa-nodes', $scope.path[i]);
    };

    $scope.clickAddBookmark = function () {
        $rootScope.addBookmark('taxa-nodes', $scope.focusUri);
    };

    $scope.clickPathNewWindow = function (i) {
        window.open($rootScope.pagesUrl + "/checklist/checklist?root=" + $scope.rootUri + "&focus=" + $scope.path[i], '_blank');
    };

    $scope.clickSubPath = function (a) {
        if (a.length < 1) return; // this never happens
        for (u in a) {
            $scope.path.push(a[u]);
        }
        $scope.focusUri = a[a.length - 1];
        $scope.focus = jsonCache.needJson($scope.focusUri);
    };

    $scope.clickToggleApniFormat = function () {
        $scope.UI.showApniFormat = !$scope.UI.showApniFormat;
    };

    // ok. deal with initialisation.

    $scope.arrangement = jsonCache.needJson($scope.arrangementUri);
    $scope.root = jsonCache.needJson($scope.rootUri);
    $scope.focus = jsonCache.needJson($scope.focusUri);
    $scope.decidedOnPath = false;

    var deregisterInitializationListener = [];

    function initializationListener(oldvalue, newvalue) {
        var madeAChange;
        do {
            madeAChange = false;

            // set the arrangement to the root arrangement if we can and need to

            if (!$scope.arrangementUri && $scope.rootUri && $scope.root.fetched) {
                $scope.arrangementUri = getPreferredLink($scope.root.arrangement);
                $scope.arrangement = jsonCache.needJson($scope.arrangementUri);
                madeAChange = true;
            }

            // set the arrangement to the focus is we can and need to

            if (!$scope.arrangementUri && $scope.focusUri && $scope.focus.fetched) {
                $scope.arrangementUri = getPreferredLink($scope.focus.arrangement);
                $scope.arrangement = jsonCache.needJson($scope.arrangementUri);
                madeAChange = true;
            }

            // get the root off the arrangement if we can and need to

            if (!$scope.rootUri && $scope.arrangementUri && $scope.arrangement.fetched) {
                // use the currentroot if the arrangement has one. That is: never work
                // with the moving persistent node at the top of classification trees.
                $scope.rootUri = getPreferredLink($scope.arrangement.currentRoot);
                if (!$scope.rootUri) $scope.rootUri = getPreferredLink($scope.arrangement.node);
                $scope.root = jsonCache.needJson($scope.rootUri);
                madeAChange = true;
                return;
            }

            // set the focus to the root, if we can and need to
            if (!$scope.focusUri && $scope.rootUri) {
                $scope.focusUri = $scope.rootUri;
                $scope.focus = jsonCache.needJson($scope.focusUri);
                madeAChange = true;
            }
        }
        while (madeAChange);


        // if we have a root and a focus, set up the path

        if (!$scope.decidedOnPath && $scope.rootUri && $scope.focusUri) {
            $scope.decidedOnPath = true;

            if ($scope.focusUri == $scope.rootUri) {
                $scope.path = [$scope.rootUri];
            }
            else {
                $http({
                    method: 'GET',
                    url: $rootScope.servicesUrl + '/TreeJsonView/findPath',
                    params: {
                        root: $scope.rootUri,
                        focus: $scope.focusUri
                    }
                }).then(function successCallback(response) {
                    $scope.path = response.data;

                    if ($scope.path.length == 0) {
                        // no path from the root to the focus. just use the focus as the root.
                        $scope.rootUri = $scope.focusUri;
                        $scope.path = [$scope.rootUri];
                    }
                    else {
                        for (var i in $scope.path) {
                            jsonCache.needJson($scope.path[i]);
                            $scope.getNodeUI($scope.path[i]).open = true;
                        }
                    }
                }, function errorCallback(response) {
                    $scope.rootUri = $scope.focusUri;
                    $scope.path = [$scope.focusUri];
                });

            }
        }

        if ($scope.arrangementUri && $scope.arrangement.fetched && $scope.rootUri && $scope.root.fetched && $scope.focusUri && $scope.focus.fetched) {
            for (var i in deregisterInitializationListener) {
                deregisterInitializationListener[i]();
            }
        }

    }

    deregisterInitializationListener.push($scope.$watch("arrangementUri", initializationListener));
    deregisterInitializationListener.push($scope.$watch("arrangement.fetched", initializationListener));
    deregisterInitializationListener.push($scope.$watch("rootUri", initializationListener));
    deregisterInitializationListener.push($scope.$watch("root.fetched", initializationListener));
    deregisterInitializationListener.push($scope.$watch("focusUri", initializationListener));
    deregisterInitializationListener.push($scope.$watch("focus.fetched", initializationListener));

    $scope.getDragUriList = function () {
        return [$scope.focusUri];
    };

    $scope.isTargetEditable = function () {
        return true &&
            $scope.cl_scope  && $scope.cl_scope.rootPermissions && $scope.cl_scope.rootPermissions.uriPermissions &&
            $scope.cl_scope.rootPermissions.uriPermissions.canEdit &&
            $scope.cl_scope.rootPermissions.uriPermissions.isWorkspace &&
            $scope.focus && $scope.focus.type=='T';
    };


    $scope.getTargetUri = function () {
        return $scope.focusUri;
    };

    $scope.getTargetLinkSuper = function () {
        return null;
    };

    $scope.getTargetLinkSeq = function () {
        return null;
    };

    $scope.clickShowSynonyms = function () {
        $scope.$broadcast('tree-editor.show-synonyms', !$scope.UI.showSynonyms);
    };

    $scope.$on('tree-editor.show-synonyms', function (evt, show) {
        $scope.UI.showSynonyms = show;
    });

    CanAcceptDrops($scope, $rootScope, $http, jsonCache);

    console.log("setting quicksearch");

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

        var targetUri = $scope.quicksearch.results[i].node;

        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonView/findPath',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            data: {
                root: $scope.cl_scope.rootUri,
                focus: targetUri
            }
        }).then(function successCallback(response) {
            console.log(response);

            for(i in response.data) {
                var node = jsonCache.needJson(response.data[i])
                $scope.getNodeUI(response.data[i]).open = true;
            }

            $scope.path = response.data;
            $scope.focusUri = targetUri;
            $scope.focus = jsonCache.needJson(targetUri);


        }, function errorCallback(response) {
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
        });

    };

    $scope.quicksearch.onclickDropdownbutton = function() {
        if($scope.quicksearch.hasResults) {
            $scope.quicksearch.open = !$scope.quicksearch.open;
        }
    }

    $scope.doSearch = function(myText, mySerial) {
        $rootScope.msg = null;

        $scope.quicksearch.inProgress = mySerial;
        $scope.quicksearch.open = false;
        $scope.quicksearch.hasResults = false;
        $scope.quicksearch.results = [];
        $scope.quicksearch.hasMore = false;
        $scope.quicksearch.noMatches = false;

        $http({
            method: 'POST',
            url: $rootScope.servicesUrl + '/TreeJsonView/searchNamesDirectlyInSubtree',
            headers: {
                'Access-Control-Request-Headers': 'Authorization',
                'Authorization': 'JWT ' + $rootScope.getJwt()
            },
            data: {
                searchSubtree: $scope.focusUri,
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
        templateUrl: pagesUrl + "/assets/ng/checklist/checklist.html",
        controller: ChecklistController,
        scope: {
            arrangementUri: "@",
            rootUri: "@",
            focusUri: "@"
        }
    };
}];

app.directive('checklist', checklistDirective);

var NodelistController = ['$scope', '$rootScope', '$http', 'jsonCache', function ($scope, $rootScope, $http, jsonCache) {
    $scope.cl_scope = $scope.$parent.cl_scope;
    $scope.ni_scope = $scope.$parent.ni_scope;
    inheritJsonController($scope, jsonCache);

    $scope.getRootUri = function () {
        return "I am a root uri!"
    };
    $scope.getFocusUri = function () {
        $scope.$parent.getFocusUri();
    };

    $scope.clickSubPath = function (a) {
        $scope.$parent.clickSubPath(a);
    }

}];

app.controller('Nodelist', NodelistController);

var nodelistDirective = ['RecursionHelper', function (RecursionHelper) {
    return {
        templateUrl: pagesUrl + "/assets/ng/checklist/nodelist.html",
        controller: NodelistController,
        scope: {
            uri: "@"
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

app.directive('nodelist', nodelistDirective);

var NodeitemController = ['$scope', '$rootScope', '$http', 'jsonCache', function ($scope, $rootScope, $http, jsonCache) {
    $scope.cl_scope = $scope.$parent.cl_scope;
    $scope.parent_ni_scope = $scope.$parent.ni_scope;
    $scope.ni_scope = $scope;

    $scope.afterUpdateJson = function () {
        if ($scope.json && $scope.json.fetched) {
            $scope.hasSubnodes = $scope.json.subnodes && $scope.json.subnodes.length > 0;
        }
        else {
            $scope.hasSubnodes = false;
        }
    };

    inheritJsonController($scope, jsonCache);

    $scope.getRootUri = function () {
        "I, also, am a root uri!"
    };
    $scope.getFocusUri = function () {
        $scope.$parent.getFocusUri();
    };

    $scope.node = jsonCache.needJson($scope.uri);

    $scope.UI = $scope.cl_scope.getNodeUI($scope.uri);

    $scope.rootUri = $scope.$parent.rootUri;
    $scope.focusUri = $scope.$parent.focusUri;


    CanAcceptDrops($scope, $rootScope, $http, jsonCache);

    $scope.getDragUriList = function () {
        return [$scope.uri];
    };

    $scope.isTargetEditable = function () {
        return true &&
            $scope.cl_scope && $scope.cl_scope.rootPermissions && $scope.cl_scope.rootPermissions.uriPermissions &&
            $scope.cl_scope.rootPermissions.uriPermissions.canEdit &&
            $scope.cl_scope.rootPermissions.uriPermissions.isWorkspace &&
            $scope.json && $scope.json.type=='T'
    };

    $scope.getTargetUri = function () {
        return $scope.uri;
    };

    $scope.getTargetLinkSuper = function () {
        return $scope.linkSuper;
    };

    $scope.getTargetLinkSeq = function () {
        return $scope.linkSeq;
    };

    $scope.clickAddBookmark = function () {
        $rootScope.addBookmark('taxa-nodes', $scope.uri);
    };

    $scope.clickUpArrow = function () {
        $scope.UI.open = true;
        $scope.clickSubPath([]);
    };

    $scope.clickSubPath = function (a) {
        a.unshift($scope.uri);
        $scope.$parent.clickSubPath(a);
    };

    $scope.clickNewWindow = function () {
        window.open($rootScope.pagesUrl + "/checklist/checklist?root=" + $scope.cl_scope.rootUri + "&focus=" + $scope.uri, '_blank');
    };

    $scope.clickShowSynonyms = function () {
        $scope.$broadcast('tree-editor.show-synonyms', !$scope.UI.showSynonyms);
    };

    $scope.$on('tree-editor.show-synonyms', function (evt, show) {
        $scope.UI.showSynonyms = show;
    });

    $scope.UI.showSynonyms = $scope.parent_ni_scope.UI.showSynonyms;

    $scope.clickToggleApniFormat = function () {
        $scope.UI.showApniFormat = !$scope.UI.showApniFormat;
    };

    var deregisterInitializationListener = [];

    function initializationListener() {
        if ($scope.json.fetched && $scope.json.instance && $scope.json.instance._uri && !$scope.instanceJson) {
            if ($scope.json.instance._uri) {
                $scope.instanceJson = jsonCache.needJson($scope.json.instance._uri);
            }
        }

        if ($scope.instanceJson && $scope.instanceJson.fetched) {
            $scope.hasSynonyms = ($scope.instanceJson.instancesForCitedBy && $scope.instanceJson.instancesForCitedBy.length > 0) ||
                ($scope.instanceJson.instancesForCites && $scope.instanceJson.instancesForCites.length > 0);
        }

        if ($scope.json && $scope.json.fetched && (!$scope.instanceJson || $scope.instanceJson.fetched)) {
            for (var i in deregisterInitializationListener) {
                deregisterInitializationListener[i]();
            }
        }
    }

    deregisterInitializationListener.push($scope.$watch("json.fetched", initializationListener));
    deregisterInitializationListener.push($scope.$watch("instanceJson.fetched", initializationListener));

    initializationListener();

}];

app.controller('Nodeitem', NodeitemController);

var nodeitemDirective = [function () {
    return {
        templateUrl: pagesUrl + "/assets/ng/checklist/nodeitem.html",
        controller: NodeitemController,
        scope: {
            linkSuper: "@",
            linkSeq: "@",
            uri: "@"
        }
    };
}];

app.directive('nodeitem', nodeitemDirective);

var droptargetDirective = [function () {
    return {
        templateUrl: pagesUrl + "/assets/ng/checklist/droptarget.html"
    };
}];

app.directive('droptarget', droptargetDirective);

var NodesynonymlistController = ['$scope', '$rootScope', '$http', 'jsonCache', function ($scope, $rootScope, $http, jsonCache) {
    $scope.cl_scope = $scope.$parent.cl_scope;
    inheritJsonController($scope, jsonCache);

}];

app.controller('NodeSynonymList', NodesynonymlistController);

var nodeSynonymListDirective = [function () {
    return {
        templateUrl: pagesUrl + "/assets/ng/checklist/nodesynonymlist.html",
        controller: NodesynonymlistController,
        scope: {
            uri: "@"
        }
    };
}];

app.directive('nodeSynonymList', nodeSynonymListDirective);

var ApniFormatBlockController = ['$scope', '$rootScope', '$http', 'jsonCache', function ($scope, $rootScope, $http, jsonCache) {
    $scope.cl_scope = $scope.$parent.cl_scope;
    inheritJsonController($scope, jsonCache);
}];

app.controller('ApniFormatBlock', ApniFormatBlockController);

var apniFormatBlockDirective = ['$rootScope', function ($rootScope) {
    return {
        templateUrl: pagesUrl + "/assets/ng/checklist/apniformatblock.html",
        controller: ApniFormatBlockController,
        scope: {
            uri: "@"
        },
        link: function (scope, element, attrs, controller, transcludeFn) {
            var uriBits = scope.uri.split('/');
            $(element).find('.apni-format-block').load($rootScope.servicesUrl + '/' + uriBits.slice(uriBits.length - 3).join('/') + '/api/apni-format?embed=true');
        }
    };
}];

app.directive('apniFormatBlock', apniFormatBlockDirective);

