import { Component, ViewChild } from "@angular/core"
import {
	faRotate as faRotateLight,
	faLock as faLockLight
} from "@fortawesome/pro-light-svg-icons"
import { Dav } from "dav-js"
import { LogoutDialogComponent } from "src/app/dialogs/logout-dialog/logout-dialog.component"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { environment } from "src/environments/environment"

@Component({
	templateUrl: "./user-page.component.html",
	styleUrl: "./user-page.component.scss"
})
export class UserPageComponent {
	locale = this.localizationService.locale.userPage
	faRotateLight = faRotateLight
	faLockLight = faLockLight
	@ViewChild("logoutDialog")
	logoutDialog: LogoutDialogComponent
	websiteUrl = environment.websiteUrl

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService
	) {}

	navigateToLoginPage() {
		Dav.ShowLoginPage(environment.apiKey, window.location.origin)
	}

	navigateToSignupPage() {
		Dav.ShowSignupPage(environment.apiKey, window.location.origin)
	}

	showLogoutDialog() {
		this.logoutDialog.show()
	}

	async logout() {
		this.logoutDialog.hide()

		await this.dataService.dav.Logout()
		window.location.href = "/user"
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
