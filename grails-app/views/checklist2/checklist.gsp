<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="pages"/>
    <g:javascript src="ng/checklist/checklist.js"/>
    <asset:stylesheet src="checklist.css"/>
</head>

<body>
<div data-list-type="Checklist" data-root-uri="${rootUri}" data-focus-uri="${focusUri}" checklist></div>
</body>
</html>