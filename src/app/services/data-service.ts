import { Injectable } from "@angular/core";
import { Todo, GetAllTodos } from "../models/Todo";
import { Appointment, GetAllAppointments } from "../models/Appointment";
import { DavUser } from "dav-npm";
import * as moment from 'moment';
import * as localforage from "localforage";
import { environment } from "../../environments/environment.prod";
import * as locales from "../../locales/locales";
import * as bowser from "bowser";

@Injectable()
export class DataService{

	user: DavUser;
	locale: string = navigator.language;

	//#region StartPage
	startDaysDates: number[] = [];
	startDaysAppointments: Appointment[][] = [];
	startDaysTodos: Todo[][] = [];
	//#endregion

	//#region TodosPage
	todoDaysWithoutDate = {
		date: "",
		timestamp: 0,
		todos: []
	}
	todoDays: {date: string, timestamp: number, todos: Todo[]}[] = [];

	todosWithoutGroup: Todo[] = [];
	todoGroups: {name: string, todos: Todo[]}[] = [];
	//#endregion

	//#region AppointmentsPage
	appointmentDays: {date: string, timestamp: number, appointments: Appointment[]}[] = [];
	//#endregion

	//#region CalendarPage
	private updatingCalendarDays: boolean = false;
	private updateCalendarDaysAgain: boolean = false;
	allAppointments: Appointment[] = [];
	allTodos: Todo[] = [];

	mobileCalendarDaysDates: number[] = [];
	mobileCalendarDaysAppointments: Appointment[][] = [];
	mobileCalendarDaysTodos: Todo[][] = [];

	desktopCalendarDaysDates: number[][] = [];
	desktopCalendarDaysAppointments: Appointment[][][] = [];
	desktopCalendarDaysTodos: Todo[][][] = [];

	selectedDay: moment.Moment = moment();
	selectedDayAppointments: Appointment[] = [];
	selectedDayTodos: Todo[] = [];
	//#endregion

	//#region All pages
	showOldAppointments: boolean = false;
	sortTodosByDate: boolean = true;
	//#endregion
	
	constructor(){
		this.GetShowOldAppointments().then(value => {
			this.showOldAppointments = value;
		});
		
		this.GetSortTodosByDate().then(value => {
			this.sortTodosByDate = value;
		});

		this.user = new DavUser(async () => {
			this.startDaysDates = [];
			this.startDaysAppointments = [];
			this.startDaysTodos = [];

			await this.LoadAllAppointments();
			await this.LoadAllTodos();
      });
	}

	private InitLocalforage(){
		if(bowser.firefox){
			// Use localstorage as driver
			localforage.setDriver(localforage.LOCALSTORAGE);
		}
	}

	async LoadAllAppointments(){
		this.appointmentDays = [];
		this.allAppointments = [];
		this.ClearCalendarDaysAppointments();
		this.selectedDayAppointments = [];

		var appointments = await GetAllAppointments();
		for(let appointment of appointments){
			this.AddAppointmentToStartPage(appointment);
			this.AddAppointmentToAppointmentsPage(appointment);
			this.AddAppointmentToCalendarPage(appointment);
		}
	}

	async LoadAllTodos(){
		this.todoDaysWithoutDate.todos = [];
		this.todoDays = [];
		this.todosWithoutGroup = [];
		this.todoGroups = [];
		this.allTodos = [];
		this.ClearCalendarDaysTodos();
		this.selectedDayTodos = [];

		var todos = await GetAllTodos();
		for(let todo of todos){
			this.AddTodoToStartPage(todo);
			this.AddTodoToTodosPage(todo);
			this.AddTodoToCalendarPage(todo);
		}
	}

	ClearCalendarDaysAppointments(){
		for(let appointments of this.mobileCalendarDaysAppointments){
			appointments = [];
		}

		this.ClearCalendarDaysDates();
	}

	ClearCalendarDaysTodos(){
		for(let todos of this.mobileCalendarDaysTodos){
			todos = [];
		}

		this.ClearCalendarDaysDates();
	}

