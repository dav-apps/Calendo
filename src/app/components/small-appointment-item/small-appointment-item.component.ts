import { Component, Input, ViewChild } from "@angular/core"
import * as moment from "moment"
import { AppointmentModalComponent } from "src/app/components/appointment-modal/appointment-modal.component"
import { DeleteAppointmentModalComponent } from "src/app/components/delete-appointment-modal/delete-appointment-modal.component"
import { Appointment } from "src/app/models/Appointment"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { environment } from "src/environments/environment"

@Component({
	selector: "calendo-small-appointment-item",
	templateUrl: "./small-appointment-item.component.html"
})
export class SmallAppointmentItemComponent {
	locale = this.localizationService.locale.smallAppointmentItem
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
	@ViewChild(AppointmentModalComponent, { static: true })
	private newAppointmentModalComponent: AppointmentModalComponent
	@ViewChild(DeleteAppointmentModalComponent, { static: true })
	private deleteAppointmentModalComponent: DeleteAppointmentModalComponent
	defaultColor: string = environment.appointmentDefaultColor

	constructor(
		private dataService: DataService,
		private localizationService: LocalizationService
	) {}

	getTimeSpan() {
		return (
			moment.unix(this.appointment.start).format("H:mm") +
			" - " +
			moment.unix(this.appointment.end).format("H:mm")
		)
	}

	getStartTime() {
		return moment.unix(this.appointment.start).format("H:mm")
	}

	Edit() {
		this.newAppointmentModalComponent.Show(this.appointment)
	}

	Update(appointment: Appointment) {
		this.dataService.UpdateAppointment(appointment)
	}

	Delete() {
		this.deleteAppointmentModalComponent.Show()
	}

	Remove() {
		this.dataService.RemoveAppointment(this.appointment)
	}
}
