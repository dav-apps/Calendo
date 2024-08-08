import { Injectable } from "@angular/core"
import { DateTime } from "luxon"
import { Todo, GetAllTodos } from "../models/Todo"
import { Appointment, GetAllAppointments } from "../models/Appointment"
import { TodoList, GetAllTodoLists } from "../models/TodoList"
import { Dav, PromiseHolder } from "dav-js"
import * as DavUIComponents from "dav-ui-components"
import { SettingsService } from "./settings-service"
import { sortAppointments, convertStringToTheme } from "src/app/utils"
import { Theme, TodoDay } from "src/app/types"
import { themeKey, lightThemeKey, darkThemeKey } from "src/app/constants"

@Injectable()
export class DataService {
	dav = Dav
	locale: string = navigator.language
	userPromiseHolder = new PromiseHolder()
	appointmentsPromiseHolder = new PromiseHolder()
	todosPromiseHolder = new PromiseHolder()
	updateInstalled: boolean = false

	allAppointments: Appointment[] = []
	allTodos: Todo[] = []
	allTodoLists: TodoList[] = []

	//#region All pages
	sortTodosByDate: boolean = true
	isMobile: boolean = false
	darkTheme: boolean = false
	contentContainer: HTMLDivElement = null
	isLoadingAllAppointments: boolean = false // If true, LoadAllAppointments is currently running
	isLoadingAllTodos: boolean = false
	updatedTodoLists: string[] = []
	//#endregion

	constructor(private settingsService: SettingsService) {
		this.loadAllAppointments()
		this.loadAllTodos()
	}

	async loadAllAppointments() {
		if (this.isLoadingAllAppointments) return
		this.isLoadingAllAppointments = true

		this.allAppointments = []

		var appointments = await GetAllAppointments()

		for (let appointment of appointments) {
			this.allAppointments.push(appointment)
		}

		this.isLoadingAllAppointments = false
		this.appointmentsPromiseHolder.Resolve()
	}

	async loadAllTodos() {
		if (this.isLoadingAllTodos) return
		this.isLoadingAllTodos = true

		this.allTodos = []
		this.allTodoLists = []

		// Load todos
		var todos = await GetAllTodos()

		for (let todo of todos) {
			this.allTodos.push(todo)
		}

		// Load todo lists
		let todoLists = await GetAllTodoLists()

		for (let todoList of todoLists) {
			this.allTodoLists.push(todoList)
		}

		this.isLoadingAllTodos = false
		this.todosPromiseHolder.Resolve()
	}

	SortTodoDays(todoDays: TodoDay[]) {
		todoDays.sort((a: TodoDay, b: TodoDay) => {
			if (a.date < b.date) {
				return -1
			} else if (a.date > b.date) {
				return 1
			} else {
				return 0
			}
		})
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

	//#region CalendarPage
	// Get the todos of the given day to show them on the calendar page
	GetTodosOfDay(day: DateTime, completed: boolean = false) {
		var todos: Todo[] = []

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

	GetAppointmentsOfDay(day: DateTime) {
		var appointments: Appointment[] = []

		for (let appointment of this.allAppointments) {
			if (DateTime.fromSeconds(appointment.start).hasSame(day, "day")) {
				appointments.push(appointment)
			}
		}

		sortAppointments(appointments)

		return appointments
	}
	//#endregion
}
