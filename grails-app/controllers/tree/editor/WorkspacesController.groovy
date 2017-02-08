package tree.editor

class WorkspacesController {

    def index() {}

    def edit() {}

    def checklist(UriParam u) {
        if(!u.validate()) {
            return render (view: '/validationerror', model: [ bean: u])
        }

        redirect controller: "Checklist2", action: "checklist", params: [tree: u.uri]
    }

//    def newWorkspaceFromChecklist() {
//        redirect controller: 'Workspaces', action: 'edit', params: [ withTopNode: params['focusUri']]
//    }
//
//    def checkinVerify(UriParam u) {
//
//        if(!u.validate()) {
//            return render (view: '/validationerror', model: [ bean: u])
//        }
//
//        [ uri: u.uri]
//    }

}
