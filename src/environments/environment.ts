import { Environment } from "dav-js"

export const environment = {
	environment: Environment.Development,
	apiKey: "gHgHKRbIjdguCM4cv5481hdiF5hZGWZ4x12Ur-7v",
	websiteUrl: "http://localhost:3000",
	appId: 5,
	todoListTableId: 13,
	todoTableId: 10,
	appointmentTableId: 11,
	// Keys for TodoList table
	todoListNameKey: "name",
	todoListTimeKey: "time",
	todoListTodosKey: "todos",
	todoListTodoListsKey: "todo_lists",
	todoListItemsKey: "items",
	todoListGroupsKey: "groups",
	todoListListKey: "list",
	// Keys for Todo table
	todoCompletedKey: "completed",
	todoTimeKey: "time",
	todoNameKey: "name",
	todoGroupsKey: "groups",
	todoListKey: "list",
	// Keys for Appointment table
	appointmentNameKey: "name",
	appointmentStartKey: "start",
	appointmentEndKey: "end",
	appointmentAllDayKey: "allday",
	appointmentColorKey: "color",
	appointmentDefaultColor: "1565C0",
	notificationUuidKey: "notification_uuid",
	visitKey: "visit",
	// Other constants
	themeKey: "theme",
	lightThemeKey: "light",
	darkThemeKey: "dark",
	systemThemeKey: "system"
}

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
