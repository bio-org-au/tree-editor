<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="pages"/>
    <g:javascript src="ng/workspaces/workspace.js"/>
</head>

<body>
<h1>${!params['uri'] ? 'New' : 'Edit'} Workspace</h1>

<div workspaceform uri="${params['uri']}"></div>

<a class="pull-right" href="index">Back</a>

</body>
</html>