import { Component } from '@angular/core';
import * as moment from 'moment';
declare var $: any;
import fontawesome from '@fortawesome/fontawesome'
import solid from '@fortawesome/fontawesome-free-solid'
import * as Dav from 'dav-npm';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Todo, GetAllTodos, CreateTodo } from '../../models/Todo';
import { Appointment, GetAllAppointments, CreateAppointment } from '../../models/Appointment';

@Component({
   selector: "calendo-start-page",
   templateUrl: "./start-page.component.html",
   styleUrls: [
      "./start-page.component.scss"
   ]
})
export class StartPageComponent{
   user: Dav.DavUser;
   allTodos: Array<Todo> = [];
   allAppointments: Array<Appointment> = [];
   newAppointmentDate: NgbDateStruct = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};
   newAppointmentName: string = "";
   newAppointmentAllDayCheckboxChecked: boolean = true;
   newAppointmentStartTime = { hour: 15, minute: 0 };
   newAppointmentEndTime = { hour: 16, minute: 0 };
   newTodoDate: NgbDateStruct;
	newTodoName: string = "";
	todosOfDays: Array<Todo[]> = [[], [], [], [], [], [], []];
	appointmentsOfDays: Array<Appointment[]> = [[], [], [], [], [], [], []];

   constructor(private modalService: NgbModal){
      fontawesome.library.add(solid);
   }

   ngOnInit(){
      this.user = new Dav.DavUser(async () => {
         // Get all appointments
         var appointments = GetAllAppointments();
         appointments.forEach(appointment => {
				this.AddAppointment(appointment);
         });

         // Get all todos
         var todos = GetAllTodos();
         todos.forEach(todo => {
            this.AddTodo(todo);
         });
      });
	}

	AddAppointment(appointment: Appointment){
		var oldAppointment = this.allAppointments.find(a => a.uuid == appointment.uuid);
		var listChanged = false;

		var dayIndex = this.GetDayIndexByTimestamp(appointment.start);
		if(dayIndex != -1){
			if(oldAppointment){
				// Find the old appointment and replace it
				var index = this.appointmentsOfDays[dayIndex].indexOf(oldAppointment);

				if(index !== -1){
					this.appointmentsOfDays[dayIndex][index] = appointment;
					listChanged = true;
				}
			}else{
				this.appointmentsOfDays[dayIndex].push(appointment);
				listChanged = true;
			}
		}

		if(listChanged){
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
	}

	AddTodo(todo: Todo){
		var oldTodo = this.allTodos.find(t => t.uuid == todo.uuid);

		if(todo.time != 0){
			var dayIndex = this.GetDayIndexByTimestamp(todo.time);
			if(dayIndex != -1){
				if(oldTodo){
					// Find the old todo and replace it
					var index = this.todosOfDays[dayIndex].indexOf(oldTodo);
	
					if(index !== -1){
						this.todosOfDays[dayIndex][index] = todo;
					}
				}else{
					this.todosOfDays[dayIndex].push(todo);
				}
			}
		}else{
			if(oldTodo){
				var index = this.todosOfDays[0].indexOf(oldTodo);

				if(index !== -1){
					this.todosOfDays[0][index] = todo;
				}
			}else{
				this.todosOfDays[0].push(todo);
			}
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

   ShowOrHideAppointmentsOfDay(day: number){
      var elementId = "#appointments-day-" + day;
      if($(elementId).is(":visible")){
         $(elementId).hide();
      }else{
         $(elementId).show();
      }
   }

   ShowOrHideTodosOfDay(day: number){
      var elementId = "#todos-day-" + day;
      if($(elementId).is(":visible")){
         $(elementId).hide();
      }else{
			$(elementId).show();
		}
	}

   ResetNewObjects(){
      this.newAppointmentDate = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};
      this.newAppointmentName = "";
      this.newAppointmentAllDayCheckboxChecked = true;
      this.newAppointmentStartTime = { hour: 15, minute: 0 };
      this.newAppointmentEndTime = { hour: 16, minute: 0 };
      this.newTodoDate = null
      this.newTodoName = "";
   }

   ShowModal(content){
      this.modalService.open(content, { centered: true }).result.then((result) => {
         if(result == 0){
            // Calculate the unix timestamp of start and end
            var start = new Date(this.newAppointmentDate.year, this.newAppointmentDate.month - 1, 
                        this.newAppointmentDate.day, this.newAppointmentStartTime.hour, 
                        this.newAppointmentStartTime.minute, 0, 0);
            var startUnix = Math.floor(start.getTime() / 1000);

            var end = new Date(this.newAppointmentDate.year, this.newAppointmentDate.month - 1,
                                 this.newAppointmentDate.day, this.newAppointmentEndTime.hour, 
                              this.newAppointmentEndTime.minute, 0, 0);
            var endUnix = Math.floor(end.getTime() / 1000);

            // Create the new appointment
            var appointment = new Appointment("", this.newAppointmentName, startUnix, endUnix, this.newAppointmentAllDayCheckboxChecked);
				appointment.uuid = CreateAppointment(appointment);
				this.AddAppointment(appointment);
         }else if(result == 1){
            // Create the new todo
            var todoTimeUnix: number = 0;
            if(this.newTodoDate){
               var todoTime = new Date(this.newTodoDate.year, this.newTodoDate.month - 1, this.newTodoDate.day, 0, 0, 0, 0);
               todoTimeUnix = Math.floor(todoTime.getTime() / 1000);
            }

            var todo = new Todo("", false, todoTimeUnix, this.newTodoName);
				todo.uuid = CreateTodo(todo);
				this.AddTodo(todo);
         }

         this.ResetNewObjects();
      }, (reason) => {
         // Reset the values of the new todo and new appointment
         this.ResetNewObjects();
      });

      $('#newAppointmentAllDayCheckbox').iCheck({
         checkboxClass: 'icheckbox_square-blue',
         radioClass: 'iradio_square'
      });

      $('#newAppointmentAllDayCheckbox').iCheck('check');
      $('#newAppointmentAllDayCheckbox').on('ifChecked', (event) => this.newAppointmentAllDayCheckboxChecked = true);
      $('#newAppointmentAllDayCheckbox').on('ifUnchecked', (event) => this.newAppointmentAllDayCheckboxChecked = false);
   }

   SetNewAppointmentSaveButtonDisabled(): boolean{
      // Check if the start time is after the end time
      var timeOkay = this.newAppointmentAllDayCheckboxChecked;

      if(!this.newAppointmentAllDayCheckboxChecked){
         if(this.newAppointmentStartTime.hour > this.newAppointmentEndTime.hour){
            timeOkay = false;
         }else if(this.newAppointmentStartTime.hour == this.newAppointmentEndTime.hour){
            if(this.newAppointmentStartTime.minute > this.newAppointmentEndTime.minute){
               timeOkay = false;
            }else{
               timeOkay = true;
            }
         }else{
            timeOkay = true;
         }
      }
      
      return !(this.newAppointmentName.length > 1 && timeOkay);
   }
}