	ClearCalendarDaysDates(){
		for(let date of this.mobileCalendarDaysDates){
			date = 0;
		}
	}

	AddTodo(todo: Todo){
		this.AddTodoToStartPage(todo);
		this.AddTodoToTodosPage(todo);
		this.AddTodoToCalendarPage(todo);
	}

	UpdateTodo(todo: Todo){
		this.RemoveTodo(todo);
		this.AddTodo(todo);
	}

	RemoveTodo(todo: Todo){
		this.RemoveTodoFromStartPage(todo);
		this.RemoveTodoFromTodosPage(todo);
		this.RemoveTodoFromCalendarPage(todo);
	}

	AddAppointment(appointment: Appointment){
		this.AddAppointmentToStartPage(appointment);
		this.AddAppointmentToAppointmentsPage(appointment);
		this.AddAppointmentToCalendarPage(appointment);
	}

	UpdateAppointment(appointment: Appointment){
		this.RemoveAppointment(appointment);
		this.AddAppointment(appointment);
	}

	RemoveAppointment(appointment: Appointment){
		this.RemoveAppointmentFromStartPage(appointment);
		this.RemoveAppointmentFromAppointmentsPage(appointment);
		this.RemoveAppointmentFromCalendarPage(appointment);
	}

	SortAppointmentsArray(appointments: Appointment[]){
		appointments.sort((a: Appointment, b: Appointment) => {
			if(a.allday) return 1;
			if(b.allday) return -1;

			if(a.start < b.start){
				return -1;
			}else if(a.start > b.start){
				return 1;
			}else{
				return 0;
			}
		});
	}

	SortTodosArray(todos: Todo[]){
		todos.sort((a: Todo, b: Todo) => {
			if(a.time < b.time){
				return -1;
			}else if(a.time > b.time){
				return 1;
			}else{
				return 0;
			}
		});
	}

	GetLocale(){
		let l = this.locale.toLowerCase();

		if(l.includes("en")){			// en
			if(l == "en-gb") 				return locales.enGB;
			else if(l == "en-nz")		return locales.enNZ;
			else if(l == "en-il")		return locales.enIL;
			else if(l == "en-ie")		return locales.enIE;
			else if(l == "en-ca")		return locales.enCA;
			else if(l == "en-au")		return locales.enAU;
			else 								return locales.enUS;
		}if(l.includes("de")){			// de
			if(l == "de-at") 				return locales.deAT;
			else if(l == "de-ch") 		return locales.deCH;
			else 								return locales.deDE;
		}

		return locales.enUS;
	}

	//#region StartPage
	AddAppointmentToStartPage(appointment: Appointment){
		if(appointment.start < moment().startOf('day').unix()) return;

		// Check if the day of the appointment is already in the array
		let index = this.startDaysDates.findIndex(d => moment.unix(d).isSame(moment.unix(appointment.start), 'day'));

		if(index !== -1){
			// Check if the appointment is already in the appointments array of the day
			let i = this.startDaysAppointments[index].findIndex(a => a.uuid == appointment.uuid);

			if(i !== -1){
				// Replace the appointment
				this.startDaysAppointments[index][i] = appointment;
			}else{
				// Add the appointment
				this.startDaysAppointments[index].push(appointment);
			}

			this.SortAppointmentsArray(this.startDaysAppointments[index]);
		}else{
			// Create a new day
			this.startDaysDates.push(moment.unix(appointment.start).startOf('day').unix());
			this.startDaysAppointments.push([appointment]);
			this.startDaysTodos.push([]);

			// Sort the arrays
			for(let j = 0; j < this.startDaysDates.length; j++){
				for(let i = 1; i < this.startDaysDates.length; i++){
					if(this.startDaysDates[i - 1] > this.startDaysDates[i]){
						// Swap the dates
						let firstDate = this.startDaysDates[i - 1];
						let secondDate = this.startDaysDates[i];
						this.startDaysDates[i - 1] = secondDate;
						this.startDaysDates[i] = firstDate;

						let firstAppointments = this.startDaysAppointments[i - 1];
						let secondAppointments = this.startDaysAppointments[i];
						this.startDaysAppointments[i - 1] = secondAppointments;
						this.startDaysAppointments[i] = firstAppointments;

						let firstTodos = this.startDaysTodos[i - 1];
						let secondTodos = this.startDaysTodos[i];
						this.startDaysTodos[i - 1] = secondTodos;
						this.startDaysTodos[i] = firstTodos;
					}
				}
			}
		}
	}

