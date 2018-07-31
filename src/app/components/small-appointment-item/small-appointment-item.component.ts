import { Component, Input, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { AppointmentModalComponent } from '../../components/appointment-modal/appointment-modal.component';
import { DeleteAppointmentModalComponent } from '../../components/delete-appointment-modal/delete-appointment-modal.component';
import { Appointment } from '../../models/Appointment';
import { DataService } from '../../services/data-service';
import { environment } from '../../../environments/environment';
import { en } from '../../../locales/locales';

@Component({
   selector: "calendo-small-appointment-item",
   templateUrl: "./small-appointment-item.component.html",
   styleUrls: [
      './small-appointment-item.component.scss'
   ]
})
export class SmallAppointmentItemComponent{
   locale = en.smallAppointmentItem;
   @Input() appointment: Appointment = new Appointment("", "", 0, 0, false, environment.appointmentDefaultColor);
   @Input() enableDropdown: boolean = true;
   @Input() compact: boolean = false;
   @ViewChild(AppointmentModalComponent)
   private newAppointmentModalComponent: AppointmentModalComponent;
   @ViewChild(DeleteAppointmentModalComponent)
   private deleteAppointmentModalComponent: DeleteAppointmentModalComponent;
   defaultColor: string = environment.appointmentDefaultColor;

   constructor(private dataService: DataService){
      this.locale = this.dataService.GetLocale().smallAppointmentItem;
   }

   getTimeSpan(){
      return moment.unix(this.appointment.start).format("H:mm") + " - " + moment.unix(this.appointment.end).format("H:mm");
   }

   getStartTime(){
      return moment.unix(this.appointment.start).format("H:mm");
   }

   Edit(){
      this.newAppointmentModalComponent.Show(this.appointment);
   }

   Update(appointment: Appointment){
      this.dataService.UpdateAppointment(appointment);
   }

   Delete(){
      this.deleteAppointmentModalComponent.Show();
   }

   Remove(){
      this.dataService.RemoveAppointment(this.appointment);
   }
}