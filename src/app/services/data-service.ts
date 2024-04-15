import { Injectable } from "@angular/core"
import { Todo, GetAllTodos } from "../models/Todo"
import { Appointment, GetAllAppointments } from "../models/Appointment"
import { TodoList, GetAllTodoLists, GetTodoList } from "../models/TodoList"
import { Dav } from "dav-js"
import * as DavUIComponents from "dav-ui-components"
import * as moment from "moment"
import * as localforage from "localforage"
import { LocalizationService } from "./localization-service"
import { SettingsService } from "./settings-service"
import { environment } from "../../environments/environment.prod"
import { convertStringToTheme } from "src/app/utils"
import { Theme } from "src/app/types"
import { themeKey, lightThemeKey, darkThemeKey } from "src/app/constants"

@Injectable()
export class DataService {
	dav = Dav
	locale: string = navigator.language

	//#region StartPage
	startDaysDates: number[] = [] // Contains the timestamps of the start of the days
	startDaysAppointments: Appointment[][] = [] // Contains the appointments for the individual days
	startDaysTodos: Todo[][] = [] // Contains the todos for the individual days
	startDaysTodoLists: TodoList[][] = [] // Contains the todo lists for the individual days
	//#endregion

	//#region TodosPage
	todosWithoutDate: TodoDay = {
		date: "",
		timestamp: 0,
		todos: [],
		todoLists: []
	}
	todoDays: TodoDay[] = []

	todosWithoutGroup: Todo[] = []
	todoListsWithoutGroup: TodoList[] = []
	todoGroups: { name: string; todos: Todo[]; todoLists: TodoList[] }[] = []
	//#endregion

	//#region AppointmentsPage
	appointmentDays: AppointmentDay[] = []
	oldAppointmentDays: AppointmentDay[] = []
	//#endregion

	//#region CalendarPage
	private updatingCalendarDays: boolean = false
	private updateCalendarDaysAgain: boolean = false
	allAppointments: Appointment[] = [] // Save all objects to add them to the calendar days in UpdateCalendarDays
	allTodos: Todo[] = []
	allTodoLists: TodoList[] = []

	mobileCalendarDaysDates: number[] = []
	mobileCalendarDaysAppointments: Appointment[][] = []
	mobileCalendarDaysTodos: Todo[][] = []

	desktopCalendarDaysDates: number[][] = []
	desktopCalendarDaysAppointments: Appointment[][][] = []
	desktopCalendarDaysTodos: Todo[][][] = []

	selectedDay: moment.Moment = moment()
	selectedDayAppointments: Appointment[] = []
	selectedDayTodos: Todo[] = []
	selectedDayTodoLists: TodoList[] = []
	//#endregion

	//#region All pages
	sortTodosByDate: boolean = true
	isMobile: boolean = false
	darkTheme: boolean = false
	windowsUiSettings = null
	isLoadingAllAppointments: boolean = false // If true, LoadAllAppointments is currently running
	isLoadingAllTodos: boolean = false
	updatedTodoLists: string[] = []
	//#endregion

	constructor(
		private localizationService: LocalizationService,
		private settingsService: SettingsService
	) {
		this.InitStartDays()
		this.LoadAllAppointments()
		this.LoadAllTodos()

		this.GetSortTodosByDate().then(value => {
			this.sortTodosByDate = value
		})
	}

	InitStartDays() {
		this.startDaysDates = []
		this.startDaysAppointments = []
		this.startDaysTodos = []
		this.startDaysTodoLists = []

		// Add the current day to the start page
		this.startDaysDates.push(moment().startOf("day").unix())
		this.startDaysAppointments.push([])
		this.startDaysTodos.push([])
		this.startDaysTodoLists.push([])
	}

	async LoadAllAppointments() {
		if (this.isLoadingAllAppointments) return
		this.isLoadingAllAppointments = true

		this.appointmentDays = []
		this.oldAppointmentDays = []
		this.allAppointments = []
		this.ClearCalendarDaysAppointments()
		this.selectedDayAppointments = []

		var appointments = await GetAllAppointments()
		for (let appointment of appointments) {
			this.AddAppointmentToStartPage(appointment)
			this.AddAppointmentToAppointmentsPage(appointment)
			this.AddAppointmentToCalendarPage(appointment)
		}

		this.isLoadingAllAppointments = false
	}

