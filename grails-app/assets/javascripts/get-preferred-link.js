
function getPreferredLink(linkedThing) {
    if (!linkedThing) {
        return null;
    }
    if (!linkedThing._links) {
        return null;
    }

    if (linkedThing._links.permalink) {
        return linkedThing._links.permalink.link;
    }

    if (!linkedThing._links.permalinks) {
        return null;
    }

    if (linkedThing._links.permalinks.length == 0) {
        return null;
    }

    for (i in linkedThing._links.permalinks) {
        if (linkedThing._links.permalinks[i].preferred) {
            return linkedThing._links.permalinks[i].link;
        }
    }

    return linkedThing._links.permalinks[0].link;
}
