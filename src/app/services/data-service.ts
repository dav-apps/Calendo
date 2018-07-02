import { Injectable } from "@angular/core";
import { Todo, GetAllTodos } from "../models/Todo";
import { Appointment, GetAllAppointments } from "../models/Appointment";
import { DavUser } from "dav-npm";
import * as moment from 'moment';

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
	todoDays: object[] = [];	// {date: string, timestamp: number, todos: Todo[]}
	//#endregion

	//#region AppointmentsPage
	appointmentDays: object[] = [];  // {date: string, timestamp: number, appointments: Appointment[]}
	//#endregion
	
	constructor(){
		this.user = new DavUser(async () => {
			await this.LoadAllAppointments();
			await this.LoadAllTodos();
      });
	}

	async LoadAllAppointments(){
		var appointments = await GetAllAppointments();
		appointments.forEach(appointment => {
			this.AddAppointmentToStartPage(appointment);
			this.AddAppointmentToAppointmentsPage(appointment);
		});
	}

	async LoadAllTodos(){
		var todos = await GetAllTodos();
		todos.forEach(todo => {
			this.AddTodoToStartPage(todo);
			this.AddTodoToTodosPage(todo);
		});
	}

	AddTodo(todo: Todo){
		this.AddTodoToStartPage(todo);
		this.AddTodoToTodosPage(todo);
	}

	RemoveTodo(todo: Todo){
		this.RemoveTodoFromStartPage(todo);
		this.RemoveTodoFromTodosPage(todo);
	}

	AddAppointment(appointment: Appointment){
		this.AddAppointmentToStartPage(appointment);
		this.AddAppointmentToAppointmentsPage(appointment);
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
				if(a.start > b.start){
					return -1;
				}else if(a.start < b.start){
					return 1;
				}
				return 0;
			});
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
		if(todo.time != 0){
			var date: string = moment.unix(todo.time).format('D. MMMM YYYY');
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
      var date: string = moment.unix(appointment.start).format('D. MMMM YYYY');
      var timestampOfDate = moment.unix(appointment.start).startOf('day').unix();

      // Check if the date already exists in the appointmentDays array
      var appointmentDay = this.appointmentDays.find(obj => obj["timestamp"] == timestampOfDate);

      if(appointmentDay){
         var appointmentArray = appointmentDay["appointments"];
         appointmentArray.push(appointment);

         // Sort the appointments array
         appointmentArray.sort((a: Appointment, b: Appointment) => {
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
	//#endregion
}