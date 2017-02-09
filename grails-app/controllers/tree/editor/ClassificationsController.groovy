package tree.editor

class ClassificationsController {

    def index() {}

    def checklist(TreeParam p) {
        if(!p.validate()) {
            return render (view: '/validationerror', model: [ bean: p])
        }

        redirect controller: "Checklist2", action: "checklist", params: [tree: p.tree]

    }
}
