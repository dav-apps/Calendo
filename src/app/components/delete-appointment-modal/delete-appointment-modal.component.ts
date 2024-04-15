import {
	Component,
	ViewChild,
	ElementRef,
	Input,
	Output,
	EventEmitter
} from "@angular/core"
import { NgbModal } from "@ng-bootstrap/ng-bootstrap"
import * as moment from "moment"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { Appointment } from "src/app/models/Appointment"

@Component({
	selector: "calendo-delete-appointment-modal",
	templateUrl: "./delete-appointment-modal.component.html"
})
export class DeleteAppointmentModalComponent {
	locale = this.localizationService.locale.deleteAppointmentModal
	@Input() appointment: Appointment
	@Output() remove = new EventEmitter()
	@ViewChild("deleteAppointmentModal", { static: true })
	appointmentModal: ElementRef

	constructor(
		private dataService: DataService,
		private localizationService: LocalizationService,
		private modalService: NgbModal
	) {}

	Show() {
		this.modalService.open(this.appointmentModal).result.then(
			async () => {
				// Delete the appointment
				await this.appointment.Delete()
				this.remove.emit(null)
			},
			() => {}
		)
	}

	ConvertUnixTimestampToTime(timestamp: number): string {
		return moment.unix(timestamp).format("H:mm")
	}
}
