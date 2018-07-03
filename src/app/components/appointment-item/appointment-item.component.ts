import { Component, Input, ViewChild } from '@angular/core';
import * as moment from 'moment';
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
   @ViewChild(DeleteAppointmentModalComponent)
   private deleteAppointmentModalComponent: DeleteAppointmentModalComponent;

   constructor(public dataService: DataService){}

   ConvertUnixTimestampToTime(timestamp: number): string{
      return moment.unix(timestamp).format("H:mm");
   }

   Edit(){
      
   }

   Delete(){
      this.deleteAppointmentModalComponent.Show();
   }

   Remove(){
      this.dataService.RemoveAppointment(this.appointment);
   }
}