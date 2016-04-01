package tree.editor

class WorkspacesController {

    def index() {}

    def edit() {}

    def checklist(UriParam u) {
        if(!u.validate()) {
            return render (view: '/validationerror', model: [ bean: u])
        }

        render view: 'checklist', model: [ uri: u.uri]

    }

    def newWorkspaceFromChecklist() {
        redirect controller: 'Workspaces', action: 'edit', params: [ withTopNode: params['focusUri']]
    }

    def findNameIn() {
        redirect controller: "Search", action: 'findNameInWorkspace', params: params
    }
}
