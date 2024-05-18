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
import { LocalizationService } from "src/app/services/localization-service"
import { randomNumber } from "src/app/utils"

@Component({
	selector: "calendo-create-appointment-dialog",
	templateUrl: "./create-appointment-dialog.component.html",
	styleUrl: "./create-appointment-dialog.component.scss"
})
export class CreateAppointmentDialogComponent {
	locale = this.localizationService.locale.dialogs.createAppointmentDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() loading: boolean = false
	@Input() nameError: string = ""
	@Output() primaryButtonClick = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	name: string = ""
	colorDropdownSelectedKey: string = "red"
	date: DateTime = DateTime.now()
	allDay: boolean = true
	startTimeHour: number = 14
	startTimeMinute: number = 0
	endTimeHour: number = 15
	endTimeMinute: number = 0

	colorDropdownOptions: DropdownOption[] = [
		{
			key: "red",
			value: "#D32F2F",
			type: DropdownOptionType.color
		},
		{
			key: "orange",
			value: "#D67724",
			type: DropdownOptionType.color
		},
		{
			key: "yellow",
			value: "#FFD600",
			type: DropdownOptionType.color
		},
		{
			key: "green",
			value: "#388E3C",
			type: DropdownOptionType.color
		},
		{
			key: "light-green",
			value: "#43A047",
			type: DropdownOptionType.color
		},
		{
			key: "light-blue",
			value: "#00B0FF",
			type: DropdownOptionType.color
		},
		{
			key: "blue",
			value: "#1565C0",
			type: DropdownOptionType.color
		},
		{
			key: "dark-blue",
			value: "#283593",
			type: DropdownOptionType.color
		},
		{
			key: "purple",
			value: "#7B1FA2",
			type: DropdownOptionType.color
		},
		{
			key: "gray",
			value: "#757575",
			type: DropdownOptionType.color
		},
		{
			key: "black",
			value: "#000000",
			type: DropdownOptionType.color
		}
	]

	constructor(private localizationService: LocalizationService) {
		// Select a random color
		let i = randomNumber(0, this.colorDropdownOptions.length - 1)
		this.colorDropdownSelectedKey = this.colorDropdownOptions[i].key
	}

	ngAfterViewInit() {
		document.body.appendChild(this.dialog.nativeElement)
	}

	ngOnDestroy() {
		document.body.removeChild(this.dialog.nativeElement)
	}

	show() {
		this.visible = true
	}

	hide() {
		this.visible = false
	}

	nameTextfieldChange(event: Event) {
		this.name = (event as CustomEvent).detail.value
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
			endTimeMinute: this.endTimeMinute
		})
	}
}
