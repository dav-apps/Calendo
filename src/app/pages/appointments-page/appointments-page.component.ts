import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { Router } from "@angular/router"
import { DateTime } from "luxon"
import { faEdit, faTrash, faArrowRight } from "@fortawesome/pro-light-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { AppointmentDialogComponent } from "src/app/dialogs/appointment-dialog/appointment-dialog.component"
import { DeleteAppointmentDialogComponent } from "src/app/dialogs/delete-appointment-dialog/delete-appointment-dialog.component"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { Appointment } from "src/app/models/Appointment"
import {
	sortAppointments,
	showEditAppointmentDialog,
	createAppointment,
	updateAppointment
} from "src/app/utils"
import { AppointmentDay, AppointmentDialogEventData } from "src/app/types"

@Component({
	templateUrl: "./appointments-page.component.html",
	styleUrl: "./appointments-page.component.scss"
})
export class AppointmentsPageComponent {
	locale = this.localizationService.locale.appointmentsPage
	actionsLocale = this.localizationService.locale.actions
	errorsLocale = this.localizationService.locale.errors
	miscLocale = this.localizationService.locale.misc
	faEdit = faEdit
	faTrash = faTrash
	faArrowRight = faArrowRight
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

	//#region EditAppointmentDialog
	@ViewChild("editAppointmentDialog")
	editAppointmentDialog: AppointmentDialogComponent
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
		await this.dataService.loadAppointments()

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
			sortAppointments(appointmentDay.appointments)
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

	removeAppointment(appointment: Appointment) {
		let date = DateTime.fromSeconds(appointment.start)
		let formattedDate = date.toFormat("DDDD")
		let isOld = date < DateTime.now()

		// Check if the appointment is in appointmentDays or oldAppointmentDays
		let appointmentDays = isOld
			? this.oldAppointmentDays
			: this.appointmentDays

		let appointmentDay = appointmentDays.find(
			day => day.formattedDate == formattedDate
		)

		if (appointmentDay != null) {
			let i = appointmentDay.appointments.findIndex(
				a => a.uuid == appointment.uuid
			)

			if (i != -1) {
				appointmentDay.appointments.splice(i, 1)
				return
			}
		}

		// Look for the appointment in all appointment days
		let allAppointmentDays = [
			...this.appointmentDays,
			...this.oldAppointmentDays
		]

		for (let appointmentDay of allAppointmentDays) {
			let i = appointmentDay.appointments.findIndex(
				a => a.uuid == appointment.uuid
			)

			if (i != -1) {
				appointmentDay.appointments.splice(i, 1)
				break
			}
		}
	}

	async createAppointment(event: AppointmentDialogEventData) {
		if (event.name.length == 0) {
			this.createAppointmentDialog.nameError = this.errorsLocale.nameMissing
			return
		}

		let appointment = await createAppointment(
			event,
			this.miscLocale.fullDayEvent
		)

		this.addAppointment(appointment)
		this.createAppointmentDialog.hide()

		this.dataService.appointmentsChanged = true
	}

	async updateAppointment(event: AppointmentDialogEventData) {
		if (event.name.length == 0) {
			this.editAppointmentDialog.nameError = this.errorsLocale.nameMissing
			return
		}

		let appointment = this.selectedAppointment
		await updateAppointment(event, appointment, this.miscLocale.fullDayEvent)

		this.removeAppointment(appointment)
		this.addAppointment(appointment)

		this.editAppointmentDialog.hide()

		this.dataService.appointmentsChanged = true
	}

	showCreateAppointmentDialog() {
		this.createAppointmentDialog.reset()
		this.createAppointmentDialog.show()
	}

	showEditAppointmentDialog(appointment: Appointment) {
		this.selectedAppointment = appointment
		this.contextMenuVisible = false

		showEditAppointmentDialog(appointment, this.editAppointmentDialog)
	}

	showDeleteAppointmentDialog(appointment: Appointment) {
		this.selectedAppointment = appointment
		this.contextMenuVisible = false
		this.deleteAppointmentDialog.show()
	}

	async deleteAppointment() {
		this.deleteAppointmentDialog.hide()
		this.removeAppointment(this.selectedAppointment)

		await this.selectedAppointment.Delete()
		this.selectedAppointment = null
		this.dataService.appointmentsChanged = true
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
