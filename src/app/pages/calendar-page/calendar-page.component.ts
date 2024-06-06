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
		// Check if the current month is already loaded
		let monthLabel = this.currentDate.toFormat(monthLabelFormat)
		let month = this.months.find(m => m.label == monthLabel)
		if (month != null) return

		// Load the weeks
		let currentDate = this.currentDate.startOf("month").startOf("week")
		let endOfMonth = this.currentDate.endOf("month").endOf("week")
		let weeks: CalendarWeekData[] = []

		while (currentDate < endOfMonth) {
			let currentWeek: CalendarWeekData = {
				id: crypto.randomUUID(),
				days: []
			}

			for (let i = 0; i < 7; i++) {
				currentWeek.days.push({
					id: crypto.randomUUID(),
					date: currentDate,
					label: currentDate.toFormat("d"),
					appointments: this.dataService.GetAppointmentsOfDay(currentDate)
				})

				currentDate = currentDate.plus({ days: 1 })
			}

			weeks.push(currentWeek)
		}

		this.months.push({
			date: this.currentDate,
			label: monthLabel,
			weeks
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
