import { Appointment } from "./models/Appointment"
import { Todo } from "./models/Todo"
import { TodoList, GetTodoList } from "./models/TodoList"
import { Theme, TodoDay } from "./types"
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

export function sortTodoDays(todoDays: TodoDay[]) {
	todoDays.sort((a: TodoDay, b: TodoDay) => {
		if (a.date < b.date) {
			return -1
		} else if (a.date > b.date) {
			return 1
		} else {
			return 0
		}
	})
}

export async function getRootOfTodo(todo: Todo): Promise<TodoList> {
	if (!todo.list) return null

	let parent = await GetTodoList(todo.list)
	if (!parent) return null

	if (parent.list) {
		// Get the parent of the parent
		return await this.GetRootOfTodoList(parent)
	} else {
		return parent
	}
}

export async function getRootOfTodoList(todoList: TodoList): Promise<TodoList> {
	if (!todoList.list) return todoList

	let parentUuid = todoList.list
	let currentList: TodoList = todoList

	while (parentUuid) {
		currentList = await GetTodoList(parentUuid)

		if (currentList) {
			parentUuid = currentList.list
		} else {
			return null
		}
	}

	return currentList
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
