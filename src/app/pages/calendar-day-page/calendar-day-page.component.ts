import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { Location } from "@angular/common"
import { Router, ActivatedRoute } from "@angular/router"
import { DateTime } from "luxon"
import {
	faEdit as faEditLight,
	faTrash as faTrashLight
} from "@fortawesome/pro-light-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { AppointmentDialogComponent } from "src/app/dialogs/appointment-dialog/appointment-dialog.component"
import { TodoDialogComponent } from "src/app/dialogs/todo-dialog/todo-dialog.component"
import { DeleteAppointmentDialogComponent } from "src/app/dialogs/delete-appointment-dialog/delete-appointment-dialog.component"
import { Appointment } from "src/app/models/Appointment"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { sortAppointments, sortTodos } from "src/app/utils"

@Component({
	templateUrl: "./calendar-day-page.component.html",
	styleUrl: "./calendar-day-page.component.scss"
})
export class CalendarDayPageComponent {
	locale = this.localizationService.locale.calendarDayPage
	actionsLocale = this.localizationService.locale.actions
	faEditLight = faEditLight
	faTrashLight = faTrashLight
	title: string = ""
	date = DateTime.now().startOf("day")
	isDateBeforeToday: boolean = false
	appointments: Appointment[] = []
	todos: Todo[] = []
	todoLists: TodoList[] = []
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
	//#endregion

	//#region EditAppointmentDialog
	@ViewChild("editAppointmentDialog")
	editAppointmentDialog: AppointmentDialogComponent
	//#endregion

	//#region CreateTodoDialog
	@ViewChild("createTodoDialog")
	createTodoDialog: TodoDialogComponent
	//#endregion

	//#region DeleteAppointmentDialog
	@ViewChild("deleteAppointmentDialog")
	deleteAppointmentDialog: DeleteAppointmentDialogComponent
	//#endregion

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		private location: Location
	) {}

	async ngOnInit() {
		await this.dataService.appointmentsPromiseHolder.AwaitResult()
		await this.dataService.todosPromiseHolder.AwaitResult()

		this.activatedRoute.params.subscribe(param => {
			let year = Number(param.year)
			let month = Number(param.month)
			let day = Number(param.day)

			if (isNaN(year) || isNaN(month) || isNaN(day)) {
				this.router.navigate(["/"])
			} else {
				this.date = DateTime.now().set({ year, month, day })
				this.title = this.date.toFormat("DDDD")
				this.isDateBeforeToday = this.date < DateTime.now().startOf("day")

				this.appointments = this.dataService.getAppointmentsOfDay(this.date)
				this.todos = this.dataService.getTodosOfDay(this.date)
			}
		})
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

	removeAppointment(appointment: Appointment) {
		let i = this.appointments.findIndex(a => a.uuid == appointment.uuid)
		if (i != -1) this.appointments.splice(i, 1)
	}

	showEditAppointmentDialog(appointment: Appointment) {
		let startDate = DateTime.fromSeconds(appointment.start)
		let endDate = DateTime.fromSeconds(appointment.end)

		this.selectedAppointment = appointment
		this.contextMenuVisible = false
		this.editAppointmentDialog.name = appointment.name
		this.editAppointmentDialog.date = startDate
		this.editAppointmentDialog.selectedColor = appointment.color
		this.editAppointmentDialog.allDay = appointment.allday
		this.editAppointmentDialog.startTimeHour = startDate.hour
		this.editAppointmentDialog.startTimeMinute = startDate.minute
		this.editAppointmentDialog.endTimeHour = endDate.hour
		this.editAppointmentDialog.endTimeMinute = endDate.minute

		this.editAppointmentDialog.show()
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

		this.appointments.push(appointment)
		sortAppointments(this.appointments)

		this.createAppointmentDialog.hide()
	}

	async updateAppointment(event: {
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
			this.editAppointmentDialog.nameError = "Bitte gib einen Namen ein"
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

		let appointment = this.selectedAppointment

		await appointment.Update(
			event.name,
			startTime.toUnixInteger(),
			endTime.toUnixInteger(),
			event.allDay,
			event.color,
			null
		)

		let i = this.appointments.findIndex(a => a.uuid == appointment.uuid)
		if (i != -1) this.appointments[i] = appointment

		this.editAppointmentDialog.hide()
	}

	async createTodo(event: { name: string; date: DateTime; labels: string[] }) {
		let todo = await Todo.Create(
			event.name,
			false,
			event.date.toUnixInteger(),
			event.labels
		)

		this.todos.push(todo)
		sortTodos(this.todos)

		this.createTodoDialog.hide()
	}

	goBack() {
		this.location.back()
	}
}
