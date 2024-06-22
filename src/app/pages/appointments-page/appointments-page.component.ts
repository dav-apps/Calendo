import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { Router } from "@angular/router"
import { DateTime } from "luxon"
import {
	faEdit as faEditLight,
	faTrash as faTrashLight,
	faArrowRight as faArrowRightLight
} from "@fortawesome/pro-light-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { AppointmentDialogComponent } from "src/app/dialogs/appointment-dialog/appointment-dialog.component"
import { DeleteAppointmentDialogComponent } from "src/app/dialogs/delete-appointment-dialog/delete-appointment-dialog.component"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { Appointment } from "src/app/models/Appointment"
import { AppointmentDay } from "src/app/types"

@Component({
	templateUrl: "./appointments-page.component.html",
	styleUrl: "./appointments-page.component.scss"
})
export class AppointmentsPageComponent {
	locale = this.localizationService.locale.appointmentsPage
	actionsLocale = this.localizationService.locale.actions
	faEditLight = faEditLight
	faTrashLight = faTrashLight
	faArrowRightLight = faArrowRightLight
	appointmentDays: AppointmentDay[] = []
	oldAppointmentDays: AppointmentDay[] = []
	selectedAppointment: Appointment = null

	//#region ContextMenu
	@ViewChild("contextMenu")
	contextMenu: ElementRef<ContextMenu>
	contextMenuVisible: boolean = false
	contextMenuPositionX: number = 0
	contextMenuPositionY: number = 0
	//#endregion

	//#region CreateAppointmentDialog
	@ViewChild("createAppointmentDialog")
	createAppointmentDialog: AppointmentDialogComponent
	createAppointmentDialogNameError: string = ""
	//#endregion

	//#region DeleteAppointmentDialog
	@ViewChild("deleteAppointmentDialog")
	deleteAppointmentDialog: DeleteAppointmentDialogComponent
	//#endregion

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		public router: Router
	) {}

	async ngOnInit() {
		await this.dataService.appointmentsPromiseHolder.AwaitResult()

		for (let appointment of this.dataService.allAppointments) {
			this.addAppointment(appointment)
		}
	}

	@HostListener("document:click", ["$event"])
	documentClick(event: MouseEvent) {
		if (!this.contextMenu.nativeElement.contains(event.target as Node)) {
			this.contextMenuVisible = false
		}
	}

	smallAppointmentItemContextMenu(
		event: PointerEvent,
		appointment: Appointment
	) {
		event.preventDefault()

		this.selectedAppointment = appointment
		this.contextMenuPositionX = event.pageX
		this.contextMenuPositionY =
			event.pageY + this.dataService.contentContainer.scrollTop
		this.contextMenuVisible = true
	}

	addAppointment(appointment: Appointment) {
		let date = DateTime.fromSeconds(appointment.start)
		let formattedDate = date.toFormat("DDDD")
		let isOld = date < DateTime.now()

		// Check if the appointment is already in appointmentDays or oldAppointmentDays
		let appointmentDays = isOld
			? this.oldAppointmentDays
			: this.appointmentDays

		let appointmentDay = appointmentDays.find(
			day => day.formattedDate == formattedDate
		)

		if (appointmentDay != null) {
			appointmentDay.appointments.push(appointment)

			// Sort the appointments of the day
			this.dataService.SortAppointmentsArray(appointmentDay.appointments)
		} else {
			appointmentDays.push({
				date: date.startOf("day"),
				formattedDate,
				calendarDayPageLink: `calendar/${date.year}/${date.month}/${date.day}`,
				appointments: [appointment]
			})

			// Sort the appointmentDays
			appointmentDays.sort((a: AppointmentDay, b: AppointmentDay) => {
				if (a.date < b.date) {
					return isOld ? 1 : -1
				} else if (a.date > b.date) {
					return isOld ? -1 : 1
				} else {
					return 0
				}
			})
		}
	}

	async createAppointment(event: {
		name: string
		date: DateTime
		allDay: boolean
		color: string
		startTimeHour: number
		startTimeMinute: number
		endTimeHour: number
		endTimeMinute: number
	}) {
		if (event.name.length == 0) {
			this.createAppointmentDialog.nameError = "Bitte gib einen Namen ein"
			return
		}

		let startTime = event.date.set({
			hour: event.startTimeHour,
			minute: event.startTimeMinute
		})

		let endTime = event.date.set({
			hour: event.endTimeHour,
			minute: event.endTimeMinute
		})

		if (endTime < startTime) {
			endTime = endTime.plus({ days: 1 })
		}

		let appointment = await Appointment.Create(
			event.name,
			startTime.toUnixInteger(),
			endTime.toUnixInteger(),
			event.allDay,
			event.color
		)

		this.dataService.AddAppointment(appointment)
		this.createAppointmentDialog.hide()
	}

	showDeleteAppointmentDialog(appointment: Appointment) {
		this.selectedAppointment = appointment
		this.contextMenuVisible = false
		this.deleteAppointmentDialog.show()
	}

	async deleteAppointment() {
		this.deleteAppointmentDialog.hide()
		this.dataService.RemoveAppointment(this.selectedAppointment)

		await this.selectedAppointment.Delete()
		this.selectedAppointment = null
	}

	appointmentDayMoreButtonClick(
		event: MouseEvent,
		appointmentDay: AppointmentDay
	) {
		event.preventDefault()
		this.dataService.contentContainer.scrollTo(0, 0)
		this.router.navigate([appointmentDay.calendarDayPageLink])
	}
}
