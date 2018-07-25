import { Injectable } from "@angular/core";
import { Todo, GetAllTodos } from "../models/Todo";
import { Appointment, GetAllAppointments } from "../models/Appointment";
import { DavUser } from "dav-npm";
import * as moment from 'moment';
import * as localforage from "localforage";
import { environment } from "../../environments/environment.prod";
import * as bowser from "bowser";

@Injectable()
export class DataService{

	user: DavUser;

	//#region StartPage
	todosOfDays: Array<Todo[]> = [[], [], [], [], [], [], []];
	appointmentsOfDays: Array<Appointment[]> = [[], [], [], [], [], [], []];
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
	selectedDay: moment.Moment = moment();
	selectedDayAppointments: Appointment[] = [];
	selectedDayTodos: Todo[] = [];
	calendarDaysAppointments = [
		[new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>()],
		[new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>()],
		[new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>()],
		[new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>()],
		[new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>()],
		[new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>()],
		[new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>()],
		[new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>()],
		[new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>()],
		[new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>()],
		[new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>(), new Array<Appointment>()]
	];
	calendarDaysTodos = [
		[new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>()],
		[new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>()],
		[new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>()],
		[new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>()],
		[new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>()],
		[new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>()],
		[new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>()],
		[new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>()],
		[new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>()],
		[new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>()],
		[new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>(), new Array<Todo>()]
	];

	mobileCalendarDaysDates: number[] = [];
	mobileCalendarDaysAppointments: Appointment[][] = [];
	mobileCalendarDaysTodos: Todo[][] = [];
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
		this.appointmentsOfDays = [[], [], [], [], [], [], []];
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
		this.todosOfDays = [[], [], [], [], [], [], []];
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

	//#region StartPage
	AddAppointmentToStartPage(appointment: Appointment){
		var dayIndex = this.GetDayIndexByTimestamp(appointment.start);
		if(dayIndex == -1) return;

		var index = this.appointmentsOfDays[dayIndex].findIndex(a => a.uuid == appointment.uuid);

		if(index !== -1){
			// Replace the appointment
			this.appointmentsOfDays[dayIndex][index] = appointment;
		}else{
			// Add the appointment
			this.appointmentsOfDays[dayIndex].push(appointment);
		}

		this.appointmentsOfDays.forEach(appointments => {
			appointments.sort((a: Appointment, b: Appointment) => {
				if(a.allday) return 1;
				if(b.allday) return -1;

				if(a.start < b.start){
					return -1;
				}else if(a.start > b.start){
					return 1;
				}
				return 0;
			});
		});
	}

	RemoveAppointmentFromStartPage(appointment: Appointment){
		// Remove the appointment from all arrays
		this.appointmentsOfDays.forEach((appointmentArray: Appointment[]) => {
			let index = appointmentArray.findIndex(a => a.uuid == appointment.uuid);

			if(index !== -1){
				appointmentArray.splice(index, 1);
			}
		});
	}

	AddTodoToStartPage(todo: Todo){
		var dayIndex = this.GetDayIndexByTimestamp(todo.time);

		if(dayIndex != -1){
			var index = this.todosOfDays[dayIndex].findIndex(t => t.uuid == todo.uuid);

			if(index !== -1){
				// Replace the todo
				this.todosOfDays[dayIndex][index] = todo;
			}else{
				// Add the todo
				this.todosOfDays[dayIndex].push(todo);
			}
		}else if(dayIndex == -1){
			// Add the todo to the first array
			this.todosOfDays[0].push(todo);
		}
	}

	RemoveTodoFromStartPage(todo: Todo){
		// Remove the todo from all arrays
		this.todosOfDays.forEach((todoArray: Todo[]) => {
			let index = todoArray.findIndex(t => t.uuid === todo.uuid);

			if(index !== -1){
				todoArray.splice(index, 1);
			}
		});
	}

	GetDayIndexByTimestamp(timestamp: number): number{
		var index = -1;
		for (var i of [0,1,2,3,4,5,6]) {
			if(moment.unix(timestamp).isSame(this.GetDateOfDay(i), 'day')){
				index = i;
				break;
			}
		}
		return index;
	}

	GetWeekDay(index: number): string{
      moment.locale('en');
      return this.GetDateOfDay(index).format('dddd');
   }

   GetDate(index: number): string{
      moment.locale('en');
      return this.GetDateOfDay(index).format('D. MMMM YYYY');
   }

   GetDateOfDay(index: number){
      return moment().add(index, 'days');
	}

	GetUncompletedTodosOfDay(index: number): Todo[]{
		return this.todosOfDays[index].filter((todo: Todo) => {
			return !todo.completed;
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
         appointmentArray.sort((a: Appointment, b: Appointment) => {
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

		// Sort the appointments
		appointments.sort((a: Appointment, b: Appointment) => {
			if(a.allday) return 1;
			if(b.allday) return -1;

			if(a.start < b.start){
				return -1;
			}else if(a.start > b.start){
				return 1;
			}
			return 0;
		});

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