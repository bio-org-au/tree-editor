<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <title>Tree Edit App</title>

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
    <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css">

    <asset:stylesheet src="application.css"/>
    <asset:stylesheet src="tree-edit-app.css"/>

    <asset:javascript src="application.js"/>
    <asset:javascript src="tree-edit-app.js"/>
</head>

<body ng-app="au.org.biodiversity.nsl.tree-edit-app">
<div
        id="tree-edit-app-container"
        app
        data-services-url="http://localhost:8080/services"
        class="container-fluid"
/>
</body>
</html>