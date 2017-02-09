<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="pages"/>
    <g:javascript src="ng/verification/verify.js"/>
    <asset:stylesheet src="checkinverify.css"/>
</head>

<body>
<g:link controller="checklist2" action="checklist" params="${params}">Checklist</g:link>
<g:link action="changes" params="${params}">Change list</g:link>

<div verify uri="${params.focus}">

</div>
</body>
</html>
