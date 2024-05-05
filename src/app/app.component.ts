import { Component, HostListener } from "@angular/core"
import { Router, ActivatedRoute, NavigationStart } from "@angular/router"
import {
	faCircleUser as faCircleUserSolid,
	faGear as faGearSolid,
	faHouse as faHouseSolid,
	faCalendar as faCalendarSolid,
	faSquareCheck as faSquareCheckSolid
} from "@fortawesome/free-solid-svg-icons"
import { faCalendars as faCalendarsSolid } from "@fortawesome/pro-solid-svg-icons"
import {
	faCircleUser as faCircleUserRegular,
	faGear as faGearRegular,
	faHouse as faHouseRegular,
	faCalendar as faCalendarRegular,
	faSquareCheck as faSquareCheckRegular,
	faCalendars as faCalendarsRegular
} from "@fortawesome/pro-regular-svg-icons"
import { Dav, Environment, TableObject } from "dav-js"
import * as DavUIComponents from "dav-ui-components"
import { environment } from "../environments/environment"
import { enUS } from "../locales/locales"
import { DataService } from "./services/data-service"
import { LocalizationService } from "./services/localization-service"
import { ConvertTableObjectToAppointment } from "./models/Appointment"
import { ConvertTableObjectToTodo } from "./models/Todo"
import { TodoList, ConvertTableObjectToTodoList } from "./models/TodoList"

const mobileMaxSize = 768

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	locale = enUS.navbar
	faCircleUserSolid = faCircleUserSolid
	faCircleUserRegular = faCircleUserRegular
	faGearSolid = faGearSolid
	faGearRegular = faGearRegular
	faHouseSolid = faHouseSolid
	faHouseRegular = faHouseRegular
	faCalendarSolid = faCalendarSolid
	faCalendarRegular = faCalendarRegular
	faSquareCheckSolid = faSquareCheckSolid
	faSquareCheckRegular = faSquareCheckRegular
	faCalendarsSolid = faCalendarsSolid
	faCalendarsRegular = faCalendarsRegular
	windowWidth: number = 500
	currentUrl: string = "/"
	startTabActive: boolean = false
	calendarTabActive: boolean = false
	todosTabActive: boolean = false
	appointmentsTabActive: boolean = false
	userButtonSelected: boolean = false
	settingsButtonSelected: boolean = false

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		this.locale = this.localizationService.locale.navbar
		DavUIComponents.setLocale(this.dataService.locale)

		this.router.events.forEach(data => {
			if (data instanceof NavigationStart) {
				// Update the updated todo lists
				this.dataService.UpdateUpdatedTodoLists()
				this.currentUrl = data.url.split("?")[0]

				this.startTabActive = this.currentUrl == "/"
				this.calendarTabActive = this.currentUrl.startsWith("/calendar")
				this.todosTabActive = this.currentUrl == "/todos"
				this.appointmentsTabActive = this.currentUrl == "/appointments"
				this.userButtonSelected = this.currentUrl == "/user"
				this.settingsButtonSelected = this.currentUrl == "/settings"
			}
		})

		this.activatedRoute.queryParams.subscribe(async params => {
			if (params["accessToken"]) {
				// Log in with the access token
				await this.dataService.dav.Login(params["accessToken"])

				// Reload the page without accessToken in the url
				let url = new URL(window.location.href)
				url.searchParams.delete("accessToken")
				window.location.href = url.toString()
			}
		})
	}

	async ngOnInit() {
		this.setSize()
		this.dataService.loadTheme()

		// Initialize dav
		new Dav({
			environment: environment.environment,
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
		this.dataService.isMobile = window.innerWidth < mobileMaxSize
		this.windowWidth = window.innerWidth
	}

	navigateToPage(path: string) {
		this.router.navigate([path])
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
}
