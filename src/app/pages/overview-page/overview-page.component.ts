import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { Router } from "@angular/router"
import { Settings, DateTime } from "luxon"
import {
	faArrowRight,
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
import {
	sortAppointments,
	sortTodos,
	sortTodoLists,
	showEditAppointmentDialog,
	createAppointment,
	updateAppointment,
	createTodo,
	showToast
} from "src/app/utils"
import {
	StartDay,
	AppointmentDialogEventData,
	TodoDialogEventData
} from "src/app/types"

@Component({
	templateUrl: "./overview-page.component.html",
	styleUrl: "./overview-page.component.scss",
	standalone: false
})
export class OverviewPageComponent {
	locale = this.localizationService.locale.overviewPage
	actionsLocale = this.localizationService.locale.actions
	errorsLocale = this.localizationService.locale.errors
	miscLocale = this.localizationService.locale.misc
	faArrowRight = faArrowRight
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
		formattedDate: this.getFormattedDate(DateTime.now()),
		shortTopFormattedDate: this.getShortTopFormattedDate(DateTime.now()),
		shortBottomFormattedDate: this.getShortBottomFormattedDate(
			DateTime.now()
		),
		calendarDayPageLink: "",
		appointments: [],
		todos: [],
		todoLists: []
	}
	days: StartDay[] = []
	showAppointmentsColumn: boolean = true
	showTodosColumn: boolean = true

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
		private router: Router
	) {
		this.currentWeekday = DateTime.now().toFormat("EEEE", {
			locale: this.dataService.locale
		})
		this.currentDate = DateTime.now().toFormat("DDD", {
			locale: this.dataService.locale
		})
	}

	async ngOnInit() {
		await Promise.all([
			this.dataService.loadAppointments(),
			this.dataService.loadTodos(),
			this.dataService.loadTodoLists()
		])

		for (let appointment of this.dataService.allAppointments) {
			this.addAppointment(appointment)
		}

		for (let todo of this.dataService.allTodos) {
			this.addTodo(todo)
		}

		for (let todoList of this.dataService.allTodoLists) {
			this.addTodoList(todoList)
		}

		this.updateShowAppointmentsColumn()
		this.updateShowTodosColumn()

		window.addEventListener("overviewpage-scrolltop", () => {
			this.dataService.contentContainer.scrollTo({
				top: 0,
				behavior: "smooth"
			})
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

		let formattedDate = this.getFormattedDate(date)
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
				shortTopFormattedDate: this.getShortTopFormattedDate(date),
				shortBottomFormattedDate: this.getShortBottomFormattedDate(date),
				calendarDayPageLink: `calendar/${date.year}/${date.month}/${date.day}`,
				appointments: [appointment],
				todos: [],
				todoLists: []
			})

			// Sort the days
			this.sortDays()
		}
	}

	removeAppointment(appointment: Appointment) {
		let date = DateTime.fromSeconds(appointment.start)
		if (date < DateTime.now().startOf("day")) return

		if (date.hasSame(this.currentDay.date, "day")) {
			let i = this.currentDay.appointments.findIndex(
				a => a.uuid == appointment.uuid
			)

			if (i != -1) this.currentDay.appointments.splice(i, 1)
			return
		}

		let formattedDate = this.getFormattedDate(date)
		let i = this.days.findIndex(day => day.formattedDate == formattedDate)
		if (i == -1) return

		let day = this.days[i]

		let j = day.appointments.findIndex(a => a.uuid == appointment.uuid)
		if (j == -1) return

		day.appointments.splice(j, 1)

		if (
			day.appointments.length == 0 &&
			day.todos.length == 0 &&
			day.todoLists.length == 0
		) {
			// Remove the day
			this.days.splice(i, 1)
		}
	}

	addTodo(todo: Todo) {
		if (todo.list != null) return

		let date = DateTime.fromSeconds(todo.time)

		if (
			todo.time == 0 ||
			date.hasSame(this.currentDay.date, "day") ||
			date < this.currentDay.date
		) {
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

		if (date < DateTime.now()) return

		let formattedDate = this.getFormattedDate(date)
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
				shortTopFormattedDate: this.getShortTopFormattedDate(date),
				shortBottomFormattedDate: this.getShortBottomFormattedDate(date),
				calendarDayPageLink: `calendar/${date.year}/${date.month}/${date.day}`,
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

		if (
			todoList.time == 0 ||
			date.hasSame(this.currentDay.date, "day") ||
			date < this.currentDay.date
		) {
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

		if (date < DateTime.now()) return

		let formattedDate = this.getFormattedDate(date)
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
				shortTopFormattedDate: this.getShortTopFormattedDate(date),
				shortBottomFormattedDate: this.getShortBottomFormattedDate(date),
				calendarDayPageLink: `calendar/${date.year}/${date.month}/${date.day}`,
				appointments: [],
				todos: [],
				todoLists: [todoList]
			})

			// Sort the days
			this.sortDays()
		}
	}

	removeTodo(todo: Todo) {
		let date = DateTime.fromSeconds(todo.time)
		if (date < DateTime.now().startOf("day")) return

		if (date.hasSame(this.currentDay.date, "day")) {
			let i = this.currentDay.todos.findIndex(a => a.uuid == todo.uuid)

			if (i != -1) this.currentDay.todos.splice(i, 1)
			return
		}

		let formattedDate = this.getFormattedDate(date)
		let i = this.days.findIndex(day => day.formattedDate == formattedDate)
		if (i == -1) return

		let day = this.days[i]

		let j = day.todos.findIndex(a => a.uuid == todo.uuid)
		if (j == -1) return

		day.todos.splice(j, 1)

		if (
			day.appointments.length == 0 &&
			day.todos.length == 0 &&
			day.todoLists.length == 0
		) {
			// Remove the day
			this.days.splice(i, 1)
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

	showCreateTodoDialog() {
		this.todoAddButtonContextMenuVisible = false
		this.appointmentContextMenuVisible = false

		this.createTodoDialog.reset()
		this.createTodoDialog.show()
	}

	showCreateTodoListDialog() {
		this.todoAddButtonContextMenuVisible = false
		this.appointmentContextMenuVisible = false

		this.createTodoListDialog.reset()
		this.createTodoListDialog.show()
	}

	showCreateAppointmentDialog() {
		this.todoAddButtonContextMenuVisible = false
		this.appointmentContextMenuVisible = false

		this.createAppointmentDialog.reset()
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

	async deleteAppointment() {
		this.deleteAppointmentDialog.hide()
		this.removeAppointment(this.selectedAppointment)

		await this.selectedAppointment.Delete()
		this.selectedAppointment = null

		this.updateShowAppointmentsColumn()
		this.dataService.appointmentsChanged = true
	}

	todoDeleted(todo: Todo) {
		this.removeTodo(todo)
		this.updateShowTodosColumn()
	}

	getFormattedDate(date: DateTime): string {
		return date.toFormat("DDDD", {
			locale: this.dataService.locale
		})
	}

	getShortTopFormattedDate(date: DateTime): string {
		return date.toFormat(date.diffNow("days").days > 6 ? "D" : "EEEE", {
			locale: this.dataService.locale
		})
	}

	getShortBottomFormattedDate(date: DateTime): string {
		return date.toFormat(date.diffNow("days").days > 6 ? "EEEE" : "D", {
			locale: this.dataService.locale
		})
	}

	async createTodo(event: TodoDialogEventData) {
		if (event.name.length == 0) {
			this.createTodoDialog.nameError = this.errorsLocale.nameMissing
			return
		}

		let todo = await createTodo(event, this.miscLocale.todoNotificationTitle)

		this.addTodo(todo)
		this.createTodoDialog.hide()

		this.updateShowTodosColumn()
		this.dataService.todosChanged = true

		showToast(
			this.miscLocale.createTodoToastText,
			this.dataService.isMobile ? 80 : 0
		)
	}

	async createTodoList(event: TodoDialogEventData) {
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

		this.addTodoList(todoList)
		this.createTodoListDialog.hide()

		this.dataService.todoListsChanged = true

		// Navigate to TodoListPage
		this.router.navigate(["todolist", todoList.uuid])
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

		this.updateShowAppointmentsColumn()
		this.dataService.appointmentsChanged = true

		showToast(
			this.miscLocale.createAppointmentToastText,
			this.dataService.isMobile ? 80 : 0
		)
	}

	async updateAppointment(event: AppointmentDialogEventData) {
		if (event.name.length == 0) {
			this.editAppointmentDialog.nameError = this.errorsLocale.nameMissing
			return
		}

		let appointment = this.selectedAppointment
		await updateAppointment(event, appointment, this.miscLocale.fullDayEvent)

		this.addAppointment(appointment)
		this.editAppointmentDialog.hide()

		this.dataService.appointmentsChanged = true
	}

	updateShowAppointmentsColumn() {
		for (let day of this.days) {
			if (day.appointments.length > 0) {
				this.showAppointmentsColumn = true
				return
			}
		}

		this.showAppointmentsColumn = false
	}

	updateShowTodosColumn() {
		for (let day of this.days) {
			if (day.todos.length > 0 || day.todoLists.length > 0) {
				this.showTodosColumn = true
				return
			}
		}

		this.showTodosColumn = false
	}

	startDayMoreButtonClick(event: MouseEvent, startDay: StartDay) {
		event.preventDefault()
		this.dataService.contentContainer.scrollTo(0, 0)
		this.router.navigate([startDay.calendarDayPageLink])
	}

	todoListMoreButtonClick(item: TodoList) {
		this.dataService.contentContainer.scrollTo(0, 0)
		this.router.navigate(["todolist", item.uuid])
	}
}
