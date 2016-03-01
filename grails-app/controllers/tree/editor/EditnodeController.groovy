package tree.editor

import grails.validation.Validateable

class EditnodeController {
    def checklist(NodeChecklistParam p) {
        if(!p.validate()) {
            return render (view: '/validationerror', model: [ bean: p])
        }

        render view: 'checklist', model: [ arrangement: p.arrangement, node: p.node]
    }
}

@Validateable
class NodeChecklistParam {
    String arrangement
    String node

    static constraints = {
        arrangement  blank: false
        node  blank: false
    }
}
