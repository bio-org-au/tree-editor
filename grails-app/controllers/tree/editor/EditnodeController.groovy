package tree.editor

import grails.validation.Validateable

class EditnodeController {
    def checklist(NodeChecklistParam p) {
        if(!p.validate()) {
            return render (view: '/validationerror', model: [ bean: p])
        }

        render view: 'checklist', model: [ rootUri: p.root, focusUri: p.focus]
    }

    def newWorkspaceFromChecklist() {
        redirect controller: 'Workspaces', action: 'edit', params: [ withTopNode: params['focusUri']]
    }

    def addRemoveNames(AddRemoveNamesParam p) {
        if(!p.validate()) {
            return render (view: '/validationerror', model: [ bean: p])
        }

        [ rootUri: p.root, focusUri: p.focus]
    }

    def searchNames(AddRemoveNamesParam p) {
        if(!p.validate()) {
            return render (view: '/validationerror', model: [ bean: p])
        }

        [ rootUri: p.root, focusUri: p.focus]
    }

    def searchEmbedded() {

    }

}

@Validateable
class NodeChecklistParam {
    String root
    String focus

    static constraints = {
        root  nullable: true
        focus  nullable: true
    }
}

@Validateable
class AddRemoveNamesParam {
    String root
    String focus

    static constraints = {
        root  nullable: false
        focus  nullable: false
    }
}


