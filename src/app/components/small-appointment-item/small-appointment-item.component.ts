import { Component, Input, Output, EventEmitter } from "@angular/core"
import { DateTime } from "luxon"
import {
	TonalPalette,
	argbFromHex,
	hexFromArgb
} from "@material/material-color-utilities"
import { Appointment } from "src/app/models/Appointment"
import { DataService } from "src/app/services/data-service"
import { environment } from "src/environments/environment"

@Component({
	selector: "calendo-small-appointment-item",
	templateUrl: "./small-appointment-item.component.html",
	styleUrl: "./small-appointment-item.component.scss"
})
export class SmallAppointmentItemComponent {
	@Input() appointment: Appointment = new Appointment(
		"",
		"",
		0,
		0,
		false,
		environment.appointmentDefaultColor
	)
	@Input() enableDropdown: boolean = true
	@Input() compact: boolean = false
	@Output() delete = new EventEmitter()
	backgroundColor: string = environment.appointmentDefaultColor
	textColor: string = environment.appointmentDefaultColor

	constructor(private dataService: DataService) {}

	ngOnInit() {
		if (this.appointment.color != null) {
			let palette = TonalPalette.fromInt(argbFromHex(this.appointment.color))
			this.backgroundColor = hexFromArgb(palette.tone(90))
			this.textColor = hexFromArgb(palette.tone(10))
		}
	}

	getTimeSpan() {
		return `${DateTime.fromSeconds(this.appointment.start).toFormat(
			"H:mm"
		)} - ${DateTime.fromSeconds(this.appointment.end).toFormat("H:mm")}`
	}

	getStartTime() {
		return DateTime.fromSeconds(this.appointment.start).toFormat("H:mm")
	}

	Edit() {}

	Update(appointment: Appointment) {
		this.dataService.UpdateAppointment(appointment)
	}
}
