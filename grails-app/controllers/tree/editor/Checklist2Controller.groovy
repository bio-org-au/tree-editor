package tree.editor

import grails.validation.Validateable

class Checklist2Controller {
    def checklist(Checklist2Param p) {
        if (!p.validate()) {
            return render(view: '/validationerror', model: [bean: p])
        }

        render view: 'checklist', model: [arrangementUri: p.arrangement, focusUri: p.focus]
    }
}

@Validateable
class Checklist2Param {
    String arrangement
    String focus

    static constraints = {
        arrangement nullable: false
        focus nullable: true
    }
}