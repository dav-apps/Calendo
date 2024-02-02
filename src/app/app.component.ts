import { Component, HostListener } from "@angular/core"
import { Router, NavigationStart } from "@angular/router"
import { Dav, Environment, TableObject } from "dav-js"
import { environment } from "../environments/environment"
import { enUS } from "../locales/locales"
import { DataService } from "./services/data-service"
import { ConvertTableObjectToAppointment } from "./models/Appointment"
import { ConvertTableObjectToTodo } from "./models/Todo"
import { TodoList, ConvertTableObjectToTodoList } from "./models/TodoList"

const smallWindowMaxSize = 768

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	locale = enUS.navbar
	windowWidth: number = 500
	currentUrl: string = "/"

	constructor(public dataService: DataService, private router: Router) {
		this.locale = this.dataService.GetLocale().navbar

		this.router.events.forEach(data => {
			if (data instanceof NavigationStart) {
				// Update the updated todo lists
				this.dataService.UpdateUpdatedTodoLists()
				this.currentUrl = data.url
			}
		})
	}

	async ngOnInit() {
		this.setSize()
		this.setTitleBarColor()

		// Set the background colors
		this.dataService.ApplyTheme()

		// Initialize dav
		new Dav({
			environment: environment.production
				? Environment.Production
				: Environment.Development,
			appId: environment.appId,
			tableIds: [
				environment.todoTableId,
				environment.todoListTableId,
				environment.appointmentTableId
			],
			notificationOptions: {
				icon: "/assets/icons/icon-192x192.png",
				badge: "/assets/icons/badge-128x128.png"
			},
			callbacks: {
				UpdateAllOfTable: (tableId: number) =>
					this.UpdateAllOfTable(tableId),
				UpdateTableObject: (
					tableObject: TableObject,
					downloaded: boolean
				) => this.UpdateTableObject(tableObject, downloaded),
				DeleteTableObject: (tableObject: TableObject) =>
					this.DeleteTableObject(tableObject)
			}
		})
	}

	@HostListener("window:resize")
	setSize() {
		this.dataService.smallWindow = window.innerWidth < smallWindowMaxSize
		this.windowWidth = window.innerWidth
	}

	//#region dav-js callback functions
	async UpdateAllOfTable(tableId: number) {
		if (tableId === environment.appointmentTableId) {
			await this.dataService.LoadAllAppointments()
		} else if (tableId === environment.todoListTableId) {
			await this.dataService.LoadAllTodos()
		}
	}

	async UpdateTableObject(
		tableObject: TableObject,
		downloaded: boolean = false
	) {
		if (tableObject.TableId == environment.appointmentTableId) {
			// Update appointment
			var appointment = ConvertTableObjectToAppointment(tableObject)

			if (appointment) {
				this.dataService.UpdateAppointment(appointment)
			}
		} else if (tableObject.TableId == environment.todoTableId) {
			// Update todo
			var todo = ConvertTableObjectToTodo(tableObject)
			if (!todo) return

			if (todo.list) {
				// Update the root todo list of the todo
				let root = await this.dataService.GetRootOfTodo(todo)

				if (root) {
					this.dataService.UpdateTodoList(root)
				}
			} else {
				this.dataService.UpdateTodo(todo)
			}
		} else if (tableObject.TableId == environment.todoListTableId) {
			// Update todo list
			let todoList = await ConvertTableObjectToTodoList(tableObject)

			if (todoList) {
				let root: TodoList = null

				if (todoList.list) {
					// Get the root of the todo list
					root = await this.dataService.GetRootOfTodoList(todoList)
				} else {
					root = todoList
				}

				if (root) {
					this.dataService.UpdateTodoList(todoList)
				}
			}
		}
	}

	async DeleteTableObject(tableObject: TableObject) {
		if (tableObject.TableId == environment.appointmentTableId) {
			// Remove appointment
			var appointment = ConvertTableObjectToAppointment(tableObject)

			if (appointment) {
				this.dataService.RemoveAppointment(appointment)
			}
		} else if (tableObject.TableId == environment.todoTableId) {
			// Remove todo
			var todo = ConvertTableObjectToTodo(tableObject)
			if (!todo) return

			if (todo.list) {
				// Update the root todo list of the todo
				let root = await this.dataService.GetRootOfTodo(todo)

				if (root) {
					this.dataService.UpdateTodoList(root)
				}
			} else {
				this.dataService.RemoveTodo(todo)
			}
		} else if (tableObject.TableId == environment.todoListTableId) {
			// Remove todo list
			let todoList = await ConvertTableObjectToTodoList(tableObject)
			if (!todoList) return

			if (todoList.list) {
				// Update the root todo list
				let root = await this.dataService.GetRootOfTodoList(todoList)

				if (root) {
					this.dataService.UpdateTodoList(root)
				}
			} else {
				this.dataService.RemoveTodoList(todoList)
			}
		}
	}
	//#endregion

	setTitleBarColor() {
		if (window["Windows"] && window["Windows"].UI.ViewManagement) {
			// #007bff
			var themeColor = {
				r: 0,
				g: 123,
				b: 255,
				a: 255
			}

			let titleBar =
				window[
					"Windows"
				].UI.ViewManagement.ApplicationView.getForCurrentView().titleBar
			titleBar.foregroundColor = themeColor
			titleBar.backgroundColor = themeColor
			titleBar.buttonBackgroundColor = themeColor
			titleBar.buttonInactiveBackgroundColor = themeColor
			titleBar.inactiveForegroundColor = themeColor
			titleBar.inactiveBackgroundColor = themeColor
		}
	}
}
