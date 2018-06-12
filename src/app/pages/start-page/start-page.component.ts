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

@Component({
   selector: "calendo-start-page",
   templateUrl: "./start-page.component.html",
   styleUrls: [
      "./start-page.component.scss"
   ]
})
export class StartPageComponent{
   user: Dav.DavUser;
   todos: Array<TableObject> = [];
   appointments: Array<TableObject> = [];
   newAppointmentDate: NgbDateStruct = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};
   newAppointmentName: string = "";
   newAppointmentAllDayCheckboxChecked: boolean = true;
   newAppointmentStartTime = { hour: 15, minute: 0 };
   newAppointmentEndTime = { hour: 16, minute: 0 };

   constructor(private modalService: NgbModal){
      fontawesome.library.add(solid);
   }

   ngOnInit(){
      setTimeout(() => {
         $('.todo-checkbox').iCheck({
            checkboxClass: 'icheckbox_square-blue',
            radioClass: 'iradio_square',
            increaseArea: '10%'
         });
      }, 10);

      this.user = new Dav.DavUser(async () => {
         if(this.user.IsLoggedIn){
            // Get the table objects
            var tableObjects = await Dav.GetAllTableObjectsObservable();
            tableObjects.forEach(tableObject => {
               if(tableObject.TableId === environment.todoTableId){
                  // Add the table object to the todos list
                  this.todos.push(tableObject);
               }else if(tableObject.TableId === environment.appointmentTableId){
                  // Add the table object to the appointments list
                  this.appointments.push(tableObject);
               }
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
            var appointment = new TableObject();
            appointment.TableId = environment.appointmentTableId;
            appointment.Properties.add(environment.appointmentNameKey, this.newAppointmentName);

            if(this.newAppointmentAllDayCheckboxChecked){
               appointment.Properties.add(environment.appointmentAllDayKey, "true");
            }else{
               appointment.Properties.add(environment.appointmentStartKey, startUnix.toString());
               appointment.Properties.add(environment.appointmentEndKey, endUnix.toString());
               appointment.Properties.add(environment.appointmentAllDayKey, "false");
            }

            Dav.CreateTableObject(appointment);
         }else if(result == 1){
            // Create the new todo

         }
      }, (reason) => {
         
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