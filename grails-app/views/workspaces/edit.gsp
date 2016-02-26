<%--
  Created by IntelliJ IDEA.
  User: ibis
  Date: 24/02/2016
  Time: 12:21 PM
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="pages"/>
    <asset:javascript src="workspaces/workspace.js"/>
</head>

<body>
<h1>${!params['uri'] ? 'New' : 'Edit'} Workspace</h1>

<div workspaceform uri="${params['uri']}"></div>

<a class="pull-right" href="index">Back</a>

</body>
</html>