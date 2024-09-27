import {
	Component,
	Input,
	Output,
	ViewChild,
	ElementRef,
	EventEmitter
} from "@angular/core"
import { DateTime } from "luxon"
import { Dialog, DropdownOption, DropdownOptionType } from "dav-ui-components"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { randomNumber, getNotificationPermission } from "src/app/utils"

@Component({
	selector: "calendo-appointment-dialog",
	templateUrl: "./appointment-dialog.component.html",
	styleUrl: "./appointment-dialog.component.scss"
})
export class AppointmentDialogComponent {
	locale = this.localizationService.locale.dialogs.appointmentDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() loading: boolean = false
	@Input() mode: "create" | "edit" = "create"
	@Output() primaryButtonClick = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	name: string = ""
	nameError: string = ""
	date: DateTime = DateTime.now()
	selectedColor: string = ""
	allDay: boolean = true
	startTimeHour: number = 14
	startTimeMinute: number = 0
	endTimeHour: number = 15
	endTimeMinute: number = 0
	showActivateReminderOption: boolean = false
	activateReminder: boolean = true
	visible: boolean = false
	colorDropdownSelectedKey: string = ""
	reminderDropdownSelectedKey: string = "3600"
	colorDropdownOptions: DropdownOption[] = [
		// Falu red
		{
			key: "#6F1D1B",
			value: "#D32F2F",
			type: DropdownOptionType.color
		},
		// Antique white
		{
			key: "#FFE8D1",
			value: "#D67724",
			type: DropdownOptionType.color
		},
		// Old gold
		{
			key: "#BFAE48",
			value: "#FFD600",
			type: DropdownOptionType.color
		},
		// Dark green
		{
			key: "#11270B",
			value: "#388e3c",
			type: DropdownOptionType.color
		},
		// Air force blue
		{
			key: "#568EA3",
			value: "#1565c0",
			type: DropdownOptionType.color
		},
		// Indigo
		{
			key: "#470063",
			value: "#7b1fa2",
			type: DropdownOptionType.color
		},
		// Dim gray
		{
			key: "#616163",
			value: "#757575",
			type: DropdownOptionType.color
		}
	]
	reminderDropdownOptions: DropdownOption[] = []

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService
	) {
		// Check if push is supported
		this.showActivateReminderOption =
			"serviceWorker" in navigator &&
			"PushManager" in window &&
			this.dataService.dav.isLoggedIn &&
			getNotificationPermission() != "denied"

		if (
			this.reminderDropdownOptions.length == 0 &&
			this.showActivateReminderOption
		) {
			for (let reminderOption of Object.values(
				this.locale.reminderOptions
			)) {
				this.reminderDropdownOptions.push({
					key: reminderOption.key.toString(),
					value: reminderOption.value,
					type: DropdownOptionType.option
				})
			}
		}
	}

	ngAfterViewInit() {
		document.body.appendChild(this.dialog.nativeElement)
	}

	ngOnDestroy() {
		document.body.removeChild(this.dialog.nativeElement)
	}

	reset() {
		this.name = ""
		this.nameError = ""
		this.date = DateTime.now()
		this.allDay = true
		this.startTimeHour = 14
		this.startTimeMinute = 0
		this.endTimeHour = 15
		this.endTimeMinute = 0
		this.activateReminder = true
		this.reminderDropdownSelectedKey = "3600"

		this.selectColor()
	}

	show() {
		this.selectColor()
		this.visible = true
	}

	hide() {
		this.visible = false
	}

	nameTextfieldChange(event: Event) {
		this.name = (event as CustomEvent).detail.value
		this.nameError = ""
	}

	colorDropdownChange(event: CustomEvent) {
		this.colorDropdownSelectedKey = event.detail.key
	}

	calendarChange(event: CustomEvent) {
		this.date = event.detail.date
	}

	allDayCheckboxChange(event: CustomEvent) {
		this.allDay = event.detail.checked
	}

	startTimePickerChange(event: CustomEvent) {
		this.startTimeHour = event.detail.hour
		this.startTimeMinute = event.detail.minute
	}

	endTimePickerChange(event: CustomEvent) {
		this.endTimeHour = event.detail.hour
		this.endTimeMinute = event.detail.minute
	}

	reminderCheckboxChange(event: CustomEvent) {
		this.activateReminder = event.detail.checked
	}

	reminderDropdownChange(event: CustomEvent) {
		this.reminderDropdownSelectedKey = event.detail.key
	}

	submit() {
		let i = this.colorDropdownOptions.findIndex(
			o => o.key == this.colorDropdownSelectedKey
		)

		let color = this.colorDropdownOptions[0].value

		if (i != -1) {
			color = this.colorDropdownOptions[i].value
		}

		this.primaryButtonClick.emit({
			name: this.name,
			date: this.date,
			allDay: this.allDay,
			color,
			startTimeHour: this.startTimeHour,
			startTimeMinute: this.startTimeMinute,
			endTimeHour: this.endTimeHour,
			endTimeMinute: this.endTimeMinute,
			activateReminder:
				this.activateReminder && this.showActivateReminderOption,
			reminderSecondsBefore: Number(this.reminderDropdownSelectedKey)
		})
	}

	private selectColor() {
		if (this.selectedColor.length == 0) {
			// Select a random color
			let i = randomNumber(0, this.colorDropdownOptions.length - 1)
			this.colorDropdownSelectedKey = this.colorDropdownOptions[i].key
		} else {
			let i = this.colorDropdownOptions.findIndex(
				option =>
					option.key == this.selectedColor ||
					option.value == this.selectedColor
			)

			if (i != -1) {
				this.colorDropdownSelectedKey = this.colorDropdownOptions[i].key
			}
		}
	}
}
