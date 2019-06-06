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
      header: "New Todo list",
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
      message: "Are you sure you want to delete the Todo list and all its todos and todo lists?",
      todo: "Todo",
      todos: "Todos",
      todoList: "Todo list",
		todoLists: "Todo lists",
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
      deleteWarning: "Are you sure you want to delete the following appointment?",
      delete: "Delete",
      cancel: "Cancel"
	},
	upgradeRequiredModal: {
      headerPlus: "dav Plus required",
      headerPro: "dav Pro required",
      messageNestedTodoLists: "Upgrade to dav Plus to create nested todo lists.",
      learnMore: "Learn more",
      close: "Close"
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
      newTodo: "Add Todo",
      newTodoList: "Add Todo list",
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
      showOldAppointments: "Show old appointments",
      hideOldAppointments: "Hide old appointments",
      newAppointment: "Add Appointment",
      noAppointments: "You have no appointments"
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
   accountPage: {
      header: "Your Account",
      text1: "Save your calendar and access it from anywhere",
      text2: "Access the same calendar on all your devices",
      text3: "Make sure your todos and appointments don't get lost when you lose or reset your device",
      text4: "Try it out for free",
      login: "Log in",
      logout: "Log out",
      signup: "Sign up",
      linkText: "Visit dav-apps.tech",
		storageUsed: "{0} GB of {1} GB used",
		planFree: "Free",
		planPlus: "Plus",
		planPro: "Pro",
		pricePlus: "3 € per month",
		upgradeTitle: "Upgrade your plan to make Calendo even better",
		plusFeature1: "Create nested todo lists",
		plusFeature2: "Support the development of new apps and features",
		upgrade: "Upgrade"
   },
   settingsPage: {
      header: "Settings",
      sortTodosBy: "Sort todos by",
      sortTodosByDate: "date",
      sortTodosByGroup: "group",
      showOldAppointments: "Show old appointments",
      theme: "Theme",
      lightTheme: "Light",
      darkTheme: "Dark",
      systemTheme: "Use system setting",
      privacy: "Privacy Policy",
      github: "Calendo on GitHub",
      android: "Calendo for Android"
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
   }
}

export var enUS = enDefaults;

export var enGB = enDefaults;
enGB.startPage.formats.smallDate = "D/M";
enGB.calendarDayPage.formats.currentDay = "dddd, D MMMM YYYY";
enGB.todosPage.formats.date = "dddd, D MMMM YYYY";
enGB.appointmentModal.color = "Colour";

export var enNZ = enDefaults;
enNZ.startPage.formats.smallDate = "D/M";
enNZ.calendarDayPage.formats.currentDay = "dddd, D MMMM YYYY";
enNZ.todosPage.formats.date = "dddd, D MMMM YYYY";
enNZ.appointmentModal.color = "Colour";

export var enIL = enDefaults;
enIL.startPage.formats.smallDate = "D/M";
enIL.calendarDayPage.formats.currentDay = "dddd, D MMMM YYYY";
enIL.todosPage.formats.date = "dddd, D MMMM YYYY";

export var enIE = enDefaults;
enIE.startPage.formats.smallDate = "D-M";
enIE.calendarDayPage.formats.currentDay = "dddd D MMMM YYYY";
enIE.todosPage.formats.date = "dddd D MMMM YYYY";

export var enCA = enDefaults;
enCA.startPage.formats.smallDate = "M-D";
enCA.todosPage.formats.date = "dddd, MMMM D, YYYY";

export var enAU = enDefaults;
enAU.startPage.formats.smallDate = "D/M";
enAU.calendarDayPage.formats.currentDay = "dddd, D MMMM YYYY";
enAU.todosPage.formats.date = "dddd, D MMMM YYYY";
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
      header: "Neue Todo-Liste",
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
      message: "Bist du dir sicher, dass du die Todo-Liste und alle dazugehörigen Todos und Todo-Listen löschen willst?",
      todo: "Todo",
      todos: "Todos",
      todoList: "Todo-Liste",
		todoLists: "Todo-Listen",
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
      deleteWarning: "Bist du dir sicher, dass du diesen Termin löschen willst?",
      delete: "Löschen",
      cancel: "Abbrechen"
	},
	upgradeRequiredModal: {
      headerPlus: "dav Plus benötigt",
      headerPro: "dav Pro benötigt",
      messageNestedTodoLists: "Wechsel auf dav Plus, um verschachtelte Todo-Listen zu erstellen.",
      learnMore: "Mehr erfahren",
      close: "Schließen"
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
      newTodo: "Todo hinzufügen",
      newTodoList: "Todo-Liste hinzufügen",
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
      showOldAppointments: "Alte Termine einblenden",
      hideOldAppointments: "Alte Termine ausblenden",
      newAppointment: "Termin hinzufügen",
      noAppointments: "Du hast keine Termine"
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
   accountPage: {
      header: "Dein Account",
      text1: "Sichere dein Kalender und greife von überall darauf zu",
      text2: "Nutze den gleichen Kalender auf all deinen Geräten",
      text3: "Stelle sicher, dass deine Termine und Todos nicht verloren gehen, wenn du dein Gerät verlierst oder zurücksetzt",
      text4: "Kostenlos ausprobieren",
      login: "Anmelden",
      logout: "Abmelden",
      signup: "Registrieren",
      linkText: "Besuche dav-apps.tech",
      storageUsed: "{0} GB von {1} GB verwendet",
      planFree: "Free",
		planPlus: "Plus",
		planPro: "Pro",
		pricePlus: "3 € pro Monat",
		upgradeTitle: "Verbessere dein Abo, um Calendo noch besser zu machen",
		plusFeature1: "Erstelle verschachtelte Todo-Listen",
		plusFeature2: "Unterstütze die Entwicklung von neuen Apps und Funktionen",
		upgrade: "Auswählen"
   },
   settingsPage: {
      header: "Einstellungen",
      sortTodosBy: "Sortiere Todos nach",
      sortTodosByDate: "Datum",
      sortTodosByGroup: "Gruppe",
      showOldAppointments: "Alte Termine anzeigen",
      theme: "Thema",
      lightTheme: "Hell",
      darkTheme: "Dunkel",
      systemTheme: "Systemeinstellung verwenden",
      privacy: "Datenschutzerklärung",
      github: "Calendo auf GitHub",
      android: "Calendo für Android"
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
   }
};

export var deDE = deDefaults;

export var deAT = deDefaults;

export var deCH = deDefaults;
//#endregion