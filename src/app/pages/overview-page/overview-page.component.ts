import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { Settings, DateTime } from "luxon"
import {
	faPlus,
	faEdit,
	faTrash,
	faCircleCheck,
	faListCheck
} from "@fortawesome/pro-light-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { Appointment } from "src/app/models/Appointment"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"
import { AppointmentDialogComponent } from "src/app/dialogs/appointment-dialog/appointment-dialog.component"
import { TodoDialogComponent } from "src/app/dialogs/todo-dialog/todo-dialog.component"
import { DeleteAppointmentDialogComponent } from "src/app/dialogs/delete-appointment-dialog/delete-appointment-dialog.component"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { sortAppointments, sortTodos, sortTodoLists } from "src/app/utils"
import { StartDay } from "src/app/types"

@Component({
	templateUrl: "./overview-page.component.html",
	styleUrl: "./overview-page.component.scss"
})
export class OverviewPageComponent {
	locale = this.localizationService.locale.overviewPage
	actionsLocale = this.localizationService.locale.actions
	faPlus = faPlus
	faEdit = faEdit
	faTrash = faTrash
	faCircleCheck = faCircleCheck
	faListCheck = faListCheck
	selectedAppointment: Appointment = null

	currentWeekday: string = ""
	currentDate: string = ""

