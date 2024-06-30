import { Component, Input, Output, EventEmitter } from "@angular/core"
import { DateTime } from "luxon"
import { Appointment } from "src/app/models/Appointment"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { environment } from "src/environments/environment"
import { faCheck, faEllipsisH } from "@fortawesome/free-solid-svg-icons"

@Component({
	selector: "calendo-appointment-item",
	templateUrl: "./appointment-item.component.html"
})
export class AppointmentItemComponent {
	locale = this.localizationService.locale.appointmentItem
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
	@Output() delete = new EventEmitter()
	menuButtonIconProps = {
		iconName: "More",
		style: {
			fontSize: 16,
			color: this.dataService.darkTheme ? "white" : "black"
		}
	}

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService
	) {}

	ConvertUnixTimestampToTime(timestamp: number): string {
		return DateTime.fromSeconds(timestamp).toFormat("HH:mm")
	}

	IsCompleted(): boolean {
		if (!this.showCompleted) return false

		return DateTime.now().toUnixInteger() > this.appointment.end
	}
}
