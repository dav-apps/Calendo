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
