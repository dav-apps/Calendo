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
	selector: "calendo-appointment-dialog",
	templateUrl: "./appointment-dialog.component.html",
	styleUrl: "./appointment-dialog.component.scss"
})
export class AppointmentDialogComponent {
	locale = this.localizationService.locale.dialogs.appointmentDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() name: string = ""
	@Input() nameError: string = ""
	@Input() date: DateTime = DateTime.now()
	@Input() selectedColor: string = "#D32F2F"
	@Input() allDay: boolean = true
	@Input() startTimeHour: number = 14
	@Input() startTimeMinute: number = 0
	@Input() endTimeHour: number = 15
	@Input() endTimeMinute: number = 0
	@Input() loading: boolean = false
	@Output() primaryButtonClick = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false

	colorDropdownOptions: DropdownOption[] = [
		{
			key: "#D32F2F",
			value: "#D32F2F",
			type: DropdownOptionType.color
		},
		{
			key: "#D67724",
			value: "#D67724",
			type: DropdownOptionType.color
		},
		{
			key: "#FFD600",
			value: "#FFD600",
			type: DropdownOptionType.color
		},
		{
			key: "#388E3C",
			value: "#388E3C",
			type: DropdownOptionType.color
		},
		{
			key: "#43A047",
			value: "#43A047",
			type: DropdownOptionType.color
		},
		{
			key: "#00B0FF",
			value: "#00B0FF",
			type: DropdownOptionType.color
		},
		{
			key: "#1565C0",
			value: "#1565C0",
			type: DropdownOptionType.color
		},
		{
			key: "#283593",
			value: "#283593",
			type: DropdownOptionType.color
		},
		{
			key: "#7B1FA2",
			value: "#7B1FA2",
			type: DropdownOptionType.color
		},
		{
			key: "#757575",
			value: "#757575",
			type: DropdownOptionType.color
		},
		{
			key: "#000000",
			value: "#000000",
			type: DropdownOptionType.color
		}
	]

	constructor(private localizationService: LocalizationService) {
		// Select a random color
		let i = randomNumber(0, this.colorDropdownOptions.length - 1)
		this.selectedColor = this.colorDropdownOptions[i].key
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
		this.selectedColor = event.detail.key
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
			o => o.key == this.selectedColor
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
