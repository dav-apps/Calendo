import { Component } from "@angular/core"
import { enUS } from "../../../locales/locales"
import { ActivatedRoute } from "@angular/router"
import { Dav } from "dav-js"
import { DataService } from "../../services/data-service"
import { faUserCircle } from "@fortawesome/free-solid-svg-icons"

@Component({
	selector: "calendo-user-menu",
	templateUrl: "./user-menu.component.html"
})
export class UserMenuComponent {
	locale = enUS.userMenu
	faUserCircle = faUserCircle

	constructor(
		private activatedRoute: ActivatedRoute,
		public dataService: DataService
	) {
		this.locale = this.dataService.GetLocale().userMenu

		this.activatedRoute.queryParams.subscribe(async params => {
			if (params["accessToken"]) {
				// Login with the access token
				await Dav.Login(params["accessToken"])
				window.location.href = "/"
			}
		})
	}
}
