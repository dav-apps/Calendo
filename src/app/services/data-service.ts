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
			this.AddAppointmentForStartPage(appointment);
			this.AddAppointmentForAppointmentsPage(appointment);
		});
	}

	async LoadAllTodos(){
		var todos = await GetAllTodos();
		todos.forEach(todo => {
			this.AddTodoForStartPage(todo);
			this.AddTodoForTodosPage(todo);
		});

		console.log(this.todosOfDays[0].length)
	}

	//#region StartPage
	AddAppointmentForStartPage(appointment: Appointment){
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

	AddTodoForStartPage(todo: Todo){
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
		}else if(dayIndex == -1 && todo.time == 0){
			// Add the todo to the first array
			this.todosOfDays[0].push(todo);
		}
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
	AddTodoForTodosPage(todo: Todo){
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
	//#endregion

	//#region AppointmentsPage
	AddAppointmentForAppointmentsPage(appointment: Appointment){
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