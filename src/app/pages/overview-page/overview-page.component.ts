import { Component, ViewChild, HostListener } from "@angular/core"
import { Router } from "@angular/router"
import { Settings, DateTime } from "luxon"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"
import { CreateAppointmentDialogComponent } from "src/app/dialogs/create-appointment-dialog/create-appointment-dialog.component"
import { CreateTodoDialogComponent } from "src/app/dialogs/create-todo-dialog/create-todo-dialog.component"
import { DeleteAppointmentDialogComponent } from "src/app/dialogs/delete-appointment-dialog/delete-appointment-dialog.component"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { NewTodoModalComponent } from "src/app/components/new-todo-modal/new-todo-modal.component"
import { AppointmentModalComponent } from "src/app/components/appointment-modal/appointment-modal.component"
import { TodoListModalComponent } from "src/app/components/todo-list-modal/todo-list-modal.component"
import { Appointment } from "src/app/models/Appointment"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { MatSnackBar } from "@angular/material/snack-bar"

@Component({
	templateUrl: "./overview-page.component.html",
	styleUrl: "./overview-page.component.scss"
})
export class OverviewPageComponent {
	locale = this.localizationService.locale.startPage
	snackbarLocale = this.localizationService.locale.snackbar
	faPlus = faPlus
	@ViewChild(NewTodoModalComponent, { static: true })
	private newTodoModalComponent: NewTodoModalComponent
	@ViewChild(AppointmentModalComponent, { static: true })
	private newAppointmentModalComponent: AppointmentModalComponent
	@ViewChild(TodoListModalComponent, { static: true })
	private todoListModalComponent: TodoListModalComponent

	largeDateFormat: string = this.locale.formats.smallDate
	smallDateFormat: string = this.locale.formats.largeDate
	largeDateFontSize: number = 24
	smallDateFontSize: number = 16

	currentWeekday: string = ""
	currentDate: string = ""

	//#region CreateAppointmentDialog
	@ViewChild("createAppointmentDialog")
	createAppointmentDialog: CreateAppointmentDialogComponent
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

		this.largeDateFormat = this.locale.formats.largeDate
		this.smallDateFormat = this.locale.formats.smallDate
	}

	ngOnInit() {
		this.setSize()
	}

	@HostListener("window:resize")
	setSize() {
		this.largeDateFontSize = window.innerWidth < 450 ? 21 : 24
		this.smallDateFontSize = window.innerWidth < 450 ? 15 : 16
	}

	public async DeleteTodo(todo: Todo) {
		this.dataService.RemoveTodo(todo)
	}

	ShowCalendarDay(date: number) {
		this.router.navigate(["/calendar/day", date])
	}

	GetLargeDate(date: number): string {
		let dateTime = DateTime.fromSeconds(date)
		let formatting =
			dateTime.diffNow("days").days > 6
				? this.smallDateFormat
				: this.largeDateFormat

		return dateTime.toFormat(formatting)
	}

	GetSmallDate(date: number): string {
		let dateTime = DateTime.fromSeconds(date)
		let formatting =
			dateTime.diffNow("days").days > 6
				? this.largeDateFormat
				: this.smallDateFormat

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
