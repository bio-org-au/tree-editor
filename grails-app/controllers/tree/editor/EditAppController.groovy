package tree.editor

import grails.converters.JSON

/**
 * This controller holds the user state.
 */

class EditAppController {

    def index() { }

    def info() {
        def j =  [ footer: 'a footer' ]
        render j as JSON
    }

    // we keep bookmarks in the session

    def retrieveFavourites() {
        def j = [ favourites: session['EditAppController.favourites'] ?: [] ]
        render j as JSON
    }

    def topNode() {
        def j = [ topNode: session['EditAppController.topNode'] ?: null ]
        render j as JSON
    }

    def saveFavourites() {
    }
}
