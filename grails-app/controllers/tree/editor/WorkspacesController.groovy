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

}
