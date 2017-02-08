package tree.editor

import grails.validation.Validateable

class Checklist2Controller {
    def checklist(Checklist2Param p) {
        if (!p.validate()) {
            return render(view: '/validationerror', model: [bean: p])
        }

        render view: 'checklist', model: [arrangementUri: p.tree, node: p.node]
    }
}

@Validateable
class Checklist2Param {
    String tree
    Long node

    static constraints = {
        tree nullable: false
        node nullable: true
    }
}