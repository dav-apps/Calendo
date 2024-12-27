import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
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
import { Dav, TableObject } from "dav-js"
import * as DavUIComponents from "dav-ui-components"
import { environment } from "../environments/environment"
import { DataService } from "./services/data-service"
import { LocalizationService } from "./services/localization-service"
import { smallWindowMaxSize } from "src/app/constants"

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss",
	standalone: false
})
export class AppComponent {
	locale = this.localizationService.locale.misc
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
	currentUrl: string = "/"
	startTabActive: boolean = false
	calendarTabActive: boolean = false
	todosTabActive: boolean = false
	appointmentsTabActive: boolean = false
	userButtonSelected: boolean = false
	settingsButtonSelected: boolean = false

	@ViewChild("contentContainer")
	contentContainer: ElementRef<HTMLDivElement>

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {
		DavUIComponents.setLocale(this.dataService.locale)

		this.router.events.forEach(data => {
			if (data instanceof NavigationStart) {
				// Update the updated todo lists
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
					this.updateAllOfTable(tableId),
				UpdateTableObject: (tableObject: TableObject) =>
					this.updateTableObject(tableObject),
				DeleteTableObject: (tableObject: TableObject) =>
					this.updateTableObject(tableObject),
				UserLoaded: () => this.userLoaded()
			}
		})
	}

	ngAfterViewInit() {
		this.dataService.contentContainer = this.contentContainer.nativeElement
	}

	@HostListener("window:resize")
	setSize() {
		this.dataService.isMobile = window.innerWidth <= smallWindowMaxSize
	}

	navigateToPage(path: string) {
		this.router.navigate([path])
	}

	navigateToOverviewPage(event?: PointerEvent) {
		if (event != null) {
			event.preventDefault()
		}

		if (this.router.url == "/") {
			window.dispatchEvent(new Event("overviewpage-scrolltop"))
		} else {
			this.navigateToPage("/")
			this.dataService.contentContainer.scrollTop = 0
		}
	}

	navigateToCalendarPage() {
		if (this.router.url == "/calendar") {
			window.dispatchEvent(new Event("calendarpage-scrolltop"))
		} else {
			this.navigateToPage("calendar")
			this.dataService.contentContainer.scrollTop = 0
		}
	}

	navigateToAppointmentsPage() {
		if (this.router.url == "/appointments") {
			window.dispatchEvent(new Event("appointmentspage-scrolltop"))
		} else {
			this.navigateToPage("appointments")
			this.dataService.contentContainer.scrollTop = 0
		}
	}

	navigateToTodosPage() {
		if (this.router.url == "/todos") {
			window.dispatchEvent(new Event("todospage-scrolltop"))
		} else {
			this.navigateToPage("todos")
			this.dataService.contentContainer.scrollTop = 0
		}
	}

	//#region dav-js callback functions
	async updateAllOfTable(tableId: number) {
		if (tableId === environment.appointmentTableId) {
			this.dataService.appointmentsChanged = true
		} else if (tableId == environment.todoTableId) {
			this.dataService.todosChanged = true
			this.dataService.todoListsChanged = true
		} else if (tableId === environment.todoListTableId) {
			this.dataService.todoListsChanged = true
		}
	}

	async updateTableObject(tableObject: TableObject) {
		if (tableObject.TableId == environment.appointmentTableId) {
			this.dataService.appointmentsChanged = true
		} else if (tableObject.TableId == environment.todoTableId) {
			this.dataService.todosChanged = true
			this.dataService.todoListsChanged = true
		} else if (tableObject.TableId == environment.todoListTableId) {
			this.dataService.todoListsChanged = true
		}
	}

	userLoaded() {
		this.dataService.userPromiseHolder.Resolve()
	}
	//#endregion
}
