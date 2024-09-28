import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { Location } from "@angular/common"
import { Router, ActivatedRoute } from "@angular/router"
import { DateTime } from "luxon"
import {
	faPlus,
	faEdit,
	faTrash,
	faCircleCheck,
	faListCheck
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
import {
	sortAppointments,
	sortTodos,
	sortTodoLists,
	showEditAppointmentDialog
} from "src/app/utils"

@Component({
	templateUrl: "./calendar-day-page.component.html",
	styleUrl: "./calendar-day-page.component.scss"
})
export class CalendarDayPageComponent {
	locale = this.localizationService.locale.calendarDayPage
	actionsLocale = this.localizationService.locale.actions
	errorsLocale = this.localizationService.locale.errors
	faPlus = faPlus
	faEdit = faEdit
	faTrash = faTrash
	faCircleCheck = faCircleCheck
	faListCheck = faListCheck
	title: string = ""
	date = DateTime.now().startOf("day")
	isDateBeforeToday: boolean = false
	appointments: Appointment[] = []
	todos: Todo[] = []
	todoLists: TodoList[] = []
	selectedAppointment: Appointment = null

	//#region TodoAddButtonContextMenu
	@ViewChild("todoAddButtonContextMenu")
	todoAddButtonContextMenu: ElementRef<ContextMenu>
	todoAddButtonContextMenuVisible: boolean = false
	todoAddButtonContextMenuPositionX: number = 0
	todoAddButtonContextMenuPositionY: number = 0
	//#endregion

	//#region AppointmentContextMenu
	@ViewChild("appointmentContextMenu")
	appointmentContextMenu: ElementRef<ContextMenu>
	appointmentContextMenuVisible: boolean = false
	appointmentContextMenuPositionX: number = 0
	appointmentContextMenuPositionY: number = 0
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

	//#region CreateTodoListDialog
	@ViewChild("createTodoListDialog")
	createTodoListDialog: TodoDialogComponent
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
		await Promise.all([
			this.dataService.loadAppointments(),
			this.dataService.loadTodos(),
			this.dataService.loadTodoLists()
		])

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
				this.todos = this.dataService.getTodosOfDay(this.date, true)
				this.todoLists = this.dataService.getTodoListsOfDay(this.date)
			}
		})
	}

	@HostListener("document:click", ["$event"])
	documentClick(event: MouseEvent) {
		if (
			!this.todoAddButtonContextMenu.nativeElement.contains(
				event.target as Node
			) &&
			!this.appointmentContextMenu.nativeElement.contains(
				event.target as Node
			)
		) {
			this.todoAddButtonContextMenuVisible = false
			this.appointmentContextMenuVisible = false
		}
	}

	todoAddButtonClick(event: CustomEvent) {
		if (this.todoAddButtonContextMenuVisible) {
			this.todoAddButtonContextMenuVisible = false
		} else {
			this.todoAddButtonContextMenuPositionX =
				event.detail.contextMenuPosition.x
			this.todoAddButtonContextMenuPositionY =
				event.detail.contextMenuPosition.y
			this.todoAddButtonContextMenuVisible = true
		}
	}

	smallAppointmentItemContextMenu(
		event: PointerEvent,
		appointment: Appointment
	) {
		event.preventDefault()

		this.selectedAppointment = appointment
		this.appointmentContextMenuPositionX = event.pageX
		this.appointmentContextMenuPositionY =
			event.pageY + this.dataService.contentContainer.scrollTop
		this.appointmentContextMenuVisible = true
	}

	removeAppointment(appointment: Appointment) {
		let i = this.appointments.findIndex(a => a.uuid == appointment.uuid)
		if (i != -1) this.appointments.splice(i, 1)
	}

	showCreateAppointmentDialog() {
		this.createAppointmentDialog.reset()
		this.createAppointmentDialog.date = this.date
		this.createAppointmentDialog.show()
	}

	async showEditAppointmentDialog(appointment: Appointment) {
		this.selectedAppointment = appointment
		this.appointmentContextMenuVisible = false

		await showEditAppointmentDialog(appointment, this.editAppointmentDialog)
	}

	showDeleteAppointmentDialog(appointment: Appointment) {
		this.selectedAppointment = appointment
		this.appointmentContextMenuVisible = false
		this.deleteAppointmentDialog.show()
	}

	showCreateTodoDialog() {
		this.todoAddButtonContextMenuVisible = false
		this.appointmentContextMenuVisible = false

		this.createTodoDialog.reset()
		this.createTodoDialog.saveDate = true
		this.createTodoDialog.date = this.date
		this.createTodoDialog.show()
	}

	showCreateTodoListDialog() {
		this.todoAddButtonContextMenuVisible = false
		this.appointmentContextMenuVisible = false

		this.createTodoListDialog.reset()
		this.createTodoListDialog.saveDate = true
		this.createTodoListDialog.date = this.date
		this.createTodoListDialog.show()
	}

	async deleteAppointment() {
		this.deleteAppointmentDialog.hide()
		this.removeAppointment(this.selectedAppointment)

		await this.selectedAppointment.Delete()
		this.selectedAppointment = null
		this.dataService.appointmentsChanged = true
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
			this.createAppointmentDialog.nameError = this.errorsLocale.nameMissing
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

		this.dataService.appointmentsChanged = true
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
			this.editAppointmentDialog.nameError = this.errorsLocale.nameMissing
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

		this.dataService.appointmentsChanged = true
	}

	async createTodo(event: { name: string; date: DateTime; labels: string[] }) {
		if (event.name.length == 0) {
			this.createTodoDialog.nameError = this.errorsLocale.nameMissing
			return
		}

		let todo = await Todo.Create(
			event.name,
			false,
			event.date.toUnixInteger(),
			event.labels
		)

		this.todos.push(todo)
		sortTodos(this.todos)

		this.createTodoDialog.hide()

		this.dataService.todosChanged = true
	}

	async createTodoList(event: {
		name: string
		date: DateTime
		labels: string[]
	}) {
		if (event.name.length == 0) {
			this.createTodoListDialog.nameError = this.errorsLocale.nameMissing
			return
		}

		let todoList = await TodoList.Create(
			event.name,
			event.date?.toUnixInteger(),
			[],
			event.labels
		)

		this.todoLists.push(todoList)
		sortTodoLists(this.todoLists)

		this.createTodoListDialog.hide()

		this.dataService.todoListsChanged = true

		// Navigate to TodoListPage
		this.router.navigate(["todolist", todoList.uuid])
	}

	goBack() {
		this.location.back()
	}

	todoListMoreButtonClick(item: TodoList) {
		this.dataService.contentContainer.scrollTo(0, 0)
		this.router.navigate(["todolist", item.uuid])
	}
}
