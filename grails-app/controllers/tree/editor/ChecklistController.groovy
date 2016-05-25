package tree.editor

import grails.validation.Validateable

/**
 * Created by ibis on 25/05/2016.
 */
class ChecklistController {
    def checklist(NodeChecklistParam p) {
        if (!p.validate()) {
            return render(view: '/validationerror', model: [bean: p])
        }

        render view: 'checklist', model: [rootUri: p.root, focusUri: p.focus]
    }

    def newWorkspaceFromChecklist() {
        redirect controller: 'Workspaces', action: 'edit', params: [withTopNode: params['focusUri']]
    }
}

@Validateable
class NodeChecklistParam {
    String root
    String focus

    static constraints = {
        root nullable: true
        focus nullable: true
    }
}
