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
import { Appointment } from "../../models/Appointment"
import { enUS } from "../../../locales/locales"
import { DataService } from "../../services/data-service"

@Component({
	selector: "calendo-delete-appointment-modal",
	templateUrl: "./delete-appointment-modal.component.html"
})
export class DeleteAppointmentModalComponent {
	locale = enUS.deleteAppointmentModal
	@Input() appointment: Appointment
	@Output() remove = new EventEmitter()
	@ViewChild("deleteAppointmentModal", { static: true })
	appointmentModal: ElementRef

	constructor(
		private modalService: NgbModal,
		private dataService: DataService
	) {
		this.locale = this.dataService.GetLocale().deleteAppointmentModal
	}

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
