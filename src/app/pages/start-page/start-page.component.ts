import { Component, ViewChild } from "@angular/core"
import { Router } from "@angular/router"
import * as moment from "moment"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { NewTodoModalComponent } from "src/app/components/new-todo-modal/new-todo-modal.component"
import { AppointmentModalComponent } from "src/app/components/appointment-modal/appointment-modal.component"
import { TodoListModalComponent } from "src/app/components/todo-list-modal/todo-list-modal.component"
import { Appointment } from "src/app/models/Appointment"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { MatSnackBar } from "@angular/material/snack-bar"

@Component({
	selector: "calendo-start-page",
	templateUrl: "./start-page.component.html"
})
export class StartPageComponent {
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

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		private router: Router,
		private snackBar: MatSnackBar
	) {
		moment.locale(this.dataService.locale)

		this.largeDateFormat = this.locale.formats.largeDate
		this.smallDateFormat = this.locale.formats.smallDate
	}

	ngOnInit() {
		this.setSize()
	}

	public async DeleteTodo(todo: Todo) {
		this.dataService.RemoveTodo(todo)
	}

	ShowCalendarDay(date: number) {
		this.router.navigate(["/calendar/day", date])
	}

	GetLargeDate(date: number): string {
		let momentDate = moment.unix(date)
		let format =
			momentDate.diff(moment(), "days") > 6
				? this.smallDateFormat
				: this.largeDateFormat
		return momentDate.format(format)
	}

	GetSmallDate(date: number): string {
		let momentDate = moment.unix(date)
		let format =
			momentDate.diff(moment(), "days") > 6
				? this.largeDateFormat
				: this.smallDateFormat
		return momentDate.format(format)
	}

	GetCurrentWeekday() {
		return moment().format("dddd")
	}

	GetCurrentDate() {
		return moment().format("LL")
	}

	ShowModal(index: number) {
		switch (index) {
			case 0:
				// Show the appointment modal
				this.newAppointmentModalComponent.Show()
				break
			case 1:
				// Show the todo modal
				this.newTodoModalComponent.Show()
				break
			case 2:
				// Show the todo list modal
				this.todoListModalComponent.Show()
				break
		}
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

	onResize() {
		this.setSize()
	}

	setSize() {
		this.largeDateFontSize = window.innerWidth < 450 ? 21 : 24
		this.smallDateFontSize = window.innerWidth < 450 ? 15 : 16
	}
}