	RemoveAppointmentFromStartPage(appointment: Appointment){
		// Remove the appointment from all arrays
		this.startDaysAppointments.forEach((appointmentsArray: Appointment[]) => {
			let index = appointmentsArray.findIndex(a => a.uuid == appointment.uuid);

			if(index !== -1){
				appointmentsArray.splice(index, 1);
			}
		});
	}

	AddTodoToStartPage(todo: Todo){
		if(todo.time < moment().startOf('day').unix()) return;

		// Check if the day of the todo is already in the array
		let index = this.startDaysDates.findIndex(t => moment.unix(t).isSame(moment.unix(todo.time), 'day'));

		if(index !== -1){
			// Check if the todo is already in the todos array of the day
			let i = this.startDaysTodos[index].findIndex(t => t.uuid == todo.uuid);

			if(i !== -1){
				// Replace the todo
				this.startDaysTodos[index][i] = todo;
			}else{
				// Add the todo
				this.startDaysTodos[index].push(todo);
			}

			this.SortTodosArray(this.startDaysTodos[index]);
		}else{
			// Create a new day
			this.startDaysDates.push(moment.unix(todo.time).startOf('day').unix());
			this.startDaysAppointments.push([]);
			this.startDaysTodos.push([todo]);

			// Sort the arrays
			for(let j = 0; j < this.startDaysDates.length; j++){
				for(let i = 1; i < this.startDaysDates.length; i++){
					if(this.startDaysDates[i - 1] > this.startDaysDates[i]){
						// Swap the dates
						let firstDate = this.startDaysDates[i - 1];
						let secondDate = this.startDaysDates[i];
						this.startDaysDates[i - 1] = secondDate;
						this.startDaysDates[i] = firstDate;

						let firstAppointments = this.startDaysAppointments[i - 1];
						let secondAppointments = this.startDaysAppointments[i];
						this.startDaysAppointments[i - 1] = secondAppointments;
						this.startDaysAppointments[i] = firstAppointments;

						let firstTodos = this.startDaysTodos[i - 1];
						let secondTodos = this.startDaysTodos[i];
						this.startDaysTodos[i - 1] = secondTodos;
						this.startDaysTodos[i] = firstTodos;
					}
				}
			}
		}
	}

	RemoveTodoFromStartPage(todo: Todo){
		// Remove the todo from all arrays
		this.startDaysTodos.forEach((todosArray: Todo[]) => {
			let index = todosArray.findIndex(t => t.uuid == todo.uuid);

			if(index !== -1){
				todosArray.splice(index, 1);
			}
		});
	}
	//#endregion

	//#region TodosPage
	AddTodoToTodosPage(todo: Todo){
		if(this.sortTodosByDate){
			if(todo.time != 0){
				var date: string = moment.unix(todo.time).format('dddd, D. MMMM YYYY');
				var timestampOfDate = moment.unix(todo.time).startOf('day').unix();
	
				// Check if the date already exists in the todoDays array
				var todoDay = this.todoDays.find(obj => obj["timestamp"] == timestampOfDate);
	
				if(todoDay){
					// Add the todo to the array of the todoDay
					var todosArray: Todo[] = todoDay["todos"];
					todosArray.push(todo);
				}else{
					// Add a new day to the array
					var newTodoDay = {
						date: date,
						timestamp: timestampOfDate,
						todos: [todo]
					}
	
					this.todoDays.push(newTodoDay);
				}
			}else{
				this.todoDaysWithoutDate.todos.push(todo);
			}
	
			// Sort the todoDays array
			this.todoDays.sort((a: object, b: object) => {
				var timestampString = "timestamp";
				if(a[timestampString] < b[timestampString]){
					return -1;
				}else if(a[timestampString] > b[timestampString]){
					return 1;
				}else{
					return 0;
				}
			});
		}else{
			// Sort by group
			if(todo.groups.length == 0){
				this.todosWithoutGroup.push(todo);
			}else{
				todo.groups.forEach(groupName => {
					// Check if the todoGroup already exists
					var index = this.todoGroups.findIndex(todoGroup => todoGroup.name == groupName);
	
					if(index !== -1){
						// Add the todo to the todoGroup
						var todoGroup = this.todoGroups[index];
						todoGroup.todos.push(todo);
					}else{
						// Create the todoGroup
						var todoGroup = {
							name: groupName,
							todos: new Array<Todo>()
						};
	
						todoGroup.todos.push(todo);
	
						this.todoGroups.push(todoGroup);
					}
				});
			}
		}
	}

