import { Component, Input } from '@angular/core';
import { Appointment } from '../../models/Appointment';
import * as moment from 'moment';

@Component({
   selector: "calendo-appointment-item",
   templateUrl: "./appointment-item.component.html",
   styleUrls: [
      "./appointment-item.component.scss"
   ]
})
export class AppointmentItemComponent{
   @Input() appointment: Appointment = new Appointment("", "", 0, 0, false);

   constructor(){}

   ConvertUnixTimestampToTime(timestamp: number): string{
      return moment.unix(timestamp).format("H:mm");
   }
}