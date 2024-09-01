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
	@Input() selectedColor: string = ""
	@Input() allDay: boolean = true
	@Input() startTimeHour: number = 14
	@Input() startTimeMinute: number = 0
	@Input() endTimeHour: number = 15
	@Input() endTimeMinute: number = 0
	@Input() loading: boolean = false
	@Input() mode: "create" | "edit" = "create"
	@Output() primaryButtonClick = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	colorDropdownSelectedKey: string = ""

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

	constructor(private localizationService: LocalizationService) {}

	ngAfterViewInit() {
		document.body.appendChild(this.dialog.nativeElement)
	}

	ngOnDestroy() {
		document.body.removeChild(this.dialog.nativeElement)
	}

	show() {
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
