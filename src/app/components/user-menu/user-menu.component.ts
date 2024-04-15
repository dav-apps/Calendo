import { Component } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { faUserCircle } from "@fortawesome/free-solid-svg-icons"
import { Dav } from "dav-js"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "calendo-user-menu",
	templateUrl: "./user-menu.component.html"
})
export class UserMenuComponent {
	locale = this.localizationService.locale.userMenu
	faUserCircle = faUserCircle

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		private activatedRoute: ActivatedRoute
	) {
		this.activatedRoute.queryParams.subscribe(async params => {
			if (params["accessToken"]) {
				// Login with the access token
				await Dav.Login(params["accessToken"])
				window.location.href = "/"
			}
		})
	}
}
