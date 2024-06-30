import { Injectable } from "@angular/core"
import { DateTime } from "luxon"
import { Todo, GetAllTodos } from "../models/Todo"
import { Appointment, GetAllAppointments } from "../models/Appointment"
import { TodoList, GetAllTodoLists, GetTodoList } from "../models/TodoList"
import { Dav, PromiseHolder } from "dav-js"
import * as DavUIComponents from "dav-ui-components"
import { SettingsService } from "./settings-service"
import { convertStringToTheme } from "src/app/utils"
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

	//#region StartPage
	startDaysDates: number[] = [] // Contains the timestamps of the start of the days
	startDaysAppointments: Appointment[][] = [] // Contains the appointments for the individual days
	startDaysTodos: Todo[][] = [] // Contains the todos for the individual days
	startDaysTodoLists: TodoList[][] = [] // Contains the todo lists for the individual days
	//#endregion

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
		this.InitStartDays()
		this.LoadAllAppointments()
		this.LoadAllTodos()
	}

	InitStartDays() {
		this.startDaysDates = []
		this.startDaysAppointments = []
		this.startDaysTodos = []
		this.startDaysTodoLists = []

		// Add the current day to the start page
		this.startDaysDates.push(DateTime.now().startOf("day").toUnixInteger())
		this.startDaysAppointments.push([])
		this.startDaysTodos.push([])
		this.startDaysTodoLists.push([])
	}

	async LoadAllAppointments() {
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

	async LoadAllTodos() {
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

	AddTodoList(todoList: TodoList) {}

	UpdateTodoList(todoList: TodoList) {
		this.RemoveTodoList(todoList)
		this.AddTodoList(todoList)
	}

	RemoveTodoList(todoList: TodoList) {}

	AddTodo(todo: Todo) {}

	UpdateTodo(todo: Todo) {
		this.RemoveTodo(todo)
		this.AddTodo(todo)
	}

	RemoveTodo(todo: Todo) {}

	AddAppointment(appointment: Appointment) {}

	UpdateAppointment(appointment: Appointment) {
		this.RemoveAppointment(appointment)
		this.AddAppointment(appointment)
	}

	RemoveAppointment(appointment: Appointment) {}

	SortAppointmentsArray(appointments: Appointment[]) {
		appointments.sort((a: Appointment, b: Appointment) => {
			if (a.allday) return -1
			if (b.allday) return 1

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

	//#region TodosPage
	/*
	AddTodoToTodosPage(todo: Todo) {
		if (todo.list) return

		if (this.sortTodosByDate) {
			if (todo.time != 0) {
				let date = DateTime.fromSeconds(todo.time)
				let formattedDate: string = date.toFormat("DDDD")

				// Check if the date already exists in the todoDays array
				var todoDay = this.todoDays.find(
					obj => obj.formattedDate == formattedDate
				)

				if (todoDay) {
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
			} else {
				this.todosWithoutDate.todos.push(todo)
			}

			// Sort the todoDays array
			this.SortTodoDays(this.todoDays)
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
	*/

	/*
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
	*/

	/*
	AddTodoListToTodosPage(todoList: TodoList) {
		if (todoList.list) return

		if (this.sortTodosByDate) {
			if (todoList.time != 0) {
				let date = DateTime.fromSeconds(todoList.time)
				let formattedDate = date.toFormat("DDDD")

				// Check if the date already exists in the todoDays array
				let todoDay = this.todoDays.find(
					obj => obj.formattedDate == formattedDate
				)

				if (todoDay) {
					// Add the todoList to the array of the todoDay
					todoDay.todoLists.push(todoList)
				} else {
					// Add a new day to the array
					let newTodoDay = {
						date,
						formattedDate,
						todos: [],
						todoLists: [todoList]
					}

					this.todoDays.push(newTodoDay)
				}
			} else {
				this.todosWithoutDate.todoLists.push(todoList)
			}

			// Sort the todoDays array
			this.SortTodoDays(this.todoDays)
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
	*/

	/*
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
	*/

	// This is called from TodosPage in SortByGroups when a todo list is updated, to update all of the same todo list on the page
	/*
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
	*/
	//#endregion

	//#region AppointmentsPage
	/*
	AddAppointmentToAppointmentsPage(appointment: Appointment) {
		let date = DateTime.fromSeconds(appointment.start)
		let formattedDate = date.toFormat("DDDD")
		var appointmentStartTimestamp = date.endOf("day").toUnixInteger()

		if (!appointment.allday) {
			appointmentStartTimestamp = appointment.end
		}

		// Check if the appointment was created yesterday or a day before
		let isOld =
			appointmentStartTimestamp <
			DateTime.now().startOf("day").toUnixInteger()
		let appointmentDays = isOld
			? this.oldAppointmentDays
			: this.appointmentDays

		// Check if the date already exists in the appointmentDays or oldAppointmentDays array
		var appointmentDay = appointmentDays.find(
			day => day.formattedDate == formattedDate
		)

		if (appointmentDay) {
			var appointmentArray = appointmentDay["appointments"]
			appointmentArray.push(appointment)

			// Sort the appointments array
			this.SortAppointmentsArray(appointmentArray)
		} else {
			appointmentDays.push({
				formattedDate,
				calendarDayPageLink: `calendar/${date.year}/${date.month}/${date.day}`,
				appointments: [appointment]
			})

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
	*/

	/*
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
	*/
	//#endregion

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

		this.SortAppointmentsArray(appointments)

		return appointments
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
	//#endregion
}
