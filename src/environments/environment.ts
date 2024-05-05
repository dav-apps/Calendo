import { Environment } from "dav-js"

export const environment = {
	environment: Environment.Development,
	apiKey: "eUzs3PQZYweXvumcWvagRHjdUroGe5Mo7kN1inHm",
	websiteUrl: "http://localhost:3000",
	appId: 3,
	todoListTableId: 7,
	todoTableId: 8,
	appointmentTableId: 9,
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
