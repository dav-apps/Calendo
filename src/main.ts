import { enableProdMode } from "@angular/core"
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic"
import { Environment } from "dav-js"

import { AppModule } from "./app/app.module"
import { environment } from "./environments/environment"

if (environment.environment == Environment.Production) {
	enableProdMode()
}

platformBrowserDynamic()
	.bootstrapModule(AppModule)
	.catch(err => console.log(err))
