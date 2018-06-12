import { Component } from '@angular/core';
import * as moment from 'moment';
declare var $: any;
import fontawesome from '@fortawesome/fontawesome'
import solid from '@fortawesome/fontawesome-free-solid'
import * as Dav from 'dav-npm';
import { TableObject } from 'dav-npm';
import { environment } from '../../../environments/environment';
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
   todos: Array<Todo> = [];
   appointments: Array<Appointment> = [];
   newAppointmentDate: NgbDateStruct = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};
   newAppointmentName: string = "";
   newAppointmentAllDayCheckboxChecked: boolean = true;
   newAppointmentStartTime = { hour: 15, minute: 0 };
   newAppointmentEndTime = { hour: 16, minute: 0 };
   newTodoDate: NgbDateStruct;
   newTodoName: string = "";

   constructor(private modalService: NgbModal){
      fontawesome.library.add(solid);
   }

   ngOnInit(){
      this.user = new Dav.DavUser(async () => {
         if(this.user.IsLoggedIn){
            // Get all appointments
            var appointments = GetAllAppointments();
            appointments.forEach(appointment => {
               // Check if the appointment is already in the list
               var oldAppointment = this.appointments.find(obj => obj.uuid === appointment.uuid);

               if(oldAppointment){
                  // Replace the old appointmet
                  oldAppointment = appointment;
               }else{
                  // Add the new appointment
                  this.appointments.push(appointment);
               }
            });

            // Get all todos
            var todos = GetAllTodos();
            todos.forEach(todo => {
               // Check if the todo is already on the list
               var oldTodo = this.todos.find(obj => obj.uuid === todo.uuid);

               if(oldTodo){
                  oldTodo = todo;
               }else{
                  this.todos.push(todo);
               }

               setTimeout(() => {
                  $('.todo-checkbox').iCheck({
                     checkboxClass: 'icheckbox_square-blue',
                     radioClass: 'iradio_square',
                     increaseArea: '10%'
                  });
               }, 10);
            });
         }else{
            console.log("Not logged in from Start page");
         }
      });
   }

   GetWeekDay(index: number): string{
      moment.locale('en');
      return moment().add(index, 'days').format('dddd');
   }

   GetDate(index: number): string{
      moment.locale('en');
      return moment().add(index, 'days').format('D. MMMM YYYY');
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
         }else if(result == 1){
            // Create the new todo
            var todoTimeUnix: number = 0;
            if(this.newTodoDate){
               var todoTime = new Date(this.newTodoDate.year, this.newTodoDate.month, this.newTodoDate.day, 0, 0, 0, 0);
               todoTimeUnix = Math.floor(todoTime.getTime() / 1000);
            }

            var todo = new Todo("", false, todoTimeUnix, this.newTodoName);
            todo.uuid = CreateTodo(todo);
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