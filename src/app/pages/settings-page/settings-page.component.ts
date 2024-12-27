import { Component } from "@angular/core"
import { SwUpdate, VersionEvent } from "@angular/service-worker"
import { faCheck } from "@fortawesome/pro-light-svg-icons"
import { DropdownOption, DropdownOptionType } from "dav-ui-components"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { SettingsService } from "src/app/services/settings-service"
import {
	version,
	systemThemeKey,
	lightThemeKey,
	darkThemeKey
} from "src/app/constants"

@Component({
	templateUrl: "./settings-page.component.html",
	styleUrl: "./settings-page.component.scss",
	standalone: false
})
export class SettingsPageComponent {
	locale = this.localizationService.locale.settingsPage
	faCheck = faCheck
	version = version
	year = new Date().getFullYear()
	updateMessage: string = ""
	searchForUpdates: boolean = false
	updateError: boolean = false
	noUpdateAvailable: boolean = false
	hideNoUpdateAvailable: boolean = false
	selectedTheme: string
	themeDropdownOptions: DropdownOption[] = [
		{
			key: systemThemeKey,
			value: this.locale.systemTheme,
			type: DropdownOptionType.option
		},
		{
			key: lightThemeKey,
			value: this.locale.lightTheme,
			type: DropdownOptionType.option
		},
		{
			key: darkThemeKey,
			value: this.locale.darkTheme,
			type: DropdownOptionType.option
		}
	]

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		private settingsService: SettingsService,
		private swUpdate: SwUpdate
	) {}

	async ngOnInit() {
		this.selectedTheme = await this.settingsService.getTheme()

		if (this.swUpdate.isEnabled && !this.dataService.updateInstalled) {
			// Check for updates
			this.updateMessage = this.locale.updateSearch
			this.searchForUpdates = true

			this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
				if (event.type == "VERSION_DETECTED") {
					this.updateMessage = this.locale.installingUpdate
				} else if (event.type == "VERSION_READY") {
					this.searchForUpdates = false
					this.dataService.updateInstalled = true
				} else if (event.type == "NO_NEW_VERSION_DETECTED") {
					this.searchForUpdates = false
				} else {
					this.searchForUpdates = false
					this.updateError = true
				}
			})

			if (!(await this.swUpdate.checkForUpdate())) {
				this.searchForUpdates = false
				this.noUpdateAvailable = true

				setTimeout(() => {
					this.hideNoUpdateAvailable = true
				}, 3000)
			}
		}
	}

	async themeDropdownChange(event: Event) {
		let selectedKey = (event as CustomEvent).detail.key

		this.selectedTheme = selectedKey
		await this.settingsService.setTheme(selectedKey)
		await this.dataService.loadTheme()
	}

	activateUpdate() {
		window.location.reload()
	}
}