	async LoadAllTodos() {
		if (this.isLoadingAllTodos) return
		this.isLoadingAllTodos = true

		this.todosWithoutDate.todos = []
		this.todosWithoutDate.todoLists = []
		this.todoDays = []
		this.todosWithoutGroup = []
		this.todoListsWithoutGroup = []
		this.todoGroups = []
		this.allTodos = []
		this.allTodoLists = []
		this.ClearCalendarDaysTodos()
		this.selectedDayTodos = []
		this.selectedDayTodoLists = []

		// Load todos
		var todos = await GetAllTodos()
		for (let todo of todos) {
			this.AddTodoToStartPage(todo)
			this.AddTodoToTodosPage(todo)
			this.AddTodoToCalendarPage(todo)
		}

		// Load todo lists
		let todoLists = await GetAllTodoLists()

		for (let todoList of todoLists) {
			this.AddTodoListToStartPage(todoList)
			this.AddTodoListToTodosPage(todoList)
			this.AddTodoListToCalendarPage(todoList)
		}

		this.isLoadingAllTodos = false
	}

	ClearCalendarDaysAppointments() {
		for (let appointments of this.mobileCalendarDaysAppointments) {
			appointments = []
		}

		this.ClearCalendarDaysDates()
	}

	ClearCalendarDaysTodos() {
		for (let todos of this.mobileCalendarDaysTodos) {
			todos = []
		}

		this.ClearCalendarDaysDates()
	}

	ClearCalendarDaysDates() {
		for (let date of this.mobileCalendarDaysDates) {
			date = 0
		}
	}

	AddTodoList(todoList: TodoList) {
		this.AddTodoListToStartPage(todoList)
		this.AddTodoListToTodosPage(todoList)
		this.AddTodoListToCalendarPage(todoList)
	}

	UpdateTodoList(todoList: TodoList) {
		this.RemoveTodoList(todoList)
		this.AddTodoList(todoList)
	}

	RemoveTodoList(todoList: TodoList) {
		this.RemoveTodoListFromStartPage(todoList)
		this.RemoveTodoListFromTodosPage(todoList)
		this.RemoveTodoListFromCalendarPage(todoList)
	}

	AddTodo(todo: Todo) {
		this.AddTodoToStartPage(todo)
		this.AddTodoToTodosPage(todo)
		this.AddTodoToCalendarPage(todo)
	}

	UpdateTodo(todo: Todo) {
		this.RemoveTodo(todo)
		this.AddTodo(todo)
	}

	RemoveTodo(todo: Todo) {
		this.RemoveTodoFromStartPage(todo)
		this.RemoveTodoFromTodosPage(todo)
		this.RemoveTodoFromCalendarPage(todo)
	}

	AddAppointment(appointment: Appointment) {
		this.AddAppointmentToStartPage(appointment)
		this.AddAppointmentToAppointmentsPage(appointment)
		this.AddAppointmentToCalendarPage(appointment)
	}

	UpdateAppointment(appointment: Appointment) {
		this.RemoveAppointment(appointment)
		this.AddAppointment(appointment)
	}

	RemoveAppointment(appointment: Appointment) {
		this.RemoveAppointmentFromStartPage(appointment)
		this.RemoveAppointmentFromAppointmentsPage(appointment)
		this.RemoveAppointmentFromCalendarPage(appointment)
	}

	SortAppointmentsArray(appointments: Appointment[]) {
		appointments.sort((a: Appointment, b: Appointment) => {
			if (a.allday) return 1
			if (b.allday) return -1

			if (a.start < b.start) {
				return -1
			} else if (a.start > b.start) {
				return 1
			} else {
				return 0
			}
		})
	}

	SortTodosArray(todos: Todo[]) {
		todos.sort((a: Todo, b: Todo) => {
			if (a.time < b.time) {
				return -1
			} else if (a.time > b.time) {
				return 1
			} else {
				return 0
			}
		})
	}

	SortTodoListsArray(todoLists: TodoList[]) {
		todoLists.sort((a: TodoList, b: TodoList) => {
			if (a.time < b.time) {
				return -1
			} else if (a.time > b.time) {
				return 1
			} else {
				return 0
			}
		})
	}

