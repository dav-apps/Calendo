import { DateTime } from "luxon"

export enum Theme {
	System,
	Light,
	Dark
}

export interface CalendarDayData {
	id: string
	date: DateTime
	label: string
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
