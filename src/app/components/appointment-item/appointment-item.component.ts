import { Component, Input, ViewChild } from "@angular/core"
import * as moment from "moment"
import { AppointmentModalComponent } from "../../components/appointment-modal/appointment-modal.component"
import { DeleteAppointmentModalComponent } from "../../components/delete-appointment-modal/delete-appointment-modal.component"
import { Appointment } from "../../models/Appointment"
import { DataService } from "../../services/data-service"
import { environment } from "../../../environments/environment"
import { enUS } from "../../../locales/locales"
import { faCheck, faEllipsisH } from "@fortawesome/free-solid-svg-icons"
import { IIconProps } from "office-ui-fabric-react"

@Component({
	selector: "calendo-appointment-item",
	templateUrl: "./appointment-item.component.html"
})
export class AppointmentItemComponent {
	locale = enUS.appointmentItem
	faCheck = faCheck
	faEllipsisH = faEllipsisH
	@Input() appointment: Appointment = new Appointment(
		"",
		"",
		0,
		0,
		false,
		environment.appointmentDefaultColor
	)
	@Input() showCompleted: boolean = false
	@ViewChild(AppointmentModalComponent, { static: true })
	private newAppointmentModalComponent: AppointmentModalComponent
	@ViewChild(DeleteAppointmentModalComponent, { static: true })
	private deleteAppointmentModalComponent: DeleteAppointmentModalComponent
	menuButtonIconProps: IIconProps = {
		iconName: "More",
		style: {
			fontSize: 16,
			color: this.dataService.darkTheme ? "white" : "black"
		}
	}

	constructor(public dataService: DataService) {
		this.locale = this.dataService.GetLocale().appointmentItem
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

	ConvertUnixTimestampToTime(timestamp: number): string {
		return moment.unix(timestamp).format("HH:mm")
	}

	IsCompleted(): boolean {
		if (!this.showCompleted) return false

		return moment.now() / 1000 > this.appointment.end
	}
}
