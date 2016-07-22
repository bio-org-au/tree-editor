package tree.editor

import grails.validation.Validateable

class SearchController {

    def index(SearchParam param) {
        [ rootUri: param.root, focusUri: param.focus, treeUri: param.tree]
    }
}


@Validateable
class SearchParam {
    String root
    String focus
    String tree

    static constraints = {
        root nullable: true
        focus nullable: true
        tree nullable: true
    }
}
