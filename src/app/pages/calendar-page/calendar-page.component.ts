import { Component, ViewChild, ElementRef } from "@angular/core"
import { Router } from "@angular/router"
import { Settings, DateTime } from "luxon"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons"
import {
	faArrowLeft as faArrowLeftLight,
	faArrowRight as faArrowRightLight
} from "@fortawesome/pro-light-svg-icons"

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
	@ViewChild("calendarContainer", { read: ElementRef, static: true })
	calendarContainer: ElementRef<any>
	@ViewChild("mobileCalendarContainer", { read: ElementRef, static: true })
	mobileCalendarContainer: ElementRef<any>
	weekDayLabels: string[] = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]
	dayFormat: string = "D"
	fullDayFormat: string = "dddd D"

	showMobileLayout: boolean = true
	isInitializing: boolean = true
	calendarHeight: number = 500
	calendarWidth: number = 200
	calendarDayHeight: number = this.showMobileLayout
		? this.calendarHeight / 7
		: this.calendarHeight / 5
	calendarDayWidth: number = window.innerWidth / 7

	topDay: DateTime = DateTime.now() // The day at the very top of the mobile view
	currentDay: DateTime = DateTime.now()
	currentDayOfWeek: number = 0
	position: number = 1
	visibleRows: number = 5 // The number of days that are visible
	dayBuffer: number = 14 // The number of days of each before and after the current day
	scrolled: boolean = false // If true, load the todos and appointments in the days after the 2 seconds interval
	currentWeekDays: string[] = ["1", "2", "3", "4", "5", "6", "7"]

	currentMonth: string = ""

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService,
		private router: Router
	) {
		Settings.defaultLocale = navigator.language

		this.currentMonth = DateTime.now().toFormat("LLLL yyyy")

		// Get the short weekday labels
		let weekdays = []

		for (let i = 0; i < 7; i++) {
			weekdays.push(
				DateTime.now().plus({ days: i }).startOf("week").weekdayShort
			)
		}

		for (let i = 0; i < weekdays.length; i++) {
			if (i < 6) {
				this.weekDayLabels[i] = weekdays[i + 1]
			} else {
				this.weekDayLabels[i] = weekdays[0]
			}
		}
	}

	async ngOnInit() {
		await this.initialize()

		/*
		$("#calendarContainer").scroll(() => this.onScroll())
		$("#mobileCalendarContainer").scroll(() => this.onScroll())

		$(document).keydown(e => {
			if (this.showMobileLayout) return
			if (e.keyCode === 38 || e.keyCode === 37) {
				// Arrow up or Arrow left
				this.ShowPrevious()
			} else if (e.keyCode === 40 || e.keyCode === 39) {
				// Arrow down or Arrow right
				this.ShowNext()
			}
		})

		$(document).bind("mousewheel", e => {
			if (this.showMobileLayout) return
			if (e.originalEvent.wheelDelta > 0) {
				// Wheel up
				this.ShowPrevious()
			} else {
				// Wheel down
				this.ShowNext()
			}
		})
		*/
	}

	async initialize() {
		this.topDay = DateTime.now().minus({ days: this.dayBuffer })

		this.fillDaysMobile()
		this.fillDaysDesktop()

		setTimeout(() => {
			this.setSize()

			setTimeout(() => {
				this.scrollToDate(this.currentDay)
				this.setSize()

				setTimeout(() => {
					this.isInitializing = false
				}, 500)
			}, 1)
		}, 1)

		if (this.showMobileLayout) {
			setInterval(() => {
				if (this.scrolled) {
					this.dataService.UpdateCalendarDays()
					this.scrolled = false
				}
			}, 2000)
		}
	}

	onScroll() {
		if (!this.isInitializing && this.showMobileLayout) {
			let bufferAbove = this.dayBuffer * this.calendarDayHeight // The height of all days before the current day
			let bufferBelow =
				this.dataService.mobileCalendarDaysDates.length *
					this.calendarDayHeight -
				bufferAbove // The height of the days from the current day to the last one

			if (
				this.mobileCalendarContainer.nativeElement.scrollTop < bufferAbove
			) {
				// The user scrolled into the buffer above
				this.addDayTop()
				this.scrolled = true

				/*
				// Update the scrollTop value (only needed in Edge and Firefox)
				if (
					platform.name.includes("Firefox") ||
					platform.name.includes("Edge")
				) {
					this.mobileCalendarContainer.nativeElement.scrollTop +=
						this.calendarDayHeight
				}
				*/
			} else if (
				this.mobileCalendarContainer.nativeElement.scrollTop > bufferBelow
			) {
				// The user scrolled into the buffer below
				this.addDayBottom()
				this.scrolled = true
			} else {
				this.position = Math.floor(
					this.mobileCalendarContainer.nativeElement.scrollTop /
						this.calendarDayHeight
				)

				this.currentDay = this.topDay.plus({ days: this.position })
				this.updateCurrentWeekDays()
			}
		}
	}

	fillDaysMobile() {
		this.dataService.mobileCalendarDaysDates = []
		this.dataService.mobileCalendarDaysAppointments = []
		this.dataService.mobileCalendarDaysTodos = []

		// Get the first day of the top week
		let date = this.topDay.startOf("day")

		// Fill the days array with values
		for (let i = 0; i < this.dayBuffer * 2; i++) {
			this.dataService.mobileCalendarDaysDates.push(date.toUnixInteger())
			this.dataService.mobileCalendarDaysAppointments.push([])
			this.dataService.mobileCalendarDaysTodos.push([])

			date = date.plus({ days: 1 })
		}

		this.updateCurrentWeekDays()
		this.dataService.UpdateCalendarDays()
	}

	fillDaysDesktop() {
		this.dataService.desktopCalendarDaysDates = []
		this.dataService.desktopCalendarDaysAppointments = []
		this.dataService.desktopCalendarDaysTodos = []

		let startDate = this.currentDay
			.startOf("month")
			.startOf("week")
			.startOf("day")
		let endDate = this.currentDay.startOf("month").endOf("week").endOf("day")
		let date = startDate
		let dates = []

		while (date < endDate) {
			dates.push(date.toUnixInteger())
			date = date.plus({ days: 1 })
		}

		let datesWeek = []

		for (let i = 0; i < dates.length; i++) {
			datesWeek.push(dates[i])

			if (datesWeek.length == 7) {
				// Add the datesWeek to the desktopCalendarDays array
				this.dataService.desktopCalendarDaysDates.push(datesWeek)
				this.dataService.desktopCalendarDaysAppointments.push([
					[],
					[],
					[],
					[],
					[],
					[],
					[]
				])
				this.dataService.desktopCalendarDaysTodos.push([
					[],
					[],
					[],
					[],
					[],
					[],
					[]
				])

				datesWeek = []
			}
		}

		this.dataService.UpdateCalendarDays()
	}

	scrollToDate(date: DateTime) {
		let dateStart: number = date.startOf("day").toUnixInteger()
		let days = 0

		for (let day of this.dataService.mobileCalendarDaysDates) {
			if (
				DateTime.fromSeconds(day).startOf("day").toUnixInteger() ==
				dateStart
			) {
				break
			}

			days++
		}

		this.mobileCalendarContainer.nativeElement.scrollTop =
			days * this.calendarDayHeight + 1
		this.updateCurrentWeekDays()
	}

	addDayTop() {
		this.topDay = this.topDay.minus({ days: 1 })

		// Add a new entry at the beginning of the mobileCalendarDaysDates and the todos and appointments arrays
		this.dataService.mobileCalendarDaysDates.unshift(
			this.topDay.startOf("day").toUnixInteger()
		)
		this.dataService.mobileCalendarDaysAppointments.unshift([])
		this.dataService.mobileCalendarDaysTodos.unshift([])
	}

	addDayBottom() {
		let date = this.topDay
			.plus({ days: this.dataService.mobileCalendarDaysDates.length })
			.startOf("day")

		// Add a new entry at the end of the mobileCalendarDaysDates and the todos and appointments arrays
		this.dataService.mobileCalendarDaysDates.push(date.toUnixInteger())
		this.dataService.mobileCalendarDaysAppointments.push([])
		this.dataService.mobileCalendarDaysTodos.push([])
	}

	ShowPrevious() {
		this.currentDay = this.currentDay.minus({ months: 1 })
		this.fillDaysDesktop()
		this.setSize()
	}

	ShowNext() {
		this.currentDay = this.currentDay.plus({ months: 1 })
		this.fillDaysDesktop()
		this.setSize()
	}

	updateCurrentWeekDays() {
		let date = this.currentDay.startOf("week")

		for (let i = 0; i < 7; i++) {
			this.currentWeekDays[i] = date.toFormat("D")
			date.plus({ days: 1 })
		}

		this.currentDayOfWeek = this.currentDay.weekday - 1
	}

	setSize() {
		this.showMobileLayout = window.innerWidth < 650

		this.calendarContainer.nativeElement.hidden = this.showMobileLayout
		this.mobileCalendarContainer.nativeElement.hidden = !this.showMobileLayout

		/*
		this.calendarWidth = window.innerWidth
		this.calendarHeight =
			window.innerHeight -
			$("#calendo-navbar").height() -
			$("#calendar-top-bar").height() -
			$("#calendar-label-div").height() -
			(this.showMobileLayout ? 86 : 56)
		*/

		this.calendarDayHeight =
			this.calendarHeight / this.dataService.desktopCalendarDaysDates.length
		this.calendarDayWidth = this.calendarWidth / 7
	}

	onResize() {
		let showMobileLayoutBefore = this.showMobileLayout
		this.setSize()

		// If it was desktop before and is now mobile
		if (!showMobileLayoutBefore && this.showMobileLayout) {
			// Scroll to the current page
			this.scrollToDate(DateTime.now())
		}
	}

	dayClicked(date: number) {
		this.router.navigate(["/calendar/day", date])
	}

	goToWeekday(index: number) {
		this.scrollToDate(this.currentDay.startOf("week").plus({ days: index }))
	}

	getFullDayOfDate(date: number) {
		return DateTime.fromSeconds(date).toFormat(this.fullDayFormat)
	}

	getDayOfDate(date: number) {
		DateTime.fromSeconds(date).toFormat(this.dayFormat)
	}

	getCurrentMonth() {
		return this.currentDay.toFormat("MMMM")
	}

	getCurrentYear(): number {
		return this.currentDay.year
	}

	getTimeOfDate(date: number) {
		return DateTime.fromSeconds(date).toFormat("H:mm")
	}

	getDayBackgroundColor(i: number, j: number) {
		let date = DateTime.fromSeconds(
			this.dataService.desktopCalendarDaysDates[i][j]
		)

		if (this.isToday(date)) {
			// Current day
			return this.dataService.darkTheme ? "#3d4753" : "#dddddd"
		} else if (date.month == this.currentDay.month) {
			// Current month
			return this.dataService.darkTheme ? "#1c2938" : "#f9f9f9"
		} else {
			// Last or next month
			return this.dataService.darkTheme ? "#15202b" : "#ffffff"
		}
	}

	isTimestampToday(timestamp: number): boolean {
		return this.isToday(DateTime.fromSeconds(timestamp))
	}

	isToday(date: DateTime): boolean {
		return (
			date.startOf("day").toUnixInteger() ==
			DateTime.now().startOf("day").toUnixInteger()
		)
	}
}
