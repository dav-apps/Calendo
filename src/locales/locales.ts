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
		noAppointments: "You have no appointments"
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
			nameTextfieldLabel: "Name"
		},
		deleteAppointmentDialog: {
			headline: "Delete appointment",
			description: "Are you sure you want to delete this appointment?"
		},
		todoDialog: {
			createTodoHeadline: "Create todo",
			createTodoListHeadline: "Create todo list",
			editTodoListHeadline: "Edit todo list",
			nameTextfieldLabel: "Name"
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
		nameMissing: "Please enter a name"
	},
	misc: {
		overview: "Overview",
		calendar: "Calendar",
		todos: "Todos",
		appointments: "Appointments"
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
		noAppointments: "Du hast keine Termine"
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
			nameTextfieldLabel: "Name"
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
			nameTextfieldLabel: "Name"
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
		nameMissing: "Bitte gib einen Namen ein"
	},
	misc: {
		overview: "Übersicht",
		calendar: "Kalender",
		todos: "Todos",
		appointments: "Termine"
	}
}

export var deDE = deDefaults

export var deAT = deDefaults

export var deCH = deDefaults
//#endregion
