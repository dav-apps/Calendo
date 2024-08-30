import { Injectable } from "@angular/core"
import { DateTime } from "luxon"
import { Todo, GetAllTodos } from "../models/Todo"
import { Appointment, GetAllAppointments } from "../models/Appointment"
import { TodoList, GetAllTodoLists } from "../models/TodoList"
import { Dav, PromiseHolder } from "dav-js"
import * as DavUIComponents from "dav-ui-components"
import { SettingsService } from "./settings-service"
import { sortAppointments, convertStringToTheme } from "src/app/utils"
import { Theme } from "src/app/types"
import { themeKey, lightThemeKey, darkThemeKey } from "src/app/constants"

@Injectable()
export class DataService {
	dav = Dav
	locale: string = navigator.language
	userPromiseHolder = new PromiseHolder()
	appointmentsPromiseHolder = new PromiseHolder()
	todosPromiseHolder = new PromiseHolder()
	todoListsPromiseHolder = new PromiseHolder()
	updateInstalled: boolean = false

	allAppointments: Appointment[] = []
	allTodos: Todo[] = []
	allTodoLists: TodoList[] = []
	appointmentsChanged: boolean = true
	todosChanged: boolean = true
	todoListsChanged: boolean = true

	//#region All pages
	sortTodosByDate: boolean = true
	isMobile: boolean = false
	darkTheme: boolean = false
	contentContainer: HTMLDivElement = null
	isLoadingAllAppointments: boolean = false
	isLoadingAllTodos: boolean = false
	isLoadingAllTodoLists: boolean = false
	updatedTodoLists: string[] = []
	//#endregion

	constructor(private settingsService: SettingsService) {
		this.loadAllAppointments()
		this.loadAllTodos()
		this.loadAllTodoLists()
	}

	async loadTheme(theme?: Theme) {
		if (theme == null) {
			// Get the theme from the settings
			theme = convertStringToTheme(await this.settingsService.getTheme())
		}

		switch (theme) {
			case Theme.Dark:
				this.darkTheme = true
				break
			case Theme.System:
				// Get the browser theme
				let darkTheme = false

				if (window.matchMedia) {
					let colorScheme = window.matchMedia(
						"(prefers-color-scheme: dark)"
					)

					darkTheme = colorScheme.matches
					colorScheme.onchange = () => this.loadTheme()
				}

				this.darkTheme = darkTheme
				break
			default:
				this.darkTheme = false
				break
		}

		document.body.setAttribute(
			themeKey,
			this.darkTheme ? darkThemeKey : lightThemeKey
		)

		DavUIComponents.setTheme(
			this.darkTheme
				? DavUIComponents.Theme.dark
				: DavUIComponents.Theme.light
		)
	}

	private async loadAllAppointments() {
		if (this.isLoadingAllAppointments) return
		this.isLoadingAllAppointments = true

		this.allAppointments = []

		var appointments = await GetAllAppointments()

		for (let appointment of appointments) {
			this.allAppointments.push(appointment)
		}

		this.isLoadingAllAppointments = false
		this.appointmentsChanged = false
		this.appointmentsPromiseHolder.Resolve()
	}

	private async loadAllTodos() {
		if (this.isLoadingAllTodos) return
		this.isLoadingAllTodos = true

		this.allTodos = []

		// Load todos
		var todos = await GetAllTodos()

		for (let todo of todos) {
			this.allTodos.push(todo)
		}

		this.isLoadingAllTodos = false
		this.todosChanged = false
		this.todosPromiseHolder.Resolve()
	}

	private async loadAllTodoLists() {
		if (this.isLoadingAllTodoLists) return
		this.isLoadingAllTodoLists = true

		this.allTodoLists = []

		// Load todo lists
		let todoLists = await GetAllTodoLists()

		for (let todoList of todoLists) {
			this.allTodoLists.push(todoList)
		}

		this.isLoadingAllTodoLists = false
		this.todoListsChanged = false
		this.todoListsPromiseHolder.Resolve()
	}

	getAppointmentsOfDay(day: DateTime) {
		let appointments: Appointment[] = []

		for (let appointment of this.allAppointments) {
			if (DateTime.fromSeconds(appointment.start).hasSame(day, "day")) {
				appointments.push(appointment)
			}
		}

		sortAppointments(appointments)

		return appointments
	}

	getTodosOfDay(day: DateTime, completed: boolean = false) {
		let todos: Todo[] = []

		for (let todo of this.allTodos) {
			if (
				DateTime.fromSeconds(todo.time).hasSame(day, "day") &&
				(completed || !todo.completed)
			) {
				todos.push(todo)
			}
		}

		return todos
	}

	getTodoListsOfDay(day: DateTime) {
		let todoLists: TodoList[] = []

		for (let todoList of this.allTodoLists) {
			if (DateTime.fromSeconds(todoList.time).hasSame(day, "day")) {
				todoLists.push(todoList)
			}
		}

		return todoLists
	}
}
