class UrlMappings {

    static excludes = ["/js/*",]

    static mappings = {
        "/$controller/$action?/$id?(.$format)?"{
            constraints {
                // apply constraints here
            }
        }

        "/(classification|workspaces|checklist|verification|search)"(controller: 'Home', action: "redir")

        "/"(controller: 'Home', action : "index")
        "500"(view:'/error')
	}
}
