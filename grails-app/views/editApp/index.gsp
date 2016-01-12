<%--
  Created by IntelliJ IDEA.
  User: ibis
  Date: 12/01/2016
  Time: 6:07 PM
--%>

<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <title>Tree Edit App</title>
    <asset:stylesheet src="tree-edit-app.css"/>
    <asset:javascript src="angular.js"/>
    <asset:javascript src="tree-edit-app.js"/>
</head>

<body>
<div
        ng-app="au.org.biodiversity.nsl.tree-edit-app"
        id="tree-edit-app-container"
        app
        data-services-url="http://localhost:8080/services"
/>
</body>
</html>