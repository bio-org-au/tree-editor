package tree.editor

class VerificationController {

    def index() {}

    def verify(UriParam u) {
        if (!u.validate()) {
            return render(view: '/validationerror', model: [bean: u])
        }

        [uri: u.uri]

    }
}
