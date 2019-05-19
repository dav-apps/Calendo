import { Component, ViewChild } from '@angular/core';
import { DataService } from '../../services/data-service';
import { AppointmentModalComponent } from '../../components/appointment-modal/appointment-modal.component';
import { Appointment } from '../../models/Appointment';
import { enUS } from '../../../locales/locales';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';

@Component({
   selector: "calendo-appointments-page",
   templateUrl: "./appointments-page.component.html",
   styleUrls: [
      "./appointments-page.component.scss"
   ]
})
export class AppointmentsPageComponent{
   locale = enUS.appointmentsPage;
   faEllipsisH = faEllipsisH;
   @ViewChild(AppointmentModalComponent)
   private newAppointmentModalComponent: AppointmentModalComponent;

   constructor(public dataService: DataService){
      this.locale = this.dataService.GetLocale().appointmentsPage;
      this.dataService.HideWindowsBackButton();
   }

   ShowNewAppointmentModal(){
      this.newAppointmentModalComponent.Show();
   }

   CreateAppointment(appointment: Appointment){
      this.dataService.AddAppointment(appointment);
   }

   ShowOrHideOldAppointments(){
      this.dataService.showOldAppointments = !this.dataService.showOldAppointments;
      this.dataService.LoadAllAppointments();
   }
}