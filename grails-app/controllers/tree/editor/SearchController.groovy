package tree.editor

class SearchController {
    def index(TreeParam p) {
        if (!p.validate()) {
            return render(view: '/validationerror', model: [bean: p])
        }
    }
}