	RemoveTodoFromTodosPage(todo: Todo){
		// Find the todo in one of the arrays
		var index = this.todoDaysWithoutDate.todos.findIndex(t => t.uuid == todo.uuid);

		if(index !== -1){
			this.todoDaysWithoutDate.todos.splice(index, 1);
		}else{
			this.todoDays.forEach(todoDay => {
				index = todoDay["todos"].findIndex(t => t.uuid == todo.uuid);

				if(index !== -1){
					todoDay["todos"].splice(index, 1);
				}
			});
		}
	}
	//#endregion

	//#region AppointmentsPage
	AddAppointmentToAppointmentsPage(appointment: Appointment){
      var date: string = moment.unix(appointment.start).format('dddd, D. MMMM YYYY');
		var timestampOfDate = moment.unix(appointment.start).startOf('day').unix();

		// Check if the appointment is old
		var appointmentStartTimestamp = moment.unix(appointment.start).endOf('day').unix();
		if(!appointment.allday){
			appointmentStartTimestamp = appointment.end;
		}
		if(appointmentStartTimestamp < moment.now() / 1000 && !this.showOldAppointments){
			return;
		}

      // Check if the date already exists in the appointmentDays array
      var appointmentDay = this.appointmentDays.find(obj => obj["timestamp"] == timestampOfDate);

      if(appointmentDay){
         var appointmentArray = appointmentDay["appointments"];
         appointmentArray.push(appointment);

         // Sort the appointments array
         this.SortAppointmentsArray(appointmentArray);
      }else{
         // Create a new appointmentDay
         var newAppointmentDay = {
            date: date,
            timestamp: timestampOfDate,
            appointments: [appointment]
         }

         this.appointmentDays.push(newAppointmentDay);

         // Sort the appointmentDays array
         this.appointmentDays.sort((a: object, b: object) => {
            const timestampString = "timestamp";
            if(a[timestampString] < b[timestampString]){
               return -1;
            }else if(a[timestampString] > b[timestampString]){
               return 1;
            }else{
               return 0;
            }
         });
      }
	}
	
	RemoveAppointmentFromAppointmentsPage(appointment: Appointment){
		var i = 0;

		this.appointmentDays.forEach(appointmentDay => {
			let index = appointmentDay["appointments"].findIndex(a => a.uuid == appointment.uuid);

			if(index !== -1){
				appointmentDay["appointments"].splice(index, 1);
			}

			if(appointmentDay["appointments"].length == 0){
				// Remove the appointmentDay
				this.appointmentDays.splice(i, 1);
			}

			i++;
		});
	}
	//#endregion

