// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
   production: false,
	apiKey: "eUzs3PQZYweXvumcWvagRHjdUroGe5Mo7kN1inHm",
	baseUrl: "http://localhost:3001",
	version: "0.7.2",
   appId: 5,
   todoListTableId: 11,
	todoTableId: 12,
   appointmentTableId: 13,
   todoListNameKey: "name",
   todoListTimeKey: "time",
   todoListTodosKey: "todos",
   todoListTodoListsKey: "todo_lists",
   todoListGroupsKey: "groups",
   todoListListKey: "list",
	todoCompletedKey: "completed",
	todoTimeKey: "time",
	todoNameKey: "name",
   todoGroupsKey: "groups",
   todoListKey: "list",
	appointmentNameKey: "name",
	appointmentStartKey: "start",
	appointmentEndKey: "end",
	appointmentAllDayKey: "allday",
	appointmentColorKey: "color",
	appointmentDefaultColor: "1565C0",
	notificationUuidKey: "notification_uuid",
	visitKey: "visit",
	// Settings keys
	settingsSortTodosByDateKey: "settings-sortTodosByDate",
	settingsThemeKey: "settings-theme",
	// Settings defaults
	settingsSortTodosByDateDefault: true,
	settingsThemeDefault: "system",
	// Other constants
	lightThemeKey: "light",
	darkThemeKey: "dark",
	systemThemeKey: "system"
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
