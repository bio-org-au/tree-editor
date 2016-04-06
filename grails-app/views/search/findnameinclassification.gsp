<%@ page contentType="text/html;charset=UTF-8" %>
<html>
<head>
    <meta name="layout" content="pages"/>

    <asset:javascript src="search/findnameintree.js"/>

    <link rel="stylesheet" href="http://localhost:8080/services/assets/apni-format.css?compile=false"  />
    <link rel="stylesheet" href="http://localhost:8080/services/assets/sparql-search.css?compile=false"  />
    <link rel="stylesheet" href="http://localhost:8080/services/assets/themes/ui-lightness/jquery-ui-1.10.4.custom.css?compile=false"  />
    <link rel="stylesheet" href="http://localhost:8080/services/assets/application.css?compile=false"  />
</head>
<body>
<div data-uri="${uri}" data-type="P" findnameintree></div>
</body>
</html>