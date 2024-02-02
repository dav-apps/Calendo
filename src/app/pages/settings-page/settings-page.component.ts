import { Component } from "@angular/core"
import { SwUpdate } from "@angular/service-worker"
import { DataService } from "../../services/data-service"
import { environment } from "../../../environments/environment"
import { enUS } from "../../../locales/locales"
import { MatLegacyRadioChange as MatRadioChange } from "@angular/material/legacy-radio"

const dateKey = "date"
const groupKey = "group"

@Component({
	selector: "calendo-settings-page",
	templateUrl: "./settings-page.component.html"
})
export class SettingsPageComponent {
	locale = enUS.settingsPage
	version: string = environment.version
	year = new Date().getFullYear()
	sortTodosSelectedKey: string = groupKey
	isWindows: boolean = false
	themeKeys: string[] = [
		environment.lightThemeKey,
		environment.darkThemeKey,
		environment.systemThemeKey
	]
	selectedTheme: string
	updateAvailable: boolean = false

	constructor(public dataService: DataService, private swUpdate: SwUpdate) {
		this.locale = this.dataService.GetLocale().settingsPage
		this.isWindows = window["Windows"] != null
		this.dataService.HideWindowsBackButton()
	}

	async ngOnInit() {
		this.sortTodosSelectedKey = (await this.dataService.GetSortTodosByDate())
			? dateKey
			: groupKey

		// Set the correct theme radio button
		this.selectedTheme = await this.dataService.GetTheme()

		// Check for updates
		this.swUpdate.available.subscribe(() => {
			this.updateAvailable = true
		})

		if (this.swUpdate.isEnabled) {
			this.swUpdate.checkForUpdate()
		}
	}

	onSortTodosSelectChanged(event: {
		ev: MouseEvent
		option: any
		index: number
	}) {
		this.sortTodosSelectedKey = event.index == 0 ? dateKey : groupKey
		this.dataService.SetSortTodosByDate(event.index == 0)
	}

	onThemeRadioButtonSelected(event: MatRadioChange) {
		this.selectedTheme = event.value
		this.dataService.SetTheme(event.value)
		this.dataService.ApplyTheme(event.value)
	}

	InstallUpdate() {
		window.location.reload()
	}
}
