import { Component, ViewChild } from "@angular/core"
import { Router } from "@angular/router"
import { DateTime } from "luxon"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"
import { CreateTodoDialogComponent } from "src/app/dialogs/create-todo-dialog/create-todo-dialog.component"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { MatSnackBar } from "@angular/material/snack-bar"
import { TodoDay, TodoGroup } from "src/app/types"

@Component({
	templateUrl: "./todos-page.component.html",
	styleUrl: "./todos-page.component.scss"
})
export class TodosPageComponent {
	locale = this.localizationService.locale.todosPage
	snackbarLocale = this.localizationService.locale.snackbar
	todosWithoutDate: Todo[] = []
	todoListsWithoutDate: TodoList[] = []
	todoDays: TodoDay[] = []
	todosWithoutGroup: Todo[] = []
	todoListsWithoutGroup: TodoList[] = []
	todoGroups: TodoGroup[] = []

	//#region CreateTodoDialog
	@ViewChild("createTodoDialog")
	createTodoDialog: CreateTodoDialogComponent
	//#endregion

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		public router: Router,
		public snackBar: MatSnackBar
	) {}

	async ngOnInit() {
		await this.dataService.todosPromiseHolder.AwaitResult()

		for (let todo of this.dataService.allTodos) {
			this.addTodo(todo)
		}

		for (let todoList of this.dataService.allTodoLists) {
			this.addTodoList(todoList)
		}
	}

	addTodo(todo: Todo) {
		if (todo.list != null) return

		// Sort by date
		if (todo.time != 0) {
			let date = DateTime.fromSeconds(todo.time)
			let formattedDate = date.toFormat("DDDD")

			// Check if the date already exists in the todoDays array
			let todoDay = this.todoDays.find(
				obj => obj.formattedDate == formattedDate
			)

			if (todoDay != null) {
				// Add the todo to the array of the todoDay
				todoDay.todos.push(todo)
			} else {
				// Add a new day to the array
				this.todoDays.push({
					date,
					formattedDate,
					todos: [todo],
					todoLists: []
				})
			}

			// Sort the todoDays array
			this.dataService.SortTodoDays(this.todoDays)
		} else {
			this.todosWithoutDate.push(todo)
		}

		// Sort by group
		if (todo.groups.length == 0) {
			this.todosWithoutGroup.push(todo)
		} else {
			for (let groupName of todo.groups) {
				// Check if the todoGroup already exists
				let i = this.todoGroups.findIndex(g => g.name == groupName)

				if (i != -1) {
					// Add the todo to the todoGroup
					this.todoGroups[i].todos.push(todo)
				} else {
					// Create the todoGroup
					this.todoGroups.push({
						name: groupName,
						todos: [todo],
						todoLists: []
					})
				}
			}
		}
	}

	addTodoList(todoList: TodoList) {
		if (todoList.list != null) return

		// Sort by date
		if (todoList.time != 0) {
			let date = DateTime.fromSeconds(todoList.time)
			let formattedDate = date.toFormat("DDDD")

			// Check if the date already exists in the todoDays array
			let todoDay = this.todoDays.find(
				obj => obj.formattedDate == formattedDate
			)

			if (todoDay != null) {
				// Add the todoList to the array of the todoDay
				todoDay.todoLists.push(todoList)
			} else {
				this.todoDays.push({
					date,
					formattedDate,
					todos: [],
					todoLists: []
				})
			}

			// Sort the todoDays array
			this.dataService.SortTodoDays(this.todoDays)
		} else {
			this.todoListsWithoutDate.push(todoList)
		}

		// Sort by group
		if (todoList.groups.length == 0) {
			this.todoListsWithoutGroup.push(todoList)
		} else {
			for (let groupName of todoList.groups) {
				// Check if the todoGroup already exists
				let i = this.todoGroups.findIndex(g => g.name == groupName)

				if (i != -1) {
					// Add the todoList to the todoGroup
					this.todoGroups[i].todoLists.push(todoList)
				} else {
					// Create the todoGroup
					this.todoGroups.push({
						name: groupName,
						todos: [],
						todoLists: [todoList]
					})
				}
			}
		}
	}

	async createTodo(event: { name: string; date: DateTime; labels: string[] }) {
		let todo = await Todo.Create(
			event.name,
			false,
			event.date.toUnixInteger(),
			event.labels
		)

		this.dataService.AddTodo(todo)
		this.createTodoDialog.hide()
	}

	/*
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
	*/

	DeleteTodo(todo: Todo) {
		this.dataService.RemoveTodo(todo)
	}

	/*
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
	*/

	// This is called when a todo list in the Sort By Groups mode was updated; Update all todo lists of the same object
	TodoListUpdated(todoListUuid: string, todoGroup: string) {
		/*
		this.dataService.UpdateTodoListsOnSortByGroupTodoPage(
			todoListUuid,
			todoGroup
		)
		*/
	}

	ShowCalendarDay(date: number) {
		this.router.navigate(["/calendar/day", date])
	}
}
