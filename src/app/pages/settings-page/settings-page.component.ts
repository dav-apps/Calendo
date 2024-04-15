import { Component } from "@angular/core"
import { SwUpdate } from "@angular/service-worker"
import { DropdownOption, DropdownOptionType } from "dav-ui-components"
import { DataService } from "src/app/services/data-service"
import {
	version,
	systemThemeKey,
	lightThemeKey,
	darkThemeKey
} from "src/app/constants"
import { enUS } from "src/locales/locales"
import { SettingsService } from "src/app/services/settings-service"

const dateKey = "date"
const groupKey = "group"

@Component({
	selector: "calendo-settings-page",
	templateUrl: "./settings-page.component.html"
})
export class SettingsPageComponent {
	locale = enUS.settingsPage
	version = version
	year = new Date().getFullYear()
	sortTodosSelectedKey: string = groupKey
	selectedTheme: string
	updateAvailable: boolean = false
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
		private settingsService: SettingsService,
		private swUpdate: SwUpdate
	) {
		this.locale = this.dataService.GetLocale().settingsPage
		this.dataService.HideWindowsBackButton()
	}

	async ngOnInit() {
		this.sortTodosSelectedKey = (await this.dataService.GetSortTodosByDate())
			? dateKey
			: groupKey

		// Set the correct theme radio button
		this.selectedTheme = await this.dataService.GetTheme()

		// Check for updates
		/*
		this.swUpdate.available.subscribe(() => {
			this.updateAvailable = true
		})
		*/

		if (this.swUpdate.isEnabled) {
			this.swUpdate.checkForUpdate()
		}
	}

	async themeDropdownChange(event: Event) {
		let selectedKey = (event as CustomEvent).detail.key

		this.selectedTheme = selectedKey
		await this.settingsService.setTheme(selectedKey)
		await this.dataService.loadTheme()
	}

	onSortTodosSelectChanged(event: {
		ev: MouseEvent
		option: any
		index: number
	}) {
		this.sortTodosSelectedKey = event.index == 0 ? dateKey : groupKey
		this.dataService.SetSortTodosByDate(event.index == 0)
	}

	activateUpdate() {
		window.location.reload()
	}
}
