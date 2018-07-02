import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;
import { Appointment, CreateAppointment } from '../../models/Appointment';

@Component({
   selector: "calendo-new-appointment-modal",
   templateUrl: "./new-appointment-modal.component.html"
})
export class NewAppointmentModalComponent{
   @Output() save = new EventEmitter();
   @ViewChild('createAppointmentModal') appointmentModal: ElementRef;
   newAppointmentDate: NgbDateStruct;
   newAppointmentName: string;
   newAppointmentAllDayCheckboxChecked: boolean;
   newAppointmentStartTime;
   newAppointmentEndTime;

   constructor(private modalService: NgbModal){}

   Show(){
      this.ResetNewObjects();

      this.modalService.open(this.appointmentModal).result.then(async () => {
         // Save the new appointment
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

         this.save.emit(appointment);
      }, () => {});

      $('#new-appointment-all-day-checkbox').iCheck({
         checkboxClass: 'icheckbox_square-blue',
         radioClass: 'iradio_square'
      });

      $('#new-appointment-all-day-checkbox').iCheck('check');
      $('#new-appointment-all-day-checkbox').on('ifChecked', (event) => this.newAppointmentAllDayCheckboxChecked = true);
      $('#new-appointment-all-day-checkbox').on('ifUnchecked', (event) => this.newAppointmentAllDayCheckboxChecked = false);
   }

   ResetNewObjects(){
      this.newAppointmentDate = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};
      this.newAppointmentName = "";
      this.newAppointmentAllDayCheckboxChecked = true;
      this.newAppointmentStartTime = { hour: 15, minute: 0 };
      this.newAppointmentEndTime = { hour: 16, minute: 0 };
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