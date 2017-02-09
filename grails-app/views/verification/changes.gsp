<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="pages"/>
    <g:javascript src="ng/verification/changes.js"/>
</head>

<body>
<g:link controller="checklist2" action="checklist" params="${params}">Checklist</g:link>
<g:link action="verify" params="${params}">Verify</g:link>

<div changes uri="${params.focus}"/>

</div>
</body>
</html>