	SortStartDays() {
		for (let j = 0; j < this.startDaysDates.length; j++) {
			for (let i = 1; i < this.startDaysDates.length; i++) {
				if (this.startDaysDates[i - 1] > this.startDaysDates[i]) {
					// Swap the dates
					let firstDate = this.startDaysDates[i - 1]
					let secondDate = this.startDaysDates[i]
					this.startDaysDates[i - 1] = secondDate
					this.startDaysDates[i] = firstDate

					let firstAppointments = this.startDaysAppointments[i - 1]
					let secondAppointments = this.startDaysAppointments[i]
					this.startDaysAppointments[i - 1] = secondAppointments
					this.startDaysAppointments[i] = firstAppointments

					let firstTodos = this.startDaysTodos[i - 1]
					let secondTodos = this.startDaysTodos[i]
					this.startDaysTodos[i - 1] = secondTodos
					this.startDaysTodos[i] = firstTodos

					let firstTodoLists = this.startDaysTodoLists[i - 1]
					let secondTodoLists = this.startDaysTodoLists[i]
					this.startDaysTodoLists[i - 1] = secondTodoLists
					this.startDaysTodoLists[i] = firstTodoLists
				}
			}
		}
	}

	SortTodoDays() {
		this.todoDays.sort(
			(a: { timestamp: number }, b: { timestamp: number }) => {
				if (a.timestamp < b.timestamp) {
					return -1
				} else if (a.timestamp > b.timestamp) {
					return 1
				} else {
					return 0
				}
			}
		)
	}

