import { DateTime } from "luxon"
import { Appointment } from "./models/Appointment"

export enum Theme {
	System,
	Light,
	Dark
}

export interface CalendarDayData {
	id: string
	date: DateTime
	label: string
	today: boolean
	appointments: Appointment[]
}

export interface CalendarWeekData {
	id: string
	days: CalendarDayData[]
}

export interface CalendarMonthData {
	date: DateTime
	label: string
	weeks: CalendarWeekData[]
}

export interface AppointmentDay {
	date: DateTime
	formattedDate: string
	calendarDayPageLink: string
	appointments: Appointment[]
}
