import {
	Component,
	Input,
	Output,
	ViewChild,
	EventEmitter
} from "@angular/core"
import * as moment from "moment"
import { AppointmentModalComponent } from "src/app/components/appointment-modal/appointment-modal.component"
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
	@Output() delete = new EventEmitter()
	@ViewChild(AppointmentModalComponent, { static: true })
	private newAppointmentModalComponent: AppointmentModalComponent
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
}
