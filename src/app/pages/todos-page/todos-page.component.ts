import { Component, ElementRef, ViewChild, HostListener } from "@angular/core"
import { Router } from "@angular/router"
import { trigger, state, style, animate, transition } from "@angular/animations"
import { DateTime } from "luxon"
import {
	faCircleCheck,
	faListCheck,
	faArrowRight,
	faArrowUpArrowDown
} from "@fortawesome/pro-light-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"
import { TodoDialogComponent } from "src/app/dialogs/todo-dialog/todo-dialog.component"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { SettingsService } from "src/app/services/settings-service"
import { TodoDay, TodoGroup, TodoDialogEventData } from "src/app/types"
import { sortTodoDays, createTodo } from "src/app/utils"

@Component({
	templateUrl: "./todos-page.component.html",
	styleUrl: "./todos-page.component.scss",
	animations: [
		trigger("hide", [
			state(
				"hidden",
				style({
					transform: "translateY(-10px)",
					opacity: 0,
					height: 0
				})
			),
			state(
				"visible",
				style({
					transform: "",
					opacity: 1
				})
			),
			transition("visible => hidden", [animate("200ms 0s ease-in-out")])
		])
	]
})
export class TodosPageComponent {
	locale = this.localizationService.locale.todosPage
	errorsLocale = this.localizationService.locale.errors
	miscLocale = this.localizationService.locale.misc
	faCircleCheck = faCircleCheck
	faListCheck = faListCheck
	faArrowRight = faArrowRight
	faArrowUpArrowDown = faArrowUpArrowDown
	sortTodosByDate: boolean = true
	todosWithoutDate: Todo[] = []
	todoListsWithoutDate: TodoList[] = []
	todoDays: TodoDay[] = []
	todosWithoutGroup: Todo[] = []
	todoListsWithoutGroup: TodoList[] = []
	todoGroups: TodoGroup[] = []

	//#region AddButtonContextMenu
	@ViewChild("addButtonContextMenu")
	addButtonContextMenu: ElementRef<ContextMenu>
	addButtonContextMenuVisible: boolean = false
	addButtonContextMenuPositionX: number = 0
	addButtonContextMenuPositionY: number = 0
	//#endregion

	//#region CreateTodoDialog
	@ViewChild("createTodoDialog")
	createTodoDialog: TodoDialogComponent
	//#endregion

	//#region CreateTodoListDialog
	@ViewChild("createTodoListDialog")
	createTodoListDialog: TodoDialogComponent
	//#endregion

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		private settingsService: SettingsService,
		private router: Router
	) {}

	async ngOnInit() {
		this.sortTodosByDate = await this.settingsService.getSortTodosByDate()

		await Promise.all([
			this.dataService.loadTodos(),
			this.dataService.loadTodoLists()
		])

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
			!this.addButtonContextMenu.nativeElement.contains(event.target as Node)
		) {
			this.addButtonContextMenuVisible = false
		}
	}

	addButtonClick(event: CustomEvent) {
		if (this.addButtonContextMenuVisible) {
			this.addButtonContextMenuVisible = false
		} else {
			this.addButtonContextMenuPositionX = event.detail.contextMenuPosition.x
			this.addButtonContextMenuPositionY = event.detail.contextMenuPosition.y
			this.addButtonContextMenuVisible = true
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
					calendarDayPageLink: `calendar/${date.year}/${date.month}/${date.day}`,
					todos: [todo],
					todoLists: []
				})
			}

			// Sort the todoDays array
			sortTodoDays(this.todoDays)
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
					calendarDayPageLink: `calendar/${date.year}/${date.month}/${date.day}`,
					todos: [],
					todoLists: []
				})
			}

			// Sort the todoDays array
			sortTodoDays(this.todoDays)
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

	showCreateTodoDialog() {
		this.addButtonContextMenuVisible = false
		this.createTodoDialog.reset()
		this.createTodoDialog.show()
	}

	showCreateTodoListDialog() {
		this.addButtonContextMenuVisible = false
		this.createTodoListDialog.reset()
		this.createTodoListDialog.show()
	}

	async createTodo(event: TodoDialogEventData) {
		if (event.name.length == 0) {
			this.createTodoDialog.nameError = this.errorsLocale.nameMissing
			return
		}

		let todo = await createTodo(event, this.miscLocale.todoNotificationTitle)

		this.addTodo(todo)
		this.createTodoDialog.hide()

		this.dataService.todosChanged = true
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

	sortButtonClick() {
		this.sortTodosByDate = !this.sortTodosByDate
		this.settingsService.setSortTodosByDate(this.sortTodosByDate)
	}

	todoDayMoreButtonClick(event: MouseEvent, todoDay: TodoDay) {
		event.preventDefault()
		this.dataService.contentContainer.scrollTo(0, 0)
		this.router.navigate([todoDay.calendarDayPageLink])
	}

	todoListMoreButtonClick(item: TodoList) {
		this.dataService.contentContainer.scrollTo(0, 0)
		this.router.navigate(["todolist", item.uuid])
	}
}