	HideWindowsBackButton() {
		if (window["Windows"]) {
			window[
				"Windows"
			].UI.Core.SystemNavigationManager.getForCurrentView().appViewBackButtonVisibility =
				window["Windows"].UI.Core.AppViewBackButtonVisibility.collapsed
		}
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

	//#region StartPage
	AddAppointmentToStartPage(appointment: Appointment) {
		if (appointment.start < moment().startOf("day").unix()) return

		// Check if the day of the appointment is already in the array
		let index = this.startDaysDates.findIndex(
			d => d == moment.unix(appointment.start).startOf("day").unix()
		)

		if (index !== -1) {
			// Check if the appointment is already in the appointments array of the day
			let i = this.startDaysAppointments[index].findIndex(
				a => a.uuid == appointment.uuid
			)

			if (i !== -1) {
				// Replace the appointment
				this.startDaysAppointments[index][i] = appointment
			} else {
				// Add the appointment
				this.startDaysAppointments[index].push(appointment)
			}

			this.SortAppointmentsArray(this.startDaysAppointments[index])
		} else {
			// Create a new day
			this.startDaysDates.push(
				moment.unix(appointment.start).startOf("day").unix()
			)
			this.startDaysAppointments.push([appointment])
			this.startDaysTodoLists.push([])
			this.startDaysTodos.push([])

			// Sort the arrays
			this.SortStartDays()
		}
	}

	RemoveAppointmentFromStartPage(appointment: Appointment) {
		// Remove the appointment from all arrays
		for (let i = 0; i < this.startDaysAppointments.length; i++) {
			let index = this.startDaysAppointments[i].findIndex(
				a => a.uuid == appointment.uuid
			)

			if (index !== -1) {
				this.startDaysAppointments[i].splice(index, 1)

				if (
					this.startDaysAppointments[i].length == 0 &&
					this.startDaysTodos[i].length == 0 &&
					this.startDaysTodoLists[i].length == 0 &&
					i != 0
				) {
					// Remove the day
					this.startDaysAppointments.splice(i, 1)
					this.startDaysTodos.splice(i, 1)
					this.startDaysTodoLists.splice(i, 1)
					this.startDaysDates.splice(i, 1)
				}
			}
		}
	}

	AddTodoToStartPage(todo: Todo) {
		// Don't add the todo if it belongs to a list
		if (todo.list) return

		// Check if the day of the todo is already in the array
		let index =
			todo.time < moment().startOf("day").unix()
				? 0
				: this.startDaysDates.findIndex(t => t == todo.time)

		if (index !== -1) {
			// Check if the todo is already in the todos array of the day
			let i = this.startDaysTodos[index].findIndex(t => t.uuid == todo.uuid)

			if (i !== -1) {
				// Replace the todo
				this.startDaysTodos[index][i] = todo
			} else {
				// Add the todo
				this.startDaysTodos[index].push(todo)
			}

			this.SortTodosArray(this.startDaysTodos[index])
		} else {
			// Create a new day
			this.startDaysDates.push(moment.unix(todo.time).startOf("day").unix())
			this.startDaysAppointments.push([])
			this.startDaysTodoLists.push([])
			this.startDaysTodos.push([todo])

			// Sort the arrays
			this.SortStartDays()
		}
	}

	RemoveTodoFromStartPage(todo: Todo) {
		// Remove the todo from all arrays
		for (let i = 0; i < this.startDaysTodos.length; i++) {
			let index = this.startDaysTodos[i].findIndex(t => t.uuid == todo.uuid)

			if (index !== -1) {
				this.startDaysTodos[i].splice(index, 1)

				if (
					this.startDaysAppointments[i].length == 0 &&
					this.startDaysTodos[i].length == 0 &&
					this.startDaysTodoLists[i].length == 0 &&
					i != 0
				) {
					// Remove the day
					this.startDaysAppointments.splice(i, 1)
					this.startDaysTodos.splice(i, 1)
					this.startDaysTodoLists.splice(i, 1)
					this.startDaysDates.splice(i, 1)
				}
			}
		}
	}

	AddTodoListToStartPage(todoList: TodoList) {
		// Don't add the list if it belongs to another list
		if (todoList.list) return

		// Check if the day of the todo list is already in the array
		let index =
			todoList.time < moment().startOf("day").unix()
				? 0
				: this.startDaysDates.findIndex(t => t == todoList.time)

		if (index !== -1) {
			// Add the list to the existing day
			// Check if the list is already in the todos array of the day
			let i = this.startDaysTodoLists[index].findIndex(
				t => t.uuid == todoList.uuid
			)

			if (i !== -1) {
				// Replace the todo list
				this.startDaysTodoLists[index][i] = todoList
			} else {
				// Add the todo list
				this.startDaysTodoLists[index].push(todoList)
			}

			this.SortTodoListsArray(this.startDaysTodoLists[index])
		} else {
			// Create a new day
			this.startDaysDates.push(
				moment.unix(todoList.time).startOf("day").unix()
			)
			this.startDaysAppointments.push([])
			this.startDaysTodoLists.push([todoList])
			this.startDaysTodos.push([])

			// Sort the arrays
			this.SortStartDays()
		}
	}

	RemoveTodoListFromStartPage(todoList: TodoList) {
		// Remove the todo list from all arrays
		for (let i = 0; i < this.startDaysTodoLists.length; i++) {
			let index = this.startDaysTodoLists[i].findIndex(
				t => t.uuid == todoList.uuid
			)

			if (index !== -1) {
				this.startDaysTodoLists[i].splice(index, 1)

				if (
					this.startDaysAppointments[i].length == 0 &&
					this.startDaysTodos[i].length == 0 &&
					this.startDaysTodoLists[i].length == 0 &&
					i != 0
				) {
					// Remove the day
					this.startDaysAppointments.splice(i, 1)
					this.startDaysTodos.splice(i, 1)
					this.startDaysTodoLists.splice(i, 1)
					this.startDaysDates.splice(i, 1)
				}
			}
		}
	}
	//#endregion

	//#region TodosPage
	AddTodoToTodosPage(todo: Todo) {
		if (todo.list) return

		if (this.sortTodosByDate) {
			if (todo.time != 0) {
				var date: string = moment
					.unix(todo.time)
					.format(this.localizationService.locale.todosPage.formats.date)
				var timestampOfDate = moment.unix(todo.time).startOf("day").unix()

				// Check if the date already exists in the todoDays array
				var todoDay = this.todoDays.find(
					obj => obj.timestamp == timestampOfDate
				)

				if (todoDay) {
					// Add the todo to the array of the todoDay
					todoDay.todos.push(todo)
				} else {
					// Add a new day to the array
					var newTodoDay = {
						date,
						timestamp: timestampOfDate,
						todos: [todo],
						todoLists: []
					}

					this.todoDays.push(newTodoDay)
				}
			} else {
				this.todosWithoutDate.todos.push(todo)
			}

			// Sort the todoDays array
			this.SortTodoDays()
		} else {
			// Sort by group
			if (todo.groups.length == 0) {
				this.todosWithoutGroup.push(todo)
			} else {
				todo.groups.forEach(groupName => {
					// Check if the todoGroup already exists
					var index = this.todoGroups.findIndex(
						todoGroup => todoGroup.name == groupName
					)

					if (index !== -1) {
						// Add the todo to the todoGroup
						this.todoGroups[index].todos.push(todo)
					} else {
						// Create the todoGroup
						var todoGroup: {
							name: string
							todos: Todo[]
							todoLists: TodoList[]
						} = {
							name: groupName,
							todos: [todo],
							todoLists: []
						}

						this.todoGroups.push(todoGroup)
					}
				})
			}
		}
	}

	RemoveTodoFromTodosPage(todo: Todo) {
		// Remove the todo from the todoDays
		let index = this.todosWithoutDate.todos.findIndex(
			t => t.uuid == todo.uuid
		)

		if (index !== -1) {
			this.todosWithoutDate.todos.splice(index, 1)
		} else {
			this.todoDays.forEach(todoDay => {
				index = todoDay.todos.findIndex(t => t.uuid == todo.uuid)

				if (index !== -1) {
					todoDay.todos.splice(index, 1)

					// If the todoDay is empty, remove it
					if (todoDay.todos.length == 0 && todoDay.todoLists.length == 0) {
						index = this.todoDays.indexOf(todoDay)
						if (index !== -1) {
							this.todoDays.splice(index, 1)
						}
					}
				}
			})
		}

		// Remove the todo from the todoGroups
		index = this.todosWithoutGroup.findIndex(t => t.uuid == todo.uuid)

		if (index !== -1) {
			this.todosWithoutGroup.splice(index, 1)
		} else {
			this.todoGroups.forEach(todoGroup => {
				index = todoGroup.todos.findIndex(t => t.uuid == todo.uuid)

				if (index !== -1) {
					todoGroup.todos.splice(index, 1)

					// If the todoGroup is empty, remove it
					if (
						todoGroup.todos.length == 0 &&
						todoGroup.todoLists.length == 0
					) {
						index = this.todoGroups.indexOf(todoGroup)
						if (index !== -1) {
							this.todoGroups.splice(index, 1)
						}
					}
				}
			})
		}
	}

	AddTodoListToTodosPage(todoList: TodoList) {
		if (todoList.list) return

		if (this.sortTodosByDate) {
			if (todoList.time != 0) {
				let date: string = moment
					.unix(todoList.time)
					.format(this.localizationService.locale.todosPage.formats.date)
				let timestampOfDate = moment
					.unix(todoList.time)
					.startOf("day")
					.unix()

				// Check if the date already exists in the todoDays array
				let todoDay = this.todoDays.find(
					obj => obj.timestamp == timestampOfDate
				)

				if (todoDay) {
					// Add the todoList to the array of the todoDay
					todoDay.todoLists.push(todoList)
				} else {
					// Add a new day to the array
					let newTodoDay = {
						date,
						timestamp: timestampOfDate,
						todos: [],
						todoLists: [todoList]
					}

					this.todoDays.push(newTodoDay)
				}
			} else {
				this.todosWithoutDate.todoLists.push(todoList)
			}

			// Sort the todoDays array
			this.SortTodoDays()
		} else {
			// Sort by group
			if (todoList.groups.length == 0) {
				this.todoListsWithoutGroup.push(todoList)
			} else {
				todoList.groups.forEach(group => {
					// Check if the todoGroup already exists
					let index = this.todoGroups.findIndex(
						todoGroup => todoGroup.name == group
					)

					if (index !== -1) {
						// Add the todoList to the todoGroup
						this.todoGroups[index].todoLists.push(todoList)
					} else {
						// Create the todoGroup
						let todoGroup: {
							name: string
							todos: Todo[]
							todoLists: TodoList[]
						} = {
							name: group,
							todos: [],
							todoLists: [todoList]
						}

						this.todoGroups.push(todoGroup)
					}
				})
			}
		}
	}

	RemoveTodoListFromTodosPage(todoList: TodoList) {
		// Remove the todolist from the todoDays
		let index = this.todosWithoutDate.todoLists.findIndex(
			t => t.uuid == todoList.uuid
		)

		if (index !== -1) {
			this.todosWithoutDate.todoLists.splice(index, 1)
		} else {
			this.todoDays.forEach(todoDay => {
				index = todoDay.todoLists.findIndex(t => t.uuid == todoList.uuid)

				if (index !== -1) {
					todoDay.todoLists.splice(index, 1)

					// If the todoDay is empty, remove it
					if (todoDay.todos.length == 0 && todoDay.todoLists.length == 0) {
						index = this.todoDays.indexOf(todoDay)
						if (index !== -1) {
							this.todoDays.splice(index, 1)
						}
					}
				}
			})
		}

		// Remove the todoList from the todoGroups
		index = this.todoListsWithoutGroup.findIndex(t => t.uuid == todoList.uuid)

		if (index !== -1) {
			this.todoListsWithoutGroup.splice(index, 1)
		} else {
			this.todoGroups.forEach(todoGroup => {
				index = todoGroup.todoLists.findIndex(t => t.uuid == todoList.uuid)

				if (index !== -1) {
					todoGroup.todoLists.splice(index, 1)

					// If the todoGroup is empty, remove it
					if (
						todoGroup.todos.length == 0 &&
						todoGroup.todoLists.length == 0
					) {
						index = this.todoGroups.indexOf(todoGroup)
						if (index !== -1) {
							this.todoGroups.splice(index, 1)
						}
					}
				}
			})
		}
	}

	// This is called from TodosPage in SortByGroups when a todo list is updated, to update all of the same todo list on the page
	async UpdateTodoListsOnSortByGroupTodoPage(
		uuid: string,
		todoGroupName: string
	) {
		// Get the todo list from the database
		let todoList = await GetTodoList(uuid)

		// Update the todo list in all todoGroups where the todoGroup name is different
		for (let todoGroup of this.todoGroups) {
			if (todoGroup.name != todoGroupName) {
				// Find the todo list in the todoGroup
				let index = todoGroup.todoLists.findIndex(t => t.uuid == uuid)

				if (index !== -1) {
					todoGroup.todoLists[index] = todoList
				}
			}
		}
	}
	//#endregion

	//#region AppointmentsPage
	AddAppointmentToAppointmentsPage(appointment: Appointment) {
		var date: string = moment
			.unix(appointment.start)
			.format("dddd, D. MMMM YYYY")
		var timestampOfDate = moment.unix(appointment.start).startOf("day").unix()

		var appointmentStartTimestamp = moment
			.unix(appointment.start)
			.endOf("day")
			.unix()
		if (!appointment.allday) {
			appointmentStartTimestamp = appointment.end
		}

		// Check if the appointment was created yesterday or a day before
		let isOld =
			appointmentStartTimestamp <
			moment
				.unix(moment.now() / 1000)
				.startOf("day")
				.unix()
		let appointmentDays = isOld
			? this.oldAppointmentDays
			: this.appointmentDays

		// Check if the date already exists in the appointmentDays or oldAppointmentDays array
		var appointmentDay = appointmentDays.find(
			obj => obj["timestamp"] == timestampOfDate
		)

		if (appointmentDay) {
			var appointmentArray = appointmentDay["appointments"]
			appointmentArray.push(appointment)

			// Sort the appointments array
			this.SortAppointmentsArray(appointmentArray)
		} else {
			// Create a new appointmentDay
			var newAppointmentDay = {
				date: date,
				timestamp: timestampOfDate,
				appointments: [appointment]
			}

			appointmentDays.push(newAppointmentDay)

			// Sort the appointmentDays array
			appointmentDays.sort((a: object, b: object) => {
				const timestampString = "timestamp"
				if (a[timestampString] < b[timestampString]) {
					return isOld ? 1 : -1
				} else if (a[timestampString] > b[timestampString]) {
					return isOld ? -1 : 1
				} else {
					return 0
				}
			})
		}
	}

	RemoveAppointmentFromAppointmentsPage(appointment: Appointment) {
		let i = 0

		// Try to find the appointment in appointmentDays
		for (let appointmentDay of this.appointmentDays) {
			let index = appointmentDay["appointments"].findIndex(
				a => a.uuid == appointment.uuid
			)

			if (index !== -1) {
				appointmentDay["appointments"].splice(index, 1)

				if (appointmentDay["appointments"].length == 0) {
					// Remove the appointmentDay
					this.appointmentDays.splice(i, 1)
				}

				return
			}

			i++
		}

		i = 0

		// Try to find the appointment in oldAppointmentDays
		for (let appointmentDay of this.oldAppointmentDays) {
			let index = appointmentDay["appointments"].findIndex(
				a => a.uuid == appointment.uuid
			)

			if (index !== -1) {
				appointmentDay["appointments"].splice(index, 1)

				if (appointmentDay["appointments"].length == 0) {
					// Remove the appointmentDay
					this.oldAppointmentDays.splice(i, 1)
				}

				return
			}

			i++
		}
	}
	//#endregion

	//#region CalendarPage
	UpdateCalendarDays() {
		if (this.updatingCalendarDays) {
			this.updateCalendarDaysAgain = true
			return
		}

		this.updatingCalendarDays = true

		// Go through each mobileCalendarDay
		for (let i = 0; i < this.mobileCalendarDaysDates.length; i++) {
			let date = moment.unix(this.mobileCalendarDaysDates[i]).startOf("day")
			this.mobileCalendarDaysAppointments[i] =
				this.GetAppointmentsOfDay(date)
			this.mobileCalendarDaysTodos[i] = this.GetTodosOfDay(date, false)
		}

		// Go through each desktopCalendarDay
		for (let i = 0; i < this.desktopCalendarDaysDates.length; i++) {
			for (let j = 0; j < this.desktopCalendarDaysDates[i].length; j++) {
				let date = moment
					.unix(this.desktopCalendarDaysDates[i][j])
					.startOf("day")
				this.desktopCalendarDaysAppointments[i][j] =
					this.GetAppointmentsOfDay(date)
				this.desktopCalendarDaysTodos[i][j] = this.GetTodosOfDay(
					date,
					false
				)
			}
		}

		this.updatingCalendarDays = false

		if (this.updateCalendarDaysAgain) {
			this.updateCalendarDaysAgain = false
			this.UpdateCalendarDays()
		}
	}

	// Get the todos of the given day to show them on the calendar page
	GetTodosOfDay(day: moment.Moment, completed: boolean) {
		var todos: Todo[] = []

		this.allTodos.forEach(todo => {
			if (
				moment.unix(todo.time).startOf("day").unix() ===
					day.startOf("day").unix() &&
				(completed || !todo.completed)
			) {
				todos.push(todo)
			}
		})

		return todos
	}

	AddAppointmentToCalendarPage(appointment: Appointment) {
		this.allAppointments.push(appointment)
		this.SortAppointmentsArray(this.allAppointments)

		if (
			moment.unix(appointment.start).startOf("day").unix() ==
			this.selectedDay.startOf("day").unix()
		) {
			this.selectedDayAppointments.push(appointment)
			this.SortAppointmentsArray(this.selectedDayAppointments)
		}

		this.UpdateCalendarDays()
	}

	GetAppointmentsOfDay(day: moment.Moment) {
		var appointments: Appointment[] = []

		for (let appointment of this.allAppointments) {
			if (
				moment.unix(appointment.start).startOf("day").unix() ===
				day.startOf("day").unix()
			) {
				appointments.push(appointment)
			}
		}

		this.SortAppointmentsArray(appointments)

		return appointments
	}

	RemoveAppointmentFromCalendarPage(appointment: Appointment) {
		let index = this.allAppointments.findIndex(
			a => a.uuid == appointment.uuid
		)
		if (index !== -1) {
			this.allAppointments.splice(index, 1)
		}

		index = this.selectedDayAppointments.findIndex(
			a => a.uuid == appointment.uuid
		)
		if (index !== -1) {
			this.selectedDayAppointments.splice(index, 1)
		}

		this.UpdateCalendarDays()
	}

	AddTodoToCalendarPage(todo: Todo) {
		if (todo.list) return

		this.allTodos.push(todo)
		this.SortTodosArray(this.allTodos)

		if (
			moment.unix(todo.time).startOf("day").unix() ==
				this.selectedDay.startOf("day").unix() &&
			!todo.list
		) {
			this.selectedDayTodos.push(todo)
			this.SortTodosArray(this.selectedDayTodos)
		}

		this.UpdateCalendarDays()
	}

	RemoveTodoFromCalendarPage(todo: Todo) {
		let index = this.allTodos.findIndex(t => t.uuid == todo.uuid)
		if (index !== -1) {
			this.allTodos.splice(index, 1)
		}

		index = this.selectedDayTodos.findIndex(t => t.uuid == todo.uuid)
		if (index !== -1) {
			this.selectedDayTodos.splice(index, 1)
		}

		this.UpdateCalendarDays()
	}

	AddTodoListToCalendarPage(todoList: TodoList) {
		if (todoList.list) return

		// Add the todos of the list to allTodos
		let todos: Todo[] = []
		this.GetNestedTodosInTodoList(todoList, todos)
		for (let todo of todos) {
			this.allTodos.push(todo)
		}

		if (todoList.list) return

		this.allTodoLists.push(todoList)
		this.SortTodoListsArray(this.allTodoLists)

		if (
			moment.unix(todoList.time).startOf("day").unix() ==
			this.selectedDay.startOf("day").unix()
		) {
			this.selectedDayTodoLists.push(todoList)
			this.SortTodoListsArray(this.selectedDayTodoLists)
		}

		this.UpdateCalendarDays()
	}

	RemoveTodoListFromCalendarPage(todoList: TodoList) {
		// Remove the todos of the todo list
		let todos: Todo[] = []
		this.GetNestedTodosInTodoList(todoList, todos)
		for (let todo of todos) {
			let i = this.allTodos.findIndex(t => t.uuid == todo.uuid)
			if (i !== -1) {
				this.allTodos.splice(i, 1)
			}
		}

		let index = this.allTodoLists.findIndex(t => t.uuid == todoList.uuid)
		if (index !== -1) {
			this.allTodoLists.splice(index, 1)
		}

		index = this.selectedDayTodoLists.findIndex(t => t.uuid == todoList.uuid)
		if (index !== -1) {
			this.selectedDayTodoLists.splice(index, 1)
		}

		this.UpdateCalendarDays()
	}
	//#endregion

	//#region SettingsPage
	async SetSortTodosByDate(value: boolean) {
		await localforage.setItem(environment.settingsSortTodosByDateKey, value)
	}

	async GetSortTodosByDate(): Promise<boolean> {
		let value = (await localforage.getItem(
			environment.settingsSortTodosByDateKey
		)) as boolean
		return value != null ? value : environment.settingsSortTodosByDateDefault
	}
	//#endregion

	//#region Helper methods
	GetNotificationPermission(): NotificationPermission {
		return Notification.permission
	}

	// Get the todos of todoList and add them to todos
	GetNestedTodosInTodoList(todoList: TodoList, todos: Todo[]) {
		todoList.items.forEach((item: Todo | TodoList) => {
			if (item instanceof Todo) {
				todos.push(item)
			} else {
				this.GetNestedTodosInTodoList(item, todos)
			}
		})
	}

	// Save the todo list uuid in updatedTodoLists if it is not there yet
	AddTodoListToUpdatedTodoLists(uuid: string) {
		let index = this.updatedTodoLists.findIndex(t => t == uuid)
		if (index == -1) {
			// Add the todo list uuid
			this.updatedTodoLists.push(uuid)
		}
	}

	// Reload the todo lists in updatedTodoLists
	async UpdateUpdatedTodoLists() {
		for (let uuid of this.updatedTodoLists) {
			let todoList = await GetTodoList(uuid)
			if (todoList) this.UpdateTodoList(todoList)
		}

		this.updatedTodoLists = []
	}

	async GetRootOfTodo(todo: Todo): Promise<TodoList> {
		if (!todo.list) return null

		let parent = await GetTodoList(todo.list)
		if (!parent) return null

		if (parent.list) {
			// Get the parent of the parent
			return await this.GetRootOfTodoList(parent)
		} else {
			return parent
		}
	}

	async GetRootOfTodoList(todoList: TodoList): Promise<TodoList> {
		if (!todoList.list) return todoList

		let parentUuid = todoList.list
		let currentList: TodoList = todoList

		while (parentUuid) {
			currentList = await GetTodoList(parentUuid)

			if (currentList) {
				parentUuid = currentList.list
			} else {
				return null
			}
		}

		return currentList
	}

	/**
	 * If the user is on mobile, moves all snackbars above the bottom toolbar
	 */
	AdaptSnackbarPosition() {
		if (this.isMobile) {
			setTimeout(() => {
				let snackbarContainerList = document.getElementsByTagName(
					"snack-bar-container"
				)

				for (let i = 0; i < snackbarContainerList.length; i++) {
					let snackbarContainer = snackbarContainerList.item(i)
					let snackbarOverlay = snackbarContainer.parentElement
					snackbarOverlay.style.marginBottom = "56px"
				}
			}, 1)
		}
	}
	//#endregion
}

export interface TodoDay {
	date: string
	timestamp: number
	todos: Todo[]
	todoLists: TodoList[]
}

export interface AppointmentDay {
	date: string
	timestamp: number
	appointments: Appointment[]
}
