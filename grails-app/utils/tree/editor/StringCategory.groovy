package tree.editor

/**
 * User: pmcneil
 * Date: 16/05/17
 *
 */
class StringCategory {

    static String removeTrailing(String target, String tail) {
        if(target.endsWith(tail)) {
            return target.substring(0, (target.length() - tail.length()))
        } else {
            return target
        }
    }

}
