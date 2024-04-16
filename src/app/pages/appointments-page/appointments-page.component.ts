import { Component, ViewChild } from "@angular/core"
import { Router } from "@angular/router"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { AppointmentModalComponent } from "src/app/components/appointment-modal/appointment-modal.component"
import { Appointment } from "src/app/models/Appointment"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { MatSnackBar } from "@angular/material/snack-bar"

@Component({
	selector: "calendo-appointments-page",
	templateUrl: "./appointments-page.component.html",
	styleUrls: ["./appointments-page.component.scss"]
})
export class AppointmentsPageComponent {
	locale = this.localizationService.locale.appointmentsPage
	snackbarLocale = this.localizationService.locale.snackbar
	faPlus = faPlus
	@ViewChild(AppointmentModalComponent, { static: true })
	private newAppointmentModalComponent: AppointmentModalComponent

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		public router: Router,
		public snackBar: MatSnackBar
	) {}

	ShowNewAppointmentModal() {
		this.newAppointmentModalComponent.Show()
	}

	CreateAppointment(appointment: Appointment) {
		this.dataService.AddAppointment(appointment)

		// Show snackbar
		this.snackBar
			.open(
				this.snackbarLocale.appointmentCreated,
				this.snackbarLocale.show,
				{ duration: 3000 }
			)
			.onAction()
			.subscribe(() => {
				// Show the day of the appointment
				this.router.navigate(["calendar/day", appointment.start])
			})

		this.dataService.AdaptSnackbarPosition()
	}

	ShowCalendarDay(date: number) {
		this.router.navigate(["/calendar/day", date])
	}
}
