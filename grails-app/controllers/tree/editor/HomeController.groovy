package tree.editor

import org.codehaus.groovy.grails.web.util.WebUtils

class HomeController {

    def index() {
        log.debug params
        use(StringCategory) {
            String servicesUrl = grailsApplication.config.treeEditor.servicesUrl
            String pagesUrl = grailsApplication.config.treeEditor.pagesUrl
            String instanceEditorUrl = grailsApplication.config.treeEditor.instanceEditorUrl
            [servicesUrl      : servicesUrl.removeTrailing('/'),
             pagesUrl         : pagesUrl.removeTrailing('/'),
             instanceEditorUrl: instanceEditorUrl.removeTrailing('/')]
        }
    }

    def redir() {
        String requested = (WebUtils.getForwardURI(request) ?: request.getAttribute('javax.servlet.error.request_uri'))
        requested = requested.decodeURL() - "/tree-editor/"
        if (request.queryString) {
            requested += "?${request.queryString}"
        }
        log.debug "redirecting to #!$requested"
        redirect(url: "#!$requested")
    }
}
