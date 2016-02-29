package tree.editor

class ClassificationsController {

    def index() {}

    def checklist(UriParam u) {
        if(!u.validate()) {
            return render (view: '/validationerror', model: [ bean: u])
        }

        render view: 'checklist', model: [ uri: u.uri]

    }
}
