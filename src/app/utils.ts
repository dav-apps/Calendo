import { DateTime } from "luxon"
import {
	Notification as DavNotification,
	GetNotification,
	SetupWebPushSubscription
} from "dav-js"
import { Appointment } from "./models/Appointment"
import { Todo } from "./models/Todo"
import { TodoList } from "./models/TodoList"
import { AppointmentDialogComponent } from "./dialogs/appointment-dialog/appointment-dialog.component"
import { Theme, TodoDay, AppointmentDialogEventData } from "./types"
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

export function getRootOfTodo(todo: Todo, allTodoLists: TodoList[]): TodoList {
	if (todo.list == null) return null

	let parent = allTodoLists.find(t => t.uuid == todo.list)
	if (parent == null) return null

	if (parent.list != null) {
		// Get the parent of the parent
		return getRootOfTodoList(parent, allTodoLists)
	} else {
		return parent
	}
}

export function getRootOfTodoList(
	todoList: TodoList,
	allTodoLists: TodoList[]
): TodoList {
	if (!todoList.list) return todoList

	let parentUuid = todoList.list
	let currentList: TodoList = todoList

	while (parentUuid != null) {
		currentList = allTodoLists.find(t => t.uuid == parentUuid)

		if (currentList != null) {
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

export function getNotificationPermission(): NotificationPermission {
	return Notification.permission
}

export function generateAppointmentNotificationBody(
	start: DateTime,
	end: DateTime,
	allDay: boolean,
	fullDayEventString: string
): string {
	if (allDay) {
		return `${fullDayEventString}, ${start.toFormat("DDD")}`
	} else {
		return `${start.toFormat("T")} - ${end.toFormat("T")}`
	}
}

export async function showEditAppointmentDialog(
	appointment: Appointment,
	editAppointmentDialog: AppointmentDialogComponent
) {
	let startDate = DateTime.fromSeconds(appointment.start)
	let endDate = DateTime.fromSeconds(appointment.end)
	let notification: DavNotification = null

	if (appointment.notificationUuid != null) {
		notification = await GetNotification(appointment.notificationUuid)
	}

	editAppointmentDialog.name = appointment.name
	editAppointmentDialog.date = startDate
	editAppointmentDialog.selectedColor = appointment.color
	editAppointmentDialog.allDay = appointment.allday
	editAppointmentDialog.startTimeHour = startDate.hour
	editAppointmentDialog.startTimeMinute = startDate.minute
	editAppointmentDialog.endTimeHour = endDate.hour
	editAppointmentDialog.endTimeMinute = endDate.minute
	editAppointmentDialog.activateReminder = notification != null

	if (notification != null) {
		editAppointmentDialog.reminderDropdownSelectedKey = (
			startDate.toUnixInteger() - notification.Time
		).toString()
	} else {
		editAppointmentDialog.reminderDropdownSelectedKey = "3600"
	}

	editAppointmentDialog.show()
}

export async function createAppointment(
	event: AppointmentDialogEventData,
	fullDayEventString: string
) {
	let startTime = event.date.set({
		hour: event.startTimeHour,
		minute: event.startTimeMinute
	})

	let endTime = event.date.set({
		hour: event.endTimeHour,
		minute: event.endTimeMinute
	})

	if (endTime < startTime) {
		endTime = endTime.plus({ days: 1 })
	}

	let notificationUuid = null

	if (event.activateReminder && (await SetupWebPushSubscription())) {
		let reminderTime = startTime.minus({
			seconds: event.reminderSecondsBefore
		})

		// Create the notification
		let notification = new DavNotification({
			Time: reminderTime.toUnixInteger(),
			Interval: 0,
			Title: event.name,
			Body: generateAppointmentNotificationBody(
				startTime,
				endTime,
				event.allDay,
				fullDayEventString
			)
		})

		await notification.Save()
		notificationUuid = notification.Uuid
	}

	return await Appointment.Create(
		event.name,
		startTime.toUnixInteger(),
		endTime.toUnixInteger(),
		event.allDay,
		event.color,
		notificationUuid
	)
}

export async function updateAppointment(
	event: AppointmentDialogEventData,
	appointment: Appointment,
	fullDayEventString: string
) {
	let startTime = event.date.set({
		hour: event.startTimeHour,
		minute: event.startTimeMinute
	})

	let endTime = event.date.set({
		hour: event.endTimeHour,
		minute: event.endTimeMinute
	})

	let notification: DavNotification = null

	if (appointment.notificationUuid != null) {
		notification = await GetNotification(appointment.notificationUuid)
	}

	if (!event.activateReminder && notification != null) {
		await notification.Delete()
		notification = null
	} else if (event.activateReminder) {
		let reminderTime = startTime.minus({
			seconds: event.reminderSecondsBefore
		})

		if (appointment.notificationUuid == null) {
			// Create a new notification
			notification = new DavNotification({
				Time: reminderTime.toUnixInteger(),
				Interval: 0,
				Title: event.name,
				Body: generateAppointmentNotificationBody(
					startTime,
					endTime,
					event.allDay,
					fullDayEventString
				)
			})

			await notification.Save()
		} else if (notification != null) {
			// Update the existing notification
			notification = await GetNotification(appointment.notificationUuid)

			if (notification != null) {
				notification.Title = event.name
				notification.Time = reminderTime.toUnixInteger()
				notification.Body = generateAppointmentNotificationBody(
					startTime,
					endTime,
					event.allDay,
					fullDayEventString
				)

				await notification.Save()
			}
		}
	}

	await appointment.Update(
		event.name,
		startTime.toUnixInteger(),
		endTime.toUnixInteger(),
		event.allDay,
		event.color,
		notification?.Uuid
	)
}
