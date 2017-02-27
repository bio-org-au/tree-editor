<html>
<head>
  <meta name="layout" content="pages"/>
</head>

<body>
<h1>NSL Tree Editor</h1>

<g:if test="${!grailsApplication.config.treeEditor.shard}">
  <div class="alert alert-danger"
       role="alert"><b>Missing configuration item:</b> 'shard' is not specified in configuration.</div>
</g:if>
<g:if test="${!grailsApplication.config.treeEditor.servicesUrl}">
  <div class="alert alert-danger"
       role="alert"><b>Missing configuration item:</b> 'servicesUrl' is not specified in configuration.</div>
</g:if>
<g:if test="${!grailsApplication.config.treeEditor.pagesUrl}">
  <div class="alert alert-danger"
       role="alert"><b>Missing configuration item:</b> 'pagesUrl' is not specified in configuration.</div>
</g:if>
</body>
</html>
