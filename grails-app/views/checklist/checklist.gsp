<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="pages"/>
    <g:javascript src="ng/checklist/checklist.js"/>
    <asset:stylesheet src="checklist.css"/>
</head>

<body>
<div data-arrangement-uri="${params.tree}" data-node="${params.node}" data-focus-uri="${params.focus}" checklist></div>
</body>
</html>