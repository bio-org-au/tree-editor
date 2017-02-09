package tree.editor

class WorkspacesController {
    def index() {}

    def edit() {}

    def checklist(TreeParam p) {
        if(!p.validate()) {
            return render (view: '/validationerror', model: [ bean: p])
        }

        redirect controller: "Checklist2", action: "checklist", params: [tree: p.tree]
    }
}
