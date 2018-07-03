import { Component, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Appointment } from '../../models/Appointment';

@Component({
   selector: "calendo-delete-appointment-modal",
   templateUrl: "./delete-appointment-modal.component.html"
})
export class DeleteAppointmentModalComponent{
   @Input() appointment: Appointment;
   @Output() remove = new EventEmitter();
   @ViewChild('deleteAppointmentModal') appointmentModal: ElementRef;

   constructor(private modalService: NgbModal){}

   Show(){
      this.modalService.open(this.appointmentModal).result.then(async () => {
         // Delete the appointment
         await this.appointment.Delete();
         this.remove.emit(null);
      }, () => {});
   }
}