package tree.editor

import grails.validation.Validateable

@Validateable
class UriParam {
    String uri

    static constraints = {
        uri  blank: false
    }
}


@Validateable
class NodeInTreeParam {
    String uri

    static constraints = {
        uri  blank: false
    }
}
