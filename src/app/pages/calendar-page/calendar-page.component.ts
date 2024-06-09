import { Component } from "@angular/core"
import { Router } from "@angular/router"
import { Settings, DateTime } from "luxon"
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
	styleUrl: "./calendar-page.component.scss"
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

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		private router: Router
	) {
		Settings.defaultLocale = navigator.language
	}

	async ngOnInit() {
		await this.dataService.appointmentsPromiseHolder.AwaitResult()

		// Get the short weekday labels
		let currentWeekDay = DateTime.now().startOf("week")

		for (let i = 0; i < 7; i++) {
			this.weekdayLabels.push(currentWeekDay.weekdayLong)
			this.weekdayLabelsShort.push(currentWeekDay.weekdayShort)
			currentWeekDay = currentWeekDay.plus({ days: 1 })
		}

		this.loadMonths()

		this.currentMonth = this.months.find(m =>
			m.date.hasSame(this.currentDate, "month")
		)
	}

	async ngAfterViewInit() {
		let todayLabel = document.querySelector(".today-mobile")

		while (todayLabel == null) {
			await new Promise(r => setTimeout(r, 100))
			todayLabel = document.querySelector(".today-mobile")
		}

		let rect = todayLabel.getBoundingClientRect()

		this.dataService.contentContainer.scrollTo({
			top: rect.y - window.innerHeight / 2
		})
	}

	showPreviousMonth() {
		this.currentDate = this.currentDate.minus({ months: 1 })
		this.loadMonths()

		this.currentMonth = this.months.find(m =>
			m.date.hasSame(this.currentDate, "month")
		)
	}

	showNextMonth() {
		this.currentDate = this.currentDate.plus({ months: 1 })
		this.loadMonths()

		this.currentMonth = this.months.find(m =>
			m.date.hasSame(this.currentDate, "month")
		)
	}

	loadMonths() {
		let date = this.currentDate.minus({ months: 4 })

		for (let i = 0; i < 9; i++) {
			this.loadMonth(date)
			date = date.plus({ months: 1 })
		}
	}

	loadMonth(date: DateTime) {
		// Check if the given month is already loaded
		let monthLabel = date.toFormat(monthLabelFormat)
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
				let label = currentDate.toFormat("d")
				let isToday = today.hasSame(currentDate, "day")
				let appointments =
					this.dataService.GetAppointmentsOfDay(currentDate)

				currentWeek.days.push({
					id,
					date: currentDate,
					label,
					today: isToday,
					appointments
				})

				if (currentDate.hasSame(date, "month")) {
					currentMobileWeek.days.push({
						id,
						date: currentDate,
						label,
						today: isToday,
						appointments
					})
				} else {
					currentMobileWeek.days.push({
						id,
						date: null,
						label: null,
						today: isToday,
						appointments: []
					})
				}

				currentDate = currentDate.plus({ days: 1 })
			}

			weeks.push(currentWeek)
			mobileWeeks.push(currentMobileWeek)
		}

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
	}

	getCalendarDayPageLink(date: DateTime) {
		return `calendar/${date.year}/${date.month}/${date.day}`
	}

	navigateToDay(event: PointerEvent, date: DateTime) {
		event.preventDefault()

		this.router.navigate(["calendar", date.year, date.month, date.day])
	}
}
