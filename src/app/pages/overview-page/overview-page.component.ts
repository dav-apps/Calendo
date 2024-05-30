import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { Router } from "@angular/router"
import { Settings, DateTime } from "luxon"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import {
	faEdit as faEditLight,
	faTrash as faTrashLight
} from "@fortawesome/pro-light-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"
import { AppointmentDialogComponent } from "src/app/dialogs/appointment-dialog/appointment-dialog.component"
import { CreateTodoDialogComponent } from "src/app/dialogs/create-todo-dialog/create-todo-dialog.component"
import { DeleteAppointmentDialogComponent } from "src/app/dialogs/delete-appointment-dialog/delete-appointment-dialog.component"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { NewTodoModalComponent } from "src/app/components/new-todo-modal/new-todo-modal.component"
import { TodoListModalComponent } from "src/app/components/todo-list-modal/todo-list-modal.component"
import { Appointment } from "src/app/models/Appointment"
import { MatSnackBar } from "@angular/material/snack-bar"

@Component({
	templateUrl: "./overview-page.component.html",
	styleUrl: "./overview-page.component.scss"
})
export class OverviewPageComponent {
	locale = this.localizationService.locale.overviewPage
	actionsLocale = this.localizationService.locale.actions
	snackbarLocale = this.localizationService.locale.snackbar
	faPlus = faPlus
	faEditLight = faEditLight
	faTrashLight = faTrashLight
	selectedAppointment: Appointment = null
	@ViewChild(NewTodoModalComponent, { static: true })
	private newTodoModalComponent: NewTodoModalComponent
	@ViewChild(TodoListModalComponent, { static: true })
	private todoListModalComponent: TodoListModalComponent

	largeDateFontSize: number = 24
	smallDateFontSize: number = 16

	currentWeekday: string = ""
	currentDate: string = ""

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
	editAppointmentDialogName: string = ""
	editAppointmentDialogNameError: string = ""
	editAppointmentDialogDate: DateTime = DateTime.now()
	editAppointmentDialogSelectedColor: string = ""
	editAppointmentDialogAllDay: boolean = true
	editAppointmentDialogStartTimeHour: number = 14
	editAppointmentDialogStartTimeMinute: number = 0
	editAppointmentDialogEndTimeHour: number = 15
	editAppointmentDialogEndTimeMinute: number = 0
	//#endregion

	//#region CreateTodoDialog
	@ViewChild("createTodoDialog")
	createTodoDialog: CreateTodoDialogComponent
	//#endregion

	//#region DeleteAppointmentDialog
	@ViewChild("deleteAppointmentDialog")
	deleteAppointmentDialog: DeleteAppointmentDialogComponent
	//#endregion

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		private router: Router,
		private snackBar: MatSnackBar
	) {
		Settings.defaultLocale = navigator.language

		this.currentWeekday = DateTime.now().toFormat("EEEE")
		this.currentDate = DateTime.now().toFormat("DDD")
	}

	ngOnInit() {
		this.setSize()
	}

	@HostListener("window:resize")
	setSize() {
		this.largeDateFontSize = window.innerWidth < 450 ? 21 : 24
		this.smallDateFontSize = window.innerWidth < 450 ? 15 : 16
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

	public async DeleteTodo(todo: Todo) {
		this.dataService.RemoveTodo(todo)
	}

	showEditAppointmentDialog(appointment: Appointment) {
		let startDate = DateTime.fromSeconds(appointment.start)
		let endDate = DateTime.fromSeconds(appointment.end)

		this.selectedAppointment = appointment
		this.contextMenuVisible = false
		this.editAppointmentDialogName = appointment.name
		this.editAppointmentDialogDate = startDate
		this.editAppointmentDialogSelectedColor = appointment.color
		this.editAppointmentDialogAllDay = appointment.allday
		this.editAppointmentDialogStartTimeHour = startDate.hour
		this.editAppointmentDialogStartTimeMinute = startDate.minute
		this.editAppointmentDialogEndTimeHour = endDate.hour
		this.editAppointmentDialogEndTimeMinute = endDate.minute

		this.editAppointmentDialog.show()
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

	ShowCalendarDay(date: number) {
		this.router.navigate(["/calendar/day", date])
	}

	GetLargeDate(date: number): string {
		let dateTime = DateTime.fromSeconds(date)
		let formatting = dateTime.diffNow("days").days > 6 ? "D" : "EEEE"

		return dateTime.toFormat(formatting)
	}

	GetSmallDate(date: number): string {
		let dateTime = DateTime.fromSeconds(date)
		let formatting = dateTime.diffNow("days").days > 6 ? "EEEE" : "D"

		return dateTime.toFormat(formatting)
	}

	CreateTodo(todo: Todo) {
		this.dataService.AddTodo(todo)

		// Show snackbar
		if (todo.time == 0) {
			this.snackBar.open(this.snackbarLocale.todoCreated, null, {
				duration: 3000
			})
		} else {
			this.snackBar
				.open(this.snackbarLocale.todoCreated, this.snackbarLocale.show, {
					duration: 3000
				})
				.onAction()
				.subscribe(() => {
					// Show the day of the todo
					this.router.navigate(["calendar/day", todo.time])
				})
		}

		this.dataService.AdaptSnackbarPosition()
	}

	/*
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
	*/

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

		this.dataService.UpdateAppointment(appointment)
		this.editAppointmentDialog.hide()
	}

	CreateTodoList(todoList: TodoList) {
		this.dataService.AddTodoList(todoList)

		// Show snackbar
		this.snackBar
			.open(this.snackbarLocale.todoListCreated, this.snackbarLocale.show, {
				duration: 3000
			})
			.onAction()
			.subscribe(() => {
				// Show the todo list
				this.router.navigate(["todolist", todoList.uuid])
			})

		this.dataService.AdaptSnackbarPosition()
	}
}
