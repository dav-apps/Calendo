import { Component, ViewChild } from "@angular/core"
import { Router } from "@angular/router"
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons"
import { Todo } from "../../models/Todo"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { NewTodoModalComponent } from "src/app/components/new-todo-modal/new-todo-modal.component"
import { TodoListModalComponent } from "src/app/components/todo-list-modal/todo-list-modal.component"
import { TodoList } from "src/app/models/TodoList"
import { MatSnackBar } from "@angular/material/snack-bar"

@Component({
	templateUrl: "./todos-page.component.html",
	styleUrl: "./todos-page.component.scss"
})
export class TodosPageComponent {
	locale = this.localizationService.locale.todosPage
	snackbarLocale = this.localizationService.locale.snackbar
	faEllipsisH = faEllipsisH
	@ViewChild(NewTodoModalComponent, { static: true })
	private newTodoModalComponent: NewTodoModalComponent
	@ViewChild(TodoListModalComponent, { static: true })
	private todoListModalComponent: TodoListModalComponent

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		public router: Router,
		public snackBar: MatSnackBar
	) {}

	SortByGroupOrDate() {
		this.dataService.sortTodosByDate = !this.dataService.sortTodosByDate
		this.dataService.LoadAllTodos()
	}

	ShowNewTodoModal() {
		this.newTodoModalComponent.Show()
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

	DeleteTodo(todo: Todo) {
		this.dataService.RemoveTodo(todo)
	}

	ShowNewTodoListModal() {
		this.todoListModalComponent.Show()
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

	// This is called when a todo list in the Sort By Groups mode was updated; Update all todo lists of the same object
	TodoListUpdated(todoListUuid: string, todoGroup: string) {
		this.dataService.UpdateTodoListsOnSortByGroupTodoPage(
			todoListUuid,
			todoGroup
		)
	}

	ShowCalendarDay(date: number) {
		this.router.navigate(["/calendar/day", date])
	}
}