	currentDay: StartDay = {
		date: DateTime.now(),
		formattedDate: DateTime.now().toFormat("DDDD"),
		appointments: [],
		todos: [],
		todoLists: []
	}
	days: StartDay[] = []

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
		private localizationService: LocalizationService
	) {
		Settings.defaultLocale = navigator.language

		this.currentWeekday = DateTime.now().toFormat("EEEE")
		this.currentDate = DateTime.now().toFormat("DDD")
	}

	async ngOnInit() {
		await this.dataService.appointmentsPromiseHolder.AwaitResult()
		await this.dataService.todosPromiseHolder.AwaitResult()

		for (let appointment of this.dataService.allAppointments) {
			this.addAppointment(appointment)
		}

		for (let todo of this.dataService.allTodos) {
			this.addTodo(todo)
		}

		for (let todoList of this.dataService.allTodoLists) {
			this.addTodoList(todoList)
		}
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

	addAppointment(appointment: Appointment) {
		let date = DateTime.fromSeconds(appointment.start)
		if (date < DateTime.now().startOf("day")) return

		if (date.hasSame(this.currentDay.date, "day")) {
			let i = this.currentDay.appointments.findIndex(
				a => a.uuid == appointment.uuid
			)

			if (i != -1) {
				// Replace the appointment
				this.currentDay.appointments[i] = appointment
			} else {
				// Add the appointment
				this.currentDay.appointments.push(appointment)
			}

			sortAppointments(this.currentDay.appointments)
			return
		}

		let formattedDate = date.toFormat("DDDD")
		let day = this.days.find(day => day.formattedDate == formattedDate)

		if (day != null) {
			let i = day.appointments.findIndex(a => a.uuid == appointment.uuid)

			if (i != -1) {
				// Replace the appointment
				day.appointments[i] = appointment
			} else {
				// Add the appointment
				day.appointments.push(appointment)
			}

			sortAppointments(day.appointments)
		} else {
			// Create a new day
			this.days.push({
				date,
				formattedDate,
				appointments: [appointment],
				todos: [],
				todoLists: []
			})

			// Sort the days
			this.sortDays()
		}
	}

	removeAppointment(appointment) {
		let date = DateTime.fromSeconds(appointment.start)
		if (date < DateTime.now().startOf("day")) return

		if (date.hasSame(this.currentDay.date, "day")) {
			let i = this.currentDay.appointments.findIndex(
				a => a.uuid == appointment.uuid
			)

			if (i != -1) this.currentDay.appointments.splice(i, 1)
			return
		}

		let formattedDate = date.toFormat("DDDD")
		let day = this.days.find(day => day.formattedDate == formattedDate)

		if (day != null) {
			let i = day.appointments.findIndex(a => a.uuid == appointment.uuid)
			if (i != -1) day.appointments.splice(i, 1)
		}
	}

	addTodo(todo: Todo) {
		if (todo.list != null) return

		let date = DateTime.fromSeconds(todo.time)
		if (date < DateTime.now().startOf("day")) return

		if (date.hasSame(this.currentDay.date, "day")) {
			let i = this.currentDay.todos.findIndex(t => t.uuid == todo.uuid)

			if (i != -1) {
				// Replace the todo
				this.currentDay.todos[i] = todo
			} else {
				// Add the todo
				this.currentDay.todos.push(todo)
			}

			sortTodos(this.currentDay.todos)
			return
		}

		let formattedDate = date.toFormat("DDDD")
		let day = this.days.find(day => day.formattedDate == formattedDate)

		if (day != null) {
			let i = day.todos.findIndex(t => t.uuid == todo.uuid)

			if (i != -1) {
				// Replace the todo
				day.todos[i] = todo
			} else {
				// Add the todo
				day.todos.push(todo)
			}

			sortTodos(day.todos)
		} else {
			// Create a new day
			this.days.push({
				date,
				formattedDate,
				appointments: [],
				todos: [todo],
				todoLists: []
			})

			// Sort the days
			this.sortDays()
		}
	}

	addTodoList(todoList: TodoList) {
		if (todoList.list != null) return

		let date = DateTime.fromSeconds(todoList.time)
		if (date < DateTime.now()) return

		if (date.hasSame(this.currentDay.date, "day")) {
			let i = this.currentDay.todoLists.findIndex(
				t => t.uuid == todoList.uuid
			)

			if (i != -1) {
				// Replace the todo list
				this.currentDay.todoLists[i] = todoList
			} else {
				// Add the todo
				this.currentDay.todoLists.push(todoList)
			}

			sortTodoLists(this.currentDay.todoLists)
			return
		}

		let formattedDate = date.toFormat("DDDD")
		let day = this.days.find(day => day.formattedDate == formattedDate)

		if (day != null) {
			let i = day.todoLists.findIndex(t => t.uuid == todoList.uuid)

			if (i != -1) {
				// Replace the todo list
				day.todoLists[i] = todoList
			} else {
				// Add the todo
				day.todoLists.push(todoList)
			}

			sortTodoLists(day.todoLists)
		} else {
			// Create a new day
			this.days.push({
				date,
				formattedDate,
				appointments: [],
				todos: [],
				todoLists: [todoList]
			})

			// Sort the days
			this.sortDays()
		}
	}

	sortDays() {
		this.days.sort((a: StartDay, b: StartDay) => {
			if (a.date < b.date) {
				return -1
			} else if (a.date > b.date) {
				return 1
			} else {
				return 0
			}
		})
	}

	showCreateAppointmentDialog() {
		this.todoAddButtonContextMenuVisible = false
		this.appointmentContextMenuVisible = false
		this.createAppointmentDialog.show()
	}

	showEditAppointmentDialog(appointment: Appointment) {
		let startDate = DateTime.fromSeconds(appointment.start)
		let endDate = DateTime.fromSeconds(appointment.end)

		this.selectedAppointment = appointment
		this.appointmentContextMenuVisible = false
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
		this.appointmentContextMenuVisible = false
		this.deleteAppointmentDialog.show()
	}

	async deleteAppointment() {
		this.deleteAppointmentDialog.hide()
		this.removeAppointment(this.selectedAppointment)

		await this.selectedAppointment.Delete()
		this.selectedAppointment = null
	}

	GetLargeDate(date: DateTime): string {
		let formatting = date.diffNow("days").days > 6 ? "D" : "EEEE"

		return date.toFormat(formatting)
	}

	GetSmallDate(date: DateTime): string {
		let formatting = date.diffNow("days").days > 6 ? "EEEE" : "D"

		return date.toFormat(formatting)
	}

	async createTodo(event: { name: string; date: DateTime; labels: string[] }) {
		let todo = await Todo.Create(
			event.name,
			false,
			event.date.toUnixInteger(),
			event.labels
		)

		this.addTodo(todo)
		this.createTodoDialog.hide()
	}

	async createTodoList(event: {
		name: string
		date: DateTime
		labels: string[]
	}) {
		let todoList = await TodoList.Create(
			event.name,
			event.date?.toUnixInteger(),
			[],
			event.labels
		)

		this.addTodoList(todoList)
		this.createTodoListDialog.hide()
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

		this.addAppointment(appointment)
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

		this.addAppointment(appointment)
		this.editAppointmentDialog.hide()
	}
}
