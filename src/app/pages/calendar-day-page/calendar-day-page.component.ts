import { Component, ViewChild } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { DateTime } from "luxon"
import { CreateAppointmentDialogComponent } from "src/app/dialogs/create-appointment-dialog/create-appointment-dialog.component"
import { CreateTodoDialogComponent } from "src/app/dialogs/create-todo-dialog/create-todo-dialog.component"
import { DeleteAppointmentDialogComponent } from "src/app/dialogs/delete-appointment-dialog/delete-appointment-dialog.component"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { Appointment } from "src/app/models/Appointment"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { MatSnackBar } from "@angular/material/snack-bar"
import { Location } from "@angular/common"

@Component({
	templateUrl: "./calendar-day-page.component.html"
})
export class CalendarDayPageComponent {
	locale = this.localizationService.locale.calendarDayPage
	snackbarLocale = this.localizationService.locale.snackbar
	faPlus = faPlus
	title: string = ""
	date = DateTime.now().startOf("day")
	backButtonIconStyles = {
		root: {
			fontSize: 19
		}
	}

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
		private route: ActivatedRoute,
		private location: Location,
		private snackBar: MatSnackBar
	) {}

	ngOnInit() {
		this.route.params.subscribe(param => {
			if (param.time) {
				this.date = DateTime.fromSeconds(param.time).startOf("day")
				this.title = this.date.toFormat("DDDD")
				this.dataService.selectedDay = this.date

				this.dataService.LoadAllAppointments()
				this.dataService.LoadAllTodos()
			}
		})

		this.title = this.date.toFormat("DDDD")
	}

	CreateAppointment(appointment: Appointment) {
		this.dataService.AddAppointment(appointment)

		// Show snackbar if the appointment was created for another day
		if (
			this.date.toUnixInteger() !=
			DateTime.fromSeconds(appointment.start).startOf("day").toUnixInteger()
		) {
			// Another day
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
	}

	CreateTodo(todo: Todo) {
		this.dataService.AddTodo(todo)

		// Show snackbar if the todo was created for another day
		if (todo.time == 0) {
			// Show snackbar without action
			this.snackBar.open(this.snackbarLocale.todoCreated, null, {
				duration: 3000
			})
		} else if (this.date.toUnixInteger() != todo.time) {
			// Another day
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

	DeleteTodo(todo: Todo) {
		this.dataService.RemoveTodo(todo)
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

	GoBack() {
		this.location.back()
	}
}
