package tree.editor

class VerificationController {

    def verify(NodeParam p) {
        if (!p.validate()) {
            return render(view: '/validationerror', model: [bean: p])
        }
    }

    def changes(NodeParam p) {
        if (!p.validate()) {
            return render(view: '/validationerror', model: [bean: p])
        }
    }
}
