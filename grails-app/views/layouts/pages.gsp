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

  <script type="application/javascript">
      var servicesUrl = "${grailsApplication.config.treeEditor.servicesUrl}";
      var pagesUrl = "${grailsApplication.config.treeEditor.pagesUrl}";
      var instanceEditorUrl = "${grailsApplication.config.treeEditor.instanceEditorUrl}";
  </script>

  <base href="/tree-editor/">
  <asset:javascript src="jquery"/>
  <g:javascript src="ng/angular.js"/>
  <g:javascript src="ng/angular-route.js"/>
  <g:javascript src="ng/angular-sanitize.js"/>
  <g:javascript src="ng/recursionhelper.js"/>
  <g:javascript src="ng/app.js"/>
  <g:javascript src="ng/utility/get-preferred-link.js"/>
  <g:javascript src="ng/utility/get-json-controller.js"/>
  <g:javascript src="ng/utility/get-uri-permissions.js"/>
  <g:javascript src="ng/loginlogout/loginlogout.js"/>
  <g:javascript src="ng/classifications/classifications.js"/>
  <g:javascript src="ng/checklist/checklist.js"/>
  <g:javascript src="ng/apni/apni-format.js"/>

  <asset:stylesheet src="pages.css"/>
  <asset:stylesheet src="checklist.css"/>
  <asset:stylesheet src="apni-format.css"/>

  <g:layoutHead/>
</head>

<body ng-app="tree-edit-app"
      data-namespace="${grailsApplication.config.treeEditor.shard}"
      data-services-url="${grailsApplication.config.treeEditor.servicesUrl}"
      data-pages-url="${grailsApplication.config.treeEditor.pagesUrl}"
      ng-controller="appbody">

<div class="container-fluid">
  <ul class="nav nav-pills">
    <span class="pull-right" loginlogout></span>
    <li role="presentation"><a href="${createLink(controller: 'Home', action: 'index')}">Home</a></li>
    <li role="presentation"><a href="classification">Classifications</a></li>
    <li role="presentation"><a href="${createLink(controller: 'Workspaces', action: 'index')}">Workspaces</a></li>
    <li><a href="login">Login</a></li>
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


  <div ng-view></div>
  %{--<g:layoutBody/> --}%

</div>
%{--<div class="debug">--}%
  %{--<hr/>--}%
  %{--<pre>$location.path() = {{$location.path()}}</pre>--}%
  %{--<pre>$route.current.templateUrl = {{$route.current.templateUrl}}</pre>--}%
  %{--<pre>$route.current.params = {{$route.current.params}}</pre>--}%
  %{--<pre>$route.current.scope.name = {{$route.current.scope.name}}</pre>--}%
  %{--<pre>$routeParams = {{$routeParams}}</pre>--}%
%{--</div>--}%
</body>
</html>
