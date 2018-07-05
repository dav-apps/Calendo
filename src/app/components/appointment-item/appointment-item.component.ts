import { Component, Input, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { AppointmentModalComponent } from '../../components/appointment-modal/appointment-modal.component';
import { DeleteAppointmentModalComponent } from '../../components/delete-appointment-modal/delete-appointment-modal.component';
import { Appointment } from '../../models/Appointment';
import { DataService } from '../../services/data-service';

@Component({
   selector: "calendo-appointment-item",
   templateUrl: "./appointment-item.component.html",
   styleUrls: [
      "./appointment-item.component.scss"
   ]
})
export class AppointmentItemComponent{
   @Input() appointment: Appointment = new Appointment("", "", 0, 0, false);
   @Input() showCompleted: boolean = false;
   @ViewChild(AppointmentModalComponent)
   private newAppointmentModalComponent: AppointmentModalComponent;
   @ViewChild(DeleteAppointmentModalComponent)
   private deleteAppointmentModalComponent: DeleteAppointmentModalComponent;

   constructor(public dataService: DataService){}

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

   ConvertUnixTimestampToTime(timestamp: number): string{
      return moment.unix(timestamp).format("HH:mm");
   }

   IsCompleted(): boolean{
      if(!this.showCompleted) return false;
      
      return moment.now() / 1000 > this.appointment.end
   }
}