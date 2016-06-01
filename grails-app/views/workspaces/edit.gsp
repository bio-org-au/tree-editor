<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="pages"/>
    <asset:javascript src="workspaces/workspace.js"/>
</head>

<body>
<h1>${!params['uri'] ? 'New' : 'Edit'} Workspace</h1>

<div workspaceform uri="${params['uri']}" with-top-node="${params['withTopNode']}"></div>

<a class="pull-right" href="index">Back</a>

</body>
</html>