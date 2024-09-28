import { DateTime } from "luxon"
import { Appointment } from "./models/Appointment"
import { Todo } from "./models/Todo"
import { TodoList } from "./models/TodoList"

export enum Theme {
	System,
	Light,
	Dark
}

export interface StartDay {
	date: DateTime
	formattedDate: string
	shortTopFormattedDate: string
	shortBottomFormattedDate: string
	calendarDayPageLink: string
	appointments: Appointment[]
	todos: Todo[]
	todoLists: TodoList[]
}

export interface CalendarDayData {
	id: string
	date: DateTime
	label: string
	today: boolean
	appointments: Appointment[]
	todos: Todo[]
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

export interface TodoDay {
	date: DateTime
	formattedDate: string
	calendarDayPageLink: string
	todos: Todo[]
	todoLists: TodoList[]
}

export interface TodoGroup {
	name: string
	todos: Todo[]
	todoLists: TodoList[]
}

export interface AppointmentDialogEventData {
	name: string
	date: DateTime
	allDay: boolean
	color: string
	startTimeHour: number
	startTimeMinute: number
	endTimeHour: number
	endTimeMinute: number
	activateReminder: boolean
	reminderSecondsBefore: number
}

export interface TodoDialogEventData {
	name: string
	date: DateTime
	labels: string[]
}
