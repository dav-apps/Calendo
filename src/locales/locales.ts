//#region en
const enDefaults = {
	overviewPage: {
		appointments: "Appointments",
		todos: "Todos",
		createTodo: "Create todo",
		createTodoList: "Create todo list",
		noAppointments: "No appointments for today",
		noTodos: "No todos for today"
	},
	calendarPage: {
		todo: "Todo",
		todos: "Todos"
	},
	calendarDayPage: {
		appointments: "Appointments",
		todos: "Todos",
		createTodo: "Create todo",
		createTodoList: "Create todo list",
		noAppointments: "No appointments on this day",
		noTodos: "No todos on this day"
	},
	appointmentsPage: {
		title: "Appointments",
		oldAppointments: "Past appointments",
		noAppointments: "You have no appointments",
		noAppointmentsForDay: "No appointments for this day"
	},
	todosPage: {
		title: "Todos",
		noTodos: "You have no todos",
		createTodo: "Create todo",
		createTodoList: "Create todo list"
	},
	todoListPage: {
		addTodo: "Add Todo",
		addTodoList: "Add Todo list"
	},
	userPage: {
		title: "Your Account",
		headline: "Save your calendar and access it from anywhere",
		benefit1: "Access the same calendar on all your devices",
		benefit2: "Make sure your todos and appointments don't get lost",
		benefit3: "Enable notifications for appointments and todos",
		login: "Log in",
		logout: "Log out",
		signup: "Sign up",
		storageUsed: "{0} GB of {1} GB used",
		planFree: "Free",
		planPlus: "Plus",
		planPro: "Pro"
	},
	settingsPage: {
		title: "Settings",
		theme: "App theme",
		lightTheme: "Light",
		darkTheme: "Dark",
		systemTheme: "System default",
		news: "News and updates",
		sendFeedback: "Send feedback",
		github: "Calendo on GitHub",
		privacy: "Privacy Policy",
		updateSearch: "Searching for updates...",
		installingUpdate: "Installing the update...",
		updateError: "Error while installing the update",
		noUpdateAvailable: "The app is up-to-date",
		activateUpdate: "Activate update"
	},
	notifications: {
		appointment: {
			messageSpecificTime: "Full day event",
			formats: {
				allDay: "LL",
				specificTime: "LT"
			}
		},
		todo: {
			title: "Don't forget..."
		}
	},
	dialogs: {
		appointmentDialog: {
			createHeadline: "Create appointment",
			editHeadline: "Edit appointment",
			nameTextfieldLabel: "Name",
			allDayCheckboxLabel: "All day",
			reminderCheckboxLabel: "Activate reminder",
			reminderOptions: {
				minutes0: {
					key: 0,
					value: "0 minutes before"
				},
				minutes15: {
					key: 900,
					value: "15 minutes before"
				},
				minutes30: {
					key: 1800,
					value: "30 minutes before"
				},
				hour1: {
					key: 3600,
					value: "1 hour before"
				},
				hours2: {
					key: 7200,
					value: "2 hours before"
				},
				hours3: {
					key: 10800,
					value: "3 hours before"
				},
				hours6: {
					key: 21600,
					value: "6 hours before"
				},
				hours12: {
					key: 43200,
					value: "12 hours before"
				},
				day1: {
					key: 86400,
					value: "1 day before"
				},
				day2: {
					key: 172800,
					value: "2 days before"
				},
				day3: {
					key: 259200,
					value: "3 days before"
				},
				day4: {
					key: 345600,
					value: "4 days before"
				},
				day5: {
					key: 432000,
					value: "5 days before"
				},
				day6: {
					key: 518400,
					value: "6 days before"
				},
				week1: {
					key: 604800,
					value: "1 week before"
				}
			}
		},
		deleteAppointmentDialog: {
			headline: "Delete appointment",
			description: "Are you sure you want to delete this appointment?"
		},
		todoDialog: {
			createTodoHeadline: "Create todo",
			createTodoListHeadline: "Create todo list",
			editTodoListHeadline: "Edit todo list",
			nameTextfieldLabel: "Name",
			saveDateCheckboxLabel: "Save date",
			reminderCheckboxLabel: "Activate reminder",
			labelTextfieldLabel: "Add label"
		},
		todoListSubItemDialog: {
			addTodoHeadline: "Add todo",
			addTodoListHeadline: "Add todo list",
			editTodoListHeadline: "Edit todo list",
			nameTextfieldLabel: "Name"
		},
		deleteTodoListDialog: {
			headline: "Delete todo list",
			description:
				"Are you sure? All associated todos and todo lists will be removed."
		},
		logoutDialog: {
			headline: "Log out",
			description: "Are you sure you want to log out?"
		}
	},
	actions: {
		add: "Add",
		create: "Create",
		edit: "Edit",
		save: "Save",
		cancel: "Cancel",
		delete: "Delete",
		logout: "Log out"
	},
	errors: {
		nameMissing: "Please enter a name",
		nameTooLong: "The name is too long"
	},
	misc: {
		overview: "Overview",
		calendar: "Calendar",
		todos: "Todos",
		appointments: "Appointments",
		fullDayEvent: "Full day event",
		todoNotificationTitle: "Don't forget...",
		createAppointmentToastText: "Appointment was created successfully",
		createTodoToastText: "Todo was created successfully"
	}
}

