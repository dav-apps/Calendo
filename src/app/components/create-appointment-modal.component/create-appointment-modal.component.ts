import { Component } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
   selector: "calendo-create-component-modal",
   templateUrl: "./create-appointment-modal.component.html",
   styleUrls: [
      "./create-appointment-modal.component.scss"
   ]
})
export class CreateAppointmentModalComponent{

   constructor(private modalService: NgbModal){}
}