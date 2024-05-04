//#region en
const enDefaults = {
	navbar: {
		start: "Start",
		calendar: "Calendar",
		todos: "Todos",
		appointments: "Appointments"
	},
	setTodoGroups: {
		addNewGroup: "Add a new group",
		groupName: "Group name",
		addExistingGroup: "Add existing group"
	},
	setName: {
		name: "Name",
		todoName: "Todo name",
		todoListName: "Todo list name",
		appointmentName: "Appointment name"
	},
	userMenu: {
		account: "Your Account",
		settings: "Settings"
	},
	newTodoModal: {
		header: "New Todo",
		setDate: "Set a date",
		save: "Save",
		reminder: "Reminder"
	},
	todoListModal: {
		newTodoList: "New Todo list",
		editTodoList: "Edit Todo list",
		setDate: "Set a date",
		save: "Save"
	},
	todoListTree: {
		newTodo: "Add Todo",
		newTodoList: "Add Todo list",
		add: "Add",
		todoName: "Todo name",
		todoListName: "Todo list name",
		rename: "Rename",
		delete: "Delete",
		save: "Save"
	},
	deleteTodoListModal: {
		header: "Delete Todo list",
		message:
			"Are you sure you want to delete the Todo list and all its todos and todo lists?",
		delete: "Delete",
		cancel: "Cancel"
	},
	appointmentItem: {
		edit: "Edit",
		delete: "Delete"
	},
	smallAppointmentItem: {
		edit: "Edit",
		delete: "Delete"
	},
	appointmentModal: {
		newAppointment: "New Appointment",
		editAppointment: "Edit Appointment",
		entireDay: "Entire Day",
		start: "Start",
		end: "End",
		color: "Color",
		save: "Save",
		reminder: "Reminder",
		reminderTimes: {
			minutes0: "0 minutes before",
			minutes15: "15 minutes before",
			minutes30: "30 minutes before",
			hour1: "1 hour before",
			hours3: "3 hours before",
			hours6: "6 hours before",
			hours12: "12 hours before",
			day1: "1 day before",
			week1: "1 week before"
		}
	},
	deleteAppointmentModal: {
		header: "Delete appointment",
		deleteWarning:
			"Are you sure you want to delete the following appointment?",
		delete: "Delete",
		cancel: "Cancel"
	},
	logoutModal: {
		header: "Log out",
		message: "Are you sure you want to log out?",
		logout: "Log out",
		cancel: "Cancel"
	},
	startPage: {
		appointments: "Appointments",
		todos: "Todos",
		formats: {
			smallDate: "M/D",
			largeDate: "dddd"
		}
	},
	todosPage: {
		header: "Todos",
		sortByGroup: "Sort by group",
		sortByDate: "Sort by date",
		newTodo: "Add Todo",
		newTodoList: "Add Todo list",
		noTodos: "You have no todos",
		formats: {
			date: "dddd, MMMM D, YYYY"
		}
	},
	appointmentsPage: {
		header: "Appointments",
		noAppointments: "You have no upcoming appointments",
		oldAppointments: "Old appointments"
	},
	calendarPage: {
		todo: "Todo",
		s: "s"
	},
	calendarDayPage: {
		appointments: "Appointments",
		todos: "Todos",
		newTodo: "Add Todo",
		newTodoList: "Add Todo list",
		noAppointments: "No appointments",
		noTodos: "No todos",
		formats: {
			currentDay: "dddd, MMMM D, YYYY"
		}
	},
	todoListDetailsPage: {
		date: "Date: ",
		groups: "Groups: ",
		todos: "Todos",
		newTodo: "Add Todo",
		newTodoList: "Add Todo list",
		formats: {
			date: "L"
		}
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
	snackbar: {
		todoCreated: "Todo was created",
		todoListCreated: "Todo list was created",
		appointmentCreated: "Appointment was created",
		show: "Show"
	},
	dialogs: {
		createAppointmentDialog: {
			headline: "Create appointment",
			nameTextfieldLabel: "Name"
		},
		createTodoDialog: {
			headline: "Create todo",
			nameTextfieldLabel: "Name"
		}
	},
	actions: {
		create: "Create",
		cancel: "Cancel"
	}
}

export var enUS = enDefaults

export var enGB = enDefaults
enGB.startPage.formats.smallDate = "D/M"
enGB.calendarDayPage.formats.currentDay = "dddd, D MMMM YYYY"
enGB.todosPage.formats.date = "dddd, D MMMM YYYY"
enGB.appointmentModal.color = "Colour"

export var enNZ = enDefaults
enNZ.startPage.formats.smallDate = "D/M"
enNZ.calendarDayPage.formats.currentDay = "dddd, D MMMM YYYY"
enNZ.todosPage.formats.date = "dddd, D MMMM YYYY"
enNZ.appointmentModal.color = "Colour"

export var enIL = enDefaults
enIL.startPage.formats.smallDate = "D/M"
enIL.calendarDayPage.formats.currentDay = "dddd, D MMMM YYYY"
enIL.todosPage.formats.date = "dddd, D MMMM YYYY"

export var enIE = enDefaults
enIE.startPage.formats.smallDate = "D-M"
enIE.calendarDayPage.formats.currentDay = "dddd D MMMM YYYY"
enIE.todosPage.formats.date = "dddd D MMMM YYYY"

export var enCA = enDefaults
enCA.startPage.formats.smallDate = "M-D"
enCA.todosPage.formats.date = "dddd, MMMM D, YYYY"

export var enAU = enDefaults
enAU.startPage.formats.smallDate = "D/M"
enAU.calendarDayPage.formats.currentDay = "dddd, D MMMM YYYY"
enAU.todosPage.formats.date = "dddd, D MMMM YYYY"
//#endregion

//#region de
const deDefaults = {
	navbar: {
		start: "Start",
		calendar: "Kalender",
		todos: "Todos",
		appointments: "Termine"
	},
	setTodoGroups: {
		addNewGroup: "Neue Gruppe hinzufügen",
		groupName: "Name der Gruppe",
		addExistingGroup: "Bestehende Gruppe hinzufügen"
	},
	setName: {
		name: "Name",
		todoName: "Name des Todos",
		todoListName: "Name der Todo-Liste",
		appointmentName: "Name des Termins"
	},
	userMenu: {
		account: "Dein Account",
		settings: "Einstellungen"
	},
	newTodoModal: {
		header: "Neues Todo",
		setDate: "Datum speichern",
		save: "Speichern",
		reminder: "Erinnerung"
	},
	todoListModal: {
		newTodoList: "Neue Todo-Liste",
		editTodoList: "Todo-Liste bearbeiten",
		setDate: "Datum speichern",
		save: "Speichern"
	},
	todoListTree: {
		newTodo: "Todo hinzufügen",
		newTodoList: "Todo-Liste hinzufügen",
		add: "Hinzufügen",
		todoName: "Name des Todos",
		todoListName: "Name der Todo-Liste",
		rename: "Umbenennen",
		delete: "Löschen",
		save: "Speichern"
	},
	deleteTodoListModal: {
		header: "Todo-Liste löschen",
		message:
			"Bist du dir sicher, dass du die Todo-Liste und alle dazugehörigen Todos und Todo-Listen löschen willst?",
		delete: "Löschen",
		cancel: "Abbrechen"
	},
	appointmentItem: {
		edit: "Bearbeiten",
		delete: "Löschen"
	},
	smallAppointmentItem: {
		edit: "Bearbeiten",
		delete: "Löschen"
	},
	appointmentModal: {
		newAppointment: "Neuer Termin",
		editAppointment: "Termin bearbeiten",
		entireDay: "Ganzer Tag",
		start: "Anfang",
		end: "Ende",
		color: "Farbe",
		save: "Speichern",
		reminder: "Erinnerung",
		reminderTimes: {
			minutes0: "0 Minuten vorher",
			minutes15: "15 Minuten vorher",
			minutes30: "30 Minuten vorher",
			hour1: "1 Stunde vorher",
			hours3: "3 Stunden vorher",
			hours6: "6 Stunden vorher",
			hours12: "12 Stunden vorher",
			day1: "1 Tag vorher",
			week1: "1 Woche vorher"
		}
	},
	deleteAppointmentModal: {
		header: "Termin löschen",
		deleteWarning:
			"Bist du dir sicher, dass du diesen Termin löschen willst?",
		delete: "Löschen",
		cancel: "Abbrechen"
	},
	logoutModal: {
		header: "Abmelden",
		message: "Bist du dir sicher, dass du dich abmelden möchtest?",
		logout: "Abmelden",
		cancel: "Abbrechen"
	},
	startPage: {
		appointments: "Termine",
		todos: "Todos",
		formats: {
			smallDate: "D.M",
			largeDate: "dddd"
		}
	},
	todosPage: {
		header: "Todos",
		sortByGroup: "Nach Gruppe sortieren",
		sortByDate: "Nach Datum sortieren",
		newTodo: "Todo hinzufügen",
		newTodoList: "Todo-Liste hinzufügen",
		noTodos: "Du hast keine Todos",
		formats: {
			date: "dddd, D. MMMM YYYY"
		}
	},
	appointmentsPage: {
		header: "Termine",
		noAppointments: "Du hast keine anstehenden Termine",
		oldAppointments: "Alte Termine"
	},
	calendarPage: {
		todo: "Todo",
		s: "s"
	},
	calendarDayPage: {
		appointments: "Termine",
		todos: "Todos",
		newTodo: "Todo hinzufügen",
		newTodoList: "Todo-Liste hinzufügen",
		noAppointments: "Keine Termine",
		noTodos: "Keine Todos",
		formats: {
			currentDay: "dddd, D. MMMM YYYY"
		}
	},
	todoListDetailsPage: {
		date: "Datum: ",
		groups: "Gruppen: ",
		todos: "Todos",
		newTodo: "Todo hinzufügen",
		newTodoList: "Todo-Liste hinzufügen",
		formats: {
			date: "L"
		}
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
	snackbar: {
		todoCreated: "Todo wurde erstellt",
		todoListCreated: "Todo-Liste wurde erstellt",
		appointmentCreated: "Termin wurde erstellt",
		show: "Anzeigen"
	},
	dialogs: {
		createAppointmentDialog: {
			headline: "Termin erstellen",
			nameTextfieldLabel: "Name"
		},
		createTodoDialog: {
			headline: "Todo erstellen",
			nameTextfieldLabel: "Name"
		}
	},
	actions: {
		create: "Erstellen",
		cancel: "Abbrechen"
	}
}

export var deDE = deDefaults

export var deAT = deDefaults

export var deCH = deDefaults
//#endregion
