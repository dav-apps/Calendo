import { Component, ViewChild, HostListener } from "@angular/core"
import { faSync, faLock } from "@fortawesome/free-solid-svg-icons"
import { Dav } from "dav-js"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { environment } from "src/environments/environment"
import { LogoutModalComponent } from "src/app/components/logout-modal/logout-modal.component"

@Component({
	selector: "calendo-account-page",
	templateUrl: "./account-page.component.html"
})
export class AccountPageComponent {
	locale = this.localizationService.locale.accountPage
	faSync = faSync
	faLock = faLock
	@ViewChild(LogoutModalComponent)
	private logoutModalComponent: LogoutModalComponent
	width: number = window.innerWidth

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService
	) {}

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
