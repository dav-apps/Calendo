import { Appointment } from "./models/Appointment"
import { Todo } from "./models/Todo"
import { TodoList } from "./models/TodoList"
import { Theme } from "./types"
import { lightThemeKey, darkThemeKey } from "./constants"

export function sortAppointments(appointments: Appointment[]) {
	appointments.sort((a: Appointment, b: Appointment) => {
		if (a.allday) return -1
		if (b.allday) return 1

		if (a.start < b.start) {
			return -1
		} else if (a.start > b.start) {
			return 1
		} else {
			return 0
		}
	})
}

export function sortTodos(todos: Todo[]) {
	todos.sort((a: Todo, b: Todo) => {
		if (a.time < b.time) {
			return -1
		} else if (a.time > b.time) {
			return 1
		} else {
			return 0
		}
	})
}

export function sortTodoLists(todoLists: TodoList[]) {
	todoLists.sort((a: TodoList, b: TodoList) => {
		if (a.time < b.time) {
			return -1
		} else if (a.time > b.time) {
			return 1
		} else {
			return 0
		}
	})
}

export function convertStringToTheme(value: string): Theme {
	switch (value) {
		case lightThemeKey:
			return Theme.Light
		case darkThemeKey:
			return Theme.Dark
		default:
			return Theme.System
	}
}

export function bytesToGigabytesText(bytes: number, rounding: number): string {
	if (bytes == 0) return "0"

	let gb = Math.round(bytes / 1000000000).toFixed(rounding)
	return gb == "0.0" ? "0" : gb
}

export function randomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}
