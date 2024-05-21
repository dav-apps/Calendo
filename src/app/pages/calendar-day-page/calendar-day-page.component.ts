import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { DateTime } from "luxon"
import {
	faEdit as faEditLight,
	faTrash as faTrashLight
} from "@fortawesome/pro-light-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { CreateAppointmentDialogComponent } from "src/app/dialogs/create-appointment-dialog/create-appointment-dialog.component"
import { CreateTodoDialogComponent } from "src/app/dialogs/create-todo-dialog/create-todo-dialog.component"
import { DeleteAppointmentDialogComponent } from "src/app/dialogs/delete-appointment-dialog/delete-appointment-dialog.component"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { Appointment } from "src/app/models/Appointment"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"
import { MatSnackBar } from "@angular/material/snack-bar"
import { Location } from "@angular/common"

@Component({
	templateUrl: "./calendar-day-page.component.html",
	styleUrl: "./calendar-day-page.component.scss"
})
export class CalendarDayPageComponent {
	locale = this.localizationService.locale.calendarDayPage
	actionsLocale = this.localizationService.locale.actions
	snackbarLocale = this.localizationService.locale.snackbar
	faEditLight = faEditLight
	faTrashLight = faTrashLight
	title: string = ""
	date = DateTime.now().startOf("day")
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
			let year = Number(param.year)
			let month = Number(param.month)
			let day = Number(param.day)

			if (isNaN(year) || isNaN(month) || isNaN(day)) {
				this.router.navigate(["/"])
			} else {
				this.date = DateTime.now().set({ year, month, day })
				this.title = this.date.toFormat("DDDD")
				this.dataService.selectedDay = this.date

				this.dataService.LoadAllAppointments()
				this.dataService.LoadAllTodos()
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
