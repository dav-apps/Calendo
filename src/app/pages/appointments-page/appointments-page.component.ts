import { Component, ViewChild } from '@angular/core';
import { DataService } from '../../services/data-service';
import { NewAppointmentModalComponent } from '../../components/new-appointment-modal/new-appointment-modal.component';
import { Appointment } from '../../models/Appointment';

@Component({
   selector: "calendo-appointments-page",
   templateUrl: "./appointments-page.component.html",
   styleUrls: [
      "./appointments-page.component.scss"
   ]
})
export class AppointmentsPageComponent{
   @ViewChild(NewAppointmentModalComponent)
	private newAppointmentModalComponent: NewAppointmentModalComponent;

   constructor(public dataService: DataService){}

   ngOnInit(){}

   ShowModal(){
      this.newAppointmentModalComponent.Show();
   }

   CreateAppointment(appointment: Appointment){
      this.dataService.AddAppointment(appointment);
   }
}