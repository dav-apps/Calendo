// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
   production: false,
	apiKey: "eUzs3PQZYweXvumcWvagRHjdUroGe5Mo7kN1inHm",
	baseUrl: "localhost:3001",
	version: "0.4",
	appId: 11,
	todoTableId: 19,
	appointmentTableId: 20,
	todoCompletedKey: "completed",
	todoTimeKey: "time",
	todoNameKey: "name",
	todoGroupsKey: "groups",
	appointmentNameKey: "name",
	appointmentStartKey: "start",
	appointmentEndKey: "end",
	appointmentAllDayKey: "allday",
	appointmentColorKey: "color",
	appointmentNotificationUuidKey: "notification_uuid",
	appointmentDefaultColor: "1565C0",
	settingsSortTodosByDateKey: "settings-sortTodosByDate",
	settingsShowOldAppointments: "settings-showOldAppointments",
	visitKey: "visit"
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
