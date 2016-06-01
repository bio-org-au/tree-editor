/***********************************
 * get-preferred-link.js
 */

console.log("loading get-preferred-link.js")


function getPreferredLink(linkedThing) {
    if (!linkedThing || !linkedThing._links) {
        // we dont set _uri unless this object is a thing with _links
        return null;
    }

    // see if we have already done this stuff

    if(linkedThing._uri) {
        return linkedThing._uri;
    }

    if(linkedThing._hasNoPermalink) {
        return null;
    }

    if(linkedThing._links.permalink) {
        if (linkedThing._links.permalink.link) {
            linkedThing._uri = linkedThing._links.permalink.link;
        }
    }

    if(!linkedThing._uri) {
        for (i in linkedThing._links.permalinks) {
            if (linkedThing._links.permalinks[i].preferred && linkedThing._links.permalinks[i].link) {
                linkedThing._uri = linkedThing._links.permalinks[i].link;
                break;
            }
        }
    }

    if(!linkedThing._uri) {
        for (i in linkedThing._links.permalinks) {
            if (linkedThing._links.permalinks[i].link) {
                linkedThing._uri = _links.permalinks[i].link;
                break;
            }
        }
    }

    linkedThing._hasNoPermalink = !linkedThing._uri;

    return linkedThing._uri;
}
