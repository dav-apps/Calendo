import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { Router, ActivatedRoute } from "@angular/router"
import { DateTime } from "luxon"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons"
import {
	faArrowLeft as faArrowLeftLight,
	faArrowRight as faArrowRightLight
} from "@fortawesome/pro-light-svg-icons"
import { CalendarWeekData, CalendarMonthData } from "src/app/types"
import { monthLabelFormat } from "src/app/constants"

@Component({
	templateUrl: "./calendar-page.component.html",
	styleUrl: "./calendar-page.component.scss",
	standalone: false
})
export class CalendarPageComponent {
	locale = this.localizationService.locale.calendarPage
	faAngleLeft = faAngleLeft
	faAngleRight = faAngleRight
	faArrowLeftLight = faArrowLeftLight
	faArrowRightLight = faArrowRightLight

	currentDate: DateTime = DateTime.now()
	currentMonth: CalendarMonthData = null
	weekdayLabels: string[] = []
	weekdayLabelsShort: string[] = []
	months: CalendarMonthData[] = []
	mobileMonths: CalendarMonthData[] = []
	isLoadingPreviousMonth: boolean = false
	loadPreviousMonthAgain: boolean = false
	isLoadingNextMonth: boolean = false
	loadNextMonthAgain: boolean = false
	todayLabelMobile: HTMLElement = null
	monthAddedTimeoutRunning: boolean = false

