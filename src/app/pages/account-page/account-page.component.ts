import { Component, ViewChild, HostListener } from "@angular/core"
import { DataService } from "../../services/data-service"
import { enUS } from "../../../locales/locales"
import { environment } from "../../../environments/environment"
import { Dav } from "dav-js"
import { LogoutModalComponent } from "../../components/logout-modal/logout-modal.component"
import { faSync, faLock } from "@fortawesome/free-solid-svg-icons"

@Component({
	selector: "calendo-account-page",
	templateUrl: "./account-page.component.html"
})
export class AccountPageComponent {
	locale = enUS.accountPage
	faSync = faSync
	faLock = faLock
	@ViewChild(LogoutModalComponent)
	private logoutModalComponent: LogoutModalComponent
	width: number = window.innerWidth

	constructor(public dataService: DataService) {
		this.locale = this.dataService.GetLocale().accountPage
		this.dataService.HideWindowsBackButton()
	}

	@HostListener("window:resize")
	onResize() {
		this.width = window.innerWidth
	}

	ShowLoginPage() {
		Dav.ShowLoginPage(environment.apiKey, environment.baseUrl)
	}

	ShowSignupPage() {
		Dav.ShowSignupPage(environment.apiKey, environment.baseUrl)
	}

	ShowLogoutModal() {
		this.logoutModalComponent.Show()
	}

	Logout() {
		Dav.Logout().then(() => (window.location.href = "/account"))
	}

	bytesToGigabytes(bytes: number, rounding: number): string {
		if (bytes == 0) return "0"
		let gb = Math.round(bytes / 1000000000).toFixed(rounding)
		return gb == "0.0" ? "0" : gb
	}

	getUsedStoragePercentage(): number {
		return (
			(this.dataService.dav.user.UsedStorage /
				this.dataService.dav.user.TotalStorage) *
			100
		)
	}
}