export var enUS = enDefaults

export var enGB = enDefaults

export var enNZ = enDefaults

export var enIL = enDefaults

export var enIE = enDefaults

export var enCA = enDefaults

export var enAU = enDefaults
//#endregion

//#region de
const deDefaults = {
	overviewPage: {
		appointments: "Termine",
		todos: "Todos",
		createTodo: "Todo erstellen",
		createTodoList: "Todo-Liste erstellen",
		noAppointments: "Keine Termine für heute",
		noTodos: "Keine Todos für heute"
	},
	calendarPage: {
		todo: "Todo",
		todos: "Todos"
	},
	calendarDayPage: {
		appointments: "Termine",
		todos: "Todos",
		createTodo: "Todo erstellen",
		createTodoList: "Todo-Liste erstellen",
		noAppointments: "Keine Termine für diesen Tag",
		noTodos: "Keine Todos für diesen Tag"
	},
	appointmentsPage: {
		title: "Termine",
		oldAppointments: "Vergangene Termine",
		noAppointments: "Du hast keine Termine",
		noAppointmentsForDay: "Keine Termine für diesen Tag"
	},
	todosPage: {
		title: "Todos",
		noTodos: "Du hast keine Todos",
		createTodo: "Todo erstellen",
		createTodoList: "Todo-Liste erstellen"
	},
	todoListPage: {
		addTodo: "Todo hinzufügen",
		addTodoList: "Todo-Liste hinzufügen"
	},
	userPage: {
		title: "Dein Account",
		headline: "Sichere deinen Kalender und greife von überall darauf zu",
		benefit1: "Nutze den gleichen Kalender auf all deinen Geräten",
		benefit2:
			"Stelle sicher, dass deine Termine und Todos nicht verloren gehen",
		benefit3: "Schalte Benachrichtigungen für Termine und Todos frei",
		login: "Anmelden",
		logout: "Abmelden",
		signup: "Registrieren",
		storageUsed: "{0} GB von {1} GB verwendet",
		planFree: "Free",
		planPlus: "Plus",
		planPro: "Pro"
	},
	settingsPage: {
		title: "Einstellungen",
		theme: "App-Design",
		lightTheme: "Hell",
		darkTheme: "Dunkel",
		systemTheme: "System-Standard",
		news: "Neuigkeiten und Updates",
		sendFeedback: "Feedback senden",
		github: "Calendo auf GitHub",
		privacy: "Datenschutzerklärung",
		updateSearch: "Suche nach Updates...",
		installingUpdate: "Update wird installiert...",
		updateError: "Fehler beim Installieren des Updates",
		noUpdateAvailable: "Die App ist aktuell",
		activateUpdate: "Update aktivieren"
	},
	notifications: {
		appointment: {
			messageSpecificTime: "Ganztägiger Termin",
			formats: {
				allDay: "LL",
				specificTime: "LT"
			}
		},
		todo: {
			title: "Nicht vergessen..."
		}
	},
	dialogs: {
		appointmentDialog: {
			createHeadline: "Termin erstellen",
			editHeadline: "Termin bearbeiten",
			nameTextfieldLabel: "Name",
			allDayCheckboxLabel: "Ganztägig",
			reminderCheckboxLabel: "Erinnerung aktivieren",
			reminderOptions: {
				minutes0: {
					key: 0,
					value: "0 Minuten vorher"
				},
				minutes15: {
					key: 900,
					value: "15 Minuten vorher"
				},
				minutes30: {
					key: 1800,
					value: "30 Minuten vorher"
				},
				hour1: {
					key: 3600,
					value: "1 Stunde vorher"
				},
				hours2: {
					key: 7200,
					value: "2 Stunden vorher"
				},
				hours3: {
					key: 10800,
					value: "3 Stunden vorher"
				},
				hours6: {
					key: 21600,
					value: "6 Stunden vorher"
				},
				hours12: {
					key: 43200,
					value: "12 Stunden vorher"
				},
				day1: {
					key: 86400,
					value: "1 Tag vorher"
				},
				day2: {
					key: 172800,
					value: "2 Tage vorher"
				},
				day3: {
					key: 259200,
					value: "3 Tage vorher"
				},
				day4: {
					key: 345600,
					value: "4 Tage vorher"
				},
				day5: {
					key: 432000,
					value: "5 Tage vorher"
				},
				day6: {
					key: 518400,
					value: "6 Tage vorher"
				},
				week1: {
					key: 604800,
					value: "1 Woche vorher"
				}
			}
		},
		deleteAppointmentDialog: {
			headline: "Termin löschen",
			description:
				"Bist du dir sicher, dass du diesen Termin löschen möchtest?"
		},
		todoDialog: {
			createTodoHeadline: "Todo erstellen",
			createTodoListHeadline: "Todo-Liste erstellen",
			editTodoListHeadline: "Todo-Liste bearbeiten",
			nameTextfieldLabel: "Name",
			saveDateCheckboxLabel: "Datum speichern",
			reminderCheckboxLabel: "Erinnerung aktivieren",
			labelTextfieldLabel: "Label hinzufügen"
		},
		todoListSubItemDialog: {
			addTodoHeadline: "Todo hinzufügen",
			addTodoListHeadline: "Todo-Liste hinzufügen",
			editTodoListHeadline: "Todo-Liste bearbeiten",
			nameTextfieldLabel: "Name"
		},
		deleteTodoListDialog: {
			headline: "Todo-Liste löschen",
			description:
				"Bist du sicher? Alle dazugehörigen Todos und Todo-Listen werden entfernt."
		},
		logoutDialog: {
			headline: "Abmelden",
			description: "Bist du dir sicher, dass du dich abmelden möchtest?"
		}
	},
	actions: {
		add: "Hinzufügen",
		create: "Erstellen",
		edit: "Bearbeiten",
		save: "Speichern",
		cancel: "Abbrechen",
		delete: "Löschen",
		logout: "Abmelden"
	},
	errors: {
		nameMissing: "Bitte gib einen Namen ein",
		nameTooLong: "Der Name ist zu lang"
	},
	misc: {
		overview: "Übersicht",
		calendar: "Kalender",
		todos: "Todos",
		appointments: "Termine",
		fullDayEvent: "Ganztägiger Termin",
		todoNotificationTitle: "Nicht vergessen...",
		createAppointmentToastText: "Termin wurde erfolgreich erstellt",
		createTodoToastText: "Todo wurde erfolgreich erstellt"
	}
}

export var deDE = deDefaults

export var deAT = deDefaults

export var deCH = deDefaults
//#endregion