	//#region CalendarPage
	UpdateCalendarDays(){
		if(this.updatingCalendarDays){
			this.updateCalendarDaysAgain = true;
			return;
		}

		this.updatingCalendarDays = true;

		// Go through each mobileCalendarDay
		for(let i = 0; i < this.mobileCalendarDaysDates.length; i++){
			let date = moment.unix(this.mobileCalendarDaysDates[i]).startOf('day');
			this.mobileCalendarDaysAppointments[i] = this.GetAppointmentsOfDay(date);
			this.mobileCalendarDaysTodos[i] = this.GetTodosOfDay(date, false);
		}

		// Go through each desktopCalendarDay
		for(let i = 0; i < this.desktopCalendarDaysDates.length; i++){
			for(let j = 0; j < this.desktopCalendarDaysDates[i].length; j++){
				let date = moment.unix(this.desktopCalendarDaysDates[i][j]).startOf('day');
				this.desktopCalendarDaysAppointments[i][j] = this.GetAppointmentsOfDay(date);
				this.desktopCalendarDaysTodos[i][j] = this.GetTodosOfDay(date, false);
			}
		}

		this.updatingCalendarDays = false;

		if(this.updateCalendarDaysAgain){
			this.updateCalendarDaysAgain = false;
			this.UpdateCalendarDays();
		}
	}

	AddAppointmentToCalendarPage(appointment: Appointment){
		this.allAppointments.push(appointment);
		this.SortAppointmentsArray(this.allAppointments);

		if(moment.unix(appointment.start).startOf('day').unix() == this.selectedDay.startOf('day').unix()){
			this.selectedDayAppointments.push(appointment);
			this.SortAppointmentsArray(this.selectedDayAppointments);
		}

		this.UpdateCalendarDays();
	}

	GetAppointmentsOfDay(day: moment.Moment){
		var appointments: Appointment[] = [];

		for(let appointment of this.allAppointments){
			if(moment.unix(appointment.start).startOf('day').unix() === day.startOf('day').unix()){
				appointments.push(appointment);
			}
		}

		this.SortAppointmentsArray(appointments);

		return appointments;
	}

	RemoveAppointmentFromCalendarPage(appointment: Appointment){
		let index = this.allAppointments.findIndex(a => a.uuid == appointment.uuid);
		if(index !== -1){
			this.allAppointments.splice(index, 1);
		}

		index = this.selectedDayAppointments.findIndex(a => a.uuid == appointment.uuid);
		if(index !== -1){
			this.selectedDayAppointments.splice(index, 1);
		}

		this.UpdateCalendarDays();
	}

	AddTodoToCalendarPage(todo: Todo){
		this.allTodos.push(todo);
		this.SortTodosArray(this.allTodos);

		if(moment.unix(todo.time).startOf('day').unix() == this.selectedDay.startOf('day').unix()){
			this.selectedDayTodos.push(todo);
			this.SortTodosArray(this.selectedDayTodos);
		}

		this.UpdateCalendarDays();
	}

	GetTodosOfDay(day: moment.Moment, completed: boolean){
		var todos: Todo[] = [];

		this.allTodos.forEach((todo) => {
			if(moment.unix(todo.time).startOf('day').unix() === day.startOf('day').unix() && (completed || !todo.completed)){
				todos.push(todo);
			}
		});

		return todos;
	}

	RemoveTodoFromCalendarPage(todo: Todo){
		let index = this.allTodos.findIndex(t => t.uuid == todo.uuid);
		if(index !== -1){
			this.allTodos.splice(index, 1);
		}

		index = this.selectedDayTodos.findIndex(t => t.uuid == todo.uuid);
		if(index !== -1){
			this.selectedDayTodos.splice(index, 1);
		}

		this.UpdateCalendarDays();
	}
	//#endregion

	//#region SettingsPage
	SetSortTodosByDate(value: boolean){
		this.InitLocalforage();
		localforage.setItem(environment.settingsSortTodosByDateKey, value);
	}

	async GetSortTodosByDate(): Promise<boolean>{
		this.InitLocalforage();
		var value = await localforage.getItem(environment.settingsSortTodosByDateKey) as boolean;
		return value == null || value;
	}

	SetShowOldAppointments(value: boolean){
		this.InitLocalforage();
		localforage.setItem(environment.settingsShowOldAppointments, value);
	}

	async GetShowOldAppointments(){
		this.InitLocalforage();
		var value = await localforage.getItem(environment.settingsShowOldAppointments) as boolean;
		return value != null && value;
	}
	//#endregion
}