	@ViewChild("container")
	container: ElementRef<HTMLDivElement>

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) {}

	async ngOnInit() {
		await Promise.all([
			this.dataService.loadAppointments(),
			this.dataService.loadTodos(),
			this.dataService.loadTodoLists()
		])

		let params = this.activatedRoute.snapshot.params
		let year = Number(params.year)
		let month = Number(params.month)

		if (!isNaN(year) && !isNaN(month)) {
			this.currentDate = this.currentDate.set({ year, month })
		}

		// Get the short weekday labels
		let currentWeekDay = this.currentDate.startOf("week")

		for (let i = 0; i < 7; i++) {
			this.weekdayLabels.push(currentWeekDay.weekdayLong)
			this.weekdayLabelsShort.push(currentWeekDay.weekdayShort)
			currentWeekDay = currentWeekDay.plus({ days: 1 })
		}

		this.loadMonths()

		this.currentMonth = this.months.find(m =>
			m.date.hasSame(this.currentDate, "month")
		)

		this.dataService.contentContainer.addEventListener("scroll", () => {
			const distance = 2000
			let scrollTop = this.dataService.contentContainer.scrollTop
			let scrollEnd =
				this.dataService.contentContainer.scrollHeight - window.innerHeight

			if (scrollTop < distance) {
				if (this.monthAddedTimeoutRunning) return

				// Top scroll position
				this.loadPreviousMonth()

				this.monthAddedTimeoutRunning = true
				setTimeout(() => (this.monthAddedTimeoutRunning = false), 500)
			} else if (scrollTop > scrollEnd - distance) {
				// Bottom scroll position
				this.loadNextMonth()
			}
		})

		window.addEventListener("calendarpage-scrolltop", () => {
			this.scrollToCurrentDate(true)
		})
	}

	async ngAfterViewInit() {
		await this.scrollToCurrentDate()
	}

	ngOnDestroy() {
		window.removeAllListeners("calendarpage-scrolltop")
	}

	@HostListener("window:keydown", ["$event"])
	async onKeyDown(event: KeyboardEvent) {
		switch (event.code) {
			case "ArrowLeft": // Left arrow key
				this.showPreviousMonth()
				break
			case "ArrowRight": // Right arrow key
				this.showNextMonth()
				break
		}
	}

	async scrollToCurrentDate(smooth: boolean = false) {
		if (this.todayLabelMobile == null) {
			this.todayLabelMobile = document.querySelector(".today-mobile")

			while (this.todayLabelMobile == null) {
				await new Promise(r => setTimeout(r, 100))
				this.todayLabelMobile = document.querySelector(".today-mobile")
			}
		}

		this.dataService.contentContainer.scrollTo({
			top: this.todayLabelMobile.offsetTop - window.innerHeight / 2,
			behavior: smooth ? "smooth" : "instant"
		})
	}

	showPreviousMonth() {
		this.currentDate = this.currentDate.minus({ months: 1 })
		this.loadMonths()

		this.currentMonth = this.months.find(m =>
			m.date.hasSame(this.currentDate, "month")
		)

		this.router.navigate([
			"calendar",
			this.currentDate.year,
			this.currentDate.month
		])
	}

	showNextMonth() {
		this.currentDate = this.currentDate.plus({ months: 1 })
		this.loadMonths()

		this.currentMonth = this.months.find(m =>
			m.date.hasSame(this.currentDate, "month")
		)

		this.router.navigate([
			"calendar",
			this.currentDate.year,
			this.currentDate.month
		])
	}

	loadPreviousMonth() {
		if (this.isLoadingPreviousMonth) {
			this.loadPreviousMonthAgain = true
			return
		}

		// Get the earliest month
		let date = this.mobileMonths[0].date
		let previousMonthDate = date.minus({ months: 1 })

		this.loadMonth(previousMonthDate, "start")

		this.isLoadingPreviousMonth = false

		if (this.loadPreviousMonthAgain) {
			this.loadPreviousMonth()
		}
	}

	loadNextMonth() {
		if (this.isLoadingNextMonth) {
			this.loadNextMonthAgain = true
			return
		}

		// Get the last month
		let date = this.mobileMonths[this.mobileMonths.length - 1].date
		let nextMonthDate = date.plus({ months: 1 })

		this.loadMonth(nextMonthDate)

		this.isLoadingNextMonth = false

		if (this.loadNextMonthAgain) {
			this.loadNextMonth()
		}
	}

	loadMonths() {
		let date = this.currentDate.minus({ months: 9 })

		for (let i = 0; i < 19; i++) {
			this.loadMonth(date)
			date = date.plus({ months: 1 })
		}
	}

	loadMonth(date: DateTime, position: "start" | "end" = "end") {
		// Check if the given month is already loaded
		let monthLabel = date.toFormat(monthLabelFormat, {
			locale: this.dataService.locale
		})
		let month = this.months.find(m => m.label == monthLabel)
		if (month != null) return

		// Load the weeks
		let today = DateTime.now()
		let currentDate = date.startOf("month").startOf("week")
		let endOfMonth = date.endOf("month").endOf("week")
		let weeks: CalendarWeekData[] = []
		let mobileWeeks: CalendarWeekData[] = []

		while (currentDate < endOfMonth) {
			let currentWeek: CalendarWeekData = {
				id: crypto.randomUUID(),
				days: []
			}

			let currentMobileWeek: CalendarWeekData = {
				id: currentWeek.id,
				days: []
			}

			for (let i = 0; i < 7; i++) {
				let id = crypto.randomUUID()
				let label = currentDate.toFormat("d", {
					locale: this.dataService.locale
				})
				let isToday = today.hasSame(currentDate, "day")
				let appointments =
					this.dataService.getAppointmentsOfDay(currentDate)
				let todos = this.dataService.getTodosOfDay(currentDate, false, true)

				currentWeek.days.push({
					id,
					date: currentDate,
					label,
					today: isToday,
					appointments,
					todos
				})

				if (currentDate.hasSame(date, "month")) {
					currentMobileWeek.days.push({
						id,
						date: currentDate,
						label,
						today: isToday,
						appointments,
						todos
					})
				} else {
					currentMobileWeek.days.push({
						id,
						date: null,
						label: null,
						today: isToday,
						appointments: [],
						todos: []
					})
				}

				currentDate = currentDate.plus({ days: 1 })
			}

			weeks.push(currentWeek)
			mobileWeeks.push(currentMobileWeek)
		}

		if (position == "end") {
			this.months.push({
				date,
				label: monthLabel,
				weeks
			})

			this.mobileMonths.push({
				date,
				label: monthLabel,
				weeks: mobileWeeks
			})
		} else {
			this.months.splice(0, 0, {
				date,
				label: monthLabel,
				weeks
			})

			this.mobileMonths.splice(0, 0, {
				date,
				label: monthLabel,
				weeks: mobileWeeks
			})
		}
	}

	getCalendarDayPageLink(date: DateTime) {
		return `calendar/${date.year}/${date.month}/${date.day}`
	}

	navigateToDay(event: PointerEvent, date: DateTime) {
		event.preventDefault()

		this.router.navigate(["calendar", date.year, date.month, date.day])
	}
}
