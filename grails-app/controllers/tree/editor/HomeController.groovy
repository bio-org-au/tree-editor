package tree.editor

import org.codehaus.groovy.grails.web.util.WebUtils

class HomeController {

    def index() {
        log.debug params
    }

    def redir() {
        String requested = (WebUtils.getForwardURI(request) ?: request.getAttribute('javax.servlet.error.request_uri'))
        requested = requested.decodeURL() - "/tree-editor/"
        if(request.queryString) {
            requested += "?${request.queryString}"
        }
        log.debug "redirecting to #!$requested"
        redirect(url: "#!$requested")
    }
}
