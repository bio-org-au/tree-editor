package tree.editor

/*
 * The goal here is to have a consistent set of parameters.
 *
 * Can I also just say as an aside how deeply I regret the whole "arrangement" thing.
 */

import grails.validation.Validateable


@Validateable
class NodeParam {
    String tree
    String focus

    static constraints = {
        tree  blank: false
        focus  blank: false
    }
}

@Validateable
class NodeidInTreeParam {
    String tree
    Long node

    static constraints = {
        tree  blank: false
        node  nullable: true
    }
}

/*
    A checklist may be entered at a point defined by a node URI
    or a point defined by a node id.
*/
@Validateable
class ChecklistParam {
    String tree
    String focus
    Long node

    static constraints = {
        tree  blank: false
        focus  nullable: true
        node  nullable: true
    }
}

@Validateable
class TreeParam {
    String tree

    static constraints = {
        tree  blank: false
    }
}

