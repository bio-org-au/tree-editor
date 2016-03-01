<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="pages"/>
    <asset:javascript src="checklist/checklist.js"/>
    <asset:stylesheet src="checklist.css"/>
</head>
<body>
<div data-list-type="Checklist" data-arrangement-uri="${arrangement}" data-focus-uri="${node}" checklist></div>
</body>
</html>