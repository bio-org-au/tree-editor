package tree.editor

class ChecklistController {
    def checklist(ChecklistParam p) {
        if (!p.validate()) {
            return render(view: '/validationerror', model: [bean: p])
        }
    }
}
