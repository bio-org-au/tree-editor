package tree.editor

import grails.validation.Validateable

class EditnodeController {
    def checklist(NodeChecklistParam p) {
        if(!p.validate()) {
            return render (view: '/validationerror', model: [ bean: p])
        }

        render view: 'checklist', model: [ rootUri: p.root, focusUri: p.focus]
    }
}

@Validateable
class NodeChecklistParam {
    String root
    String focus

    static constraints = {
        focus  nullable: true
    }
}
