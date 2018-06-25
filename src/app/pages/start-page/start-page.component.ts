import { Component } from '@angular/core';
declare var $: any;
import fontawesome from '@fortawesome/fontawesome';
import solid from '@fortawesome/fontawesome-free-solid';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Todo, CreateTodo } from '../../models/Todo';
import { Appointment, CreateAppointment } from '../../models/Appointment';
import { DataService } from '../../services/data-service';

@Component({
   selector: "calendo-start-page",
   templateUrl: "./start-page.component.html",
   styleUrls: [
      "./start-page.component.scss"
   ]
})
export class StartPageComponent{
   newAppointmentDate: NgbDateStruct = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};
   newAppointmentName: string = "";
   newAppointmentAllDayCheckboxChecked: boolean = true;
   newAppointmentStartTime = { hour: 15, minute: 0 };
   newAppointmentEndTime = { hour: 16, minute: 0 };
   newTodoDate: NgbDateStruct;
	newTodoName: string = "";

	constructor(private modalService: NgbModal,
					public dataService: DataService){
		fontawesome.library.add(solid);
   }

   ngOnInit(){}

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
      this.modalService.open(content, { centered: true }).result.then(async (result) => {
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
				appointment.uuid = await CreateAppointment(appointment);
				this.dataService.AddAppointmentForStartPage(appointment);
         }else if(result == 1){
            // Create the new todo
            var todoTimeUnix: number = 0;
            if(this.newTodoDate){
               var todoTime = new Date(this.newTodoDate.year, this.newTodoDate.month - 1, this.newTodoDate.day, 0, 0, 0, 0);
               todoTimeUnix = Math.floor(todoTime.getTime() / 1000);
            }

            var todo = new Todo("", false, todoTimeUnix, this.newTodoName);
				todo.uuid = CreateTodo(todo);
				this.dataService.AddTodoForStartPage(todo);
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
	
	public async DeleteTodo(todo: Todo){
		await todo.Delete();

		// Remove the todo from all arrays
		this.dataService.todosOfDays.forEach((todoArray: Todo[]) => {
			let index = todoArray.findIndex(t => t.uuid === todo.uuid);

			if(index !== -1){
				todoArray.splice(index, 1);
			}
		});
	}
}