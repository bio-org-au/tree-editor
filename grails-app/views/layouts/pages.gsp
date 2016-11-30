<!DOCTYPE html>
<!--[if lt IE 7 ]> <html lang="en" class="no-js ie6"> <![endif]-->
<!--[if IE 7 ]>    <html lang="en" class="no-js ie7"> <![endif]-->
<!--[if IE 8 ]>    <html lang="en" class="no-js ie8"> <![endif]-->
<!--[if IE 9 ]>    <html lang="en" class="no-js ie9"> <![endif]-->
<!--[if (gt IE 9)|!(IE)]><!--> <html lang="en" class="no-js"><!--<![endif]-->
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title><g:layoutTitle default="NSL Tree Editor"/></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="${assetPath(src: 'favicon.ico')}" type="image/x-icon">
    <link rel="apple-touch-icon" href="${assetPath(src: 'apple-touch-icon.png')}">
    <link rel="apple-touch-icon" sizes="114x114" href="${assetPath(src: 'apple-touch-icon-retina.png')}">

    <!--
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
		<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">
-->
    <!--
    <link rel="stylesheet" href="/Users/ibis/Software/WebCache/bootstrap.min.css">
    <link rel="stylesheet" href="/Users/ibis/Software/WebCache/font-awesome.min.css">
-->

    <script type="application/javascript">
        var servicesUrl = "${grailsApplication.config.treeEditor.servicesUrl}";
        var pagesUrl = "${grailsApplication.config.treeEditor.pagesUrl}";
    </script>

    <asset:javascript src="jquery"/>
    <asset:javascript src="angular/angular"/>
    <asset:javascript src="angular/angular-sanitize"/>
    <asset:javascript src="angular/recursionhelper"/>
    <asset:javascript src="app.js"/>
    <asset:javascript src="utility/get-preferred-link"/>
    <asset:javascript src="utility/get-json-controller"/>
    <asset:javascript src="utility/get-uri-permissions"/>
    <asset:javascript src="loginlogout/loginlogout.js"/>
    <asset:javascript src="namespaces/namespaces.js"/>

    <asset:stylesheet src="pages.css"/>

    <g:layoutHead/>
</head>

<body ng-app="au.org.biodiversity.nsl.tree-edit-app" data-services-url="${grailsApplication.config.treeEditor.servicesUrl}" data-pages-url="${grailsApplication.config.treeEditor.pagesUrl}" ng-controller="appbody" >

<div class="container-fluid">
    <ul class="nav nav-pills" >
        <span class="pull-right" loginlogout></span>
        <li role="presentation" namespacesdropdown></li>
        <li role="presentation"><a href="${createLink(controller: 'Home', action: 'index')}">Home</a></li>
        <li role="presentation"><a href="${createLink(controller: 'Classifications', action: 'index')}">Classifications</a></li>
        <li role="presentation"><a href="${createLink(controller: 'Workspaces', action: 'index')}">Workspaces</a></li>
    </ul>

    <div ng-if="taxanodes_bookmarks.vec.length > 0" style="font-size: smaller;">
        <span ng-repeat="uri in taxanodes_bookmarks.vec track by $index">
            <a href="#" ng-click="clickBookmark(uri)"><span shortnodetext uri="{{uri}}"></span></a> <i
                class="fa fa-remove fabutton" ng-click="clickTrashBookmark(uri)"></i>
        </span>
        <a ng-if="taxanodes_bookmarks.vec.length > 1" href="#" ng-click="clickClearBookmarks()" class="btn btn-sm">clear
        {{taxanodes_bookmarks.vec.length}} bookmarks</a>
    </div>

    <div ng-if="msg && msg.msg" class="alert" ng-class="'alert-' + msg.status">
        <div nested-message usemessage="msg"></div>
    </div>
    <div ng-if="msg && msg[0]" ng-repeat="m in msg" class="alert" ng-class="'alert-' + m.status">
        <div nested-message usemessage="m"></div>
    </div>

    <g:layoutBody/>
</div>
</body>
</html>
