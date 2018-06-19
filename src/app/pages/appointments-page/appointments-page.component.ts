import { Component } from '@angular/core';
import * as Dav from 'dav-npm';
import { Appointment, GetAllAppointments } from '../../models/Appointment';
import * as moment from 'moment';

@Component({
   selector: "calendo-appointments-page",
   templateUrl: "./appointments-page.component.html",
   styleUrls: [
      "./appointments-page.component.scss"
   ]
})
export class AppointmentsPageComponent{
   user: Dav.DavUser;
   appointmentDays: object[] = [];  // {date: string, timestamp: number, appointments: Appointment[]}

   constructor(){}

   ngOnInit(){
		this.user = new Dav.DavUser(async () => {
			var todos = GetAllAppointments();
			todos.forEach(todo => {
				this.AddAppointment(todo);
			});
		});
   }
   
   AddAppointment(appointment: Appointment){
      var date: string = moment.unix(appointment.start).format('D. MMMM YYYY');
      var timestampOfDate = moment.unix(appointment.start).startOf('day').unix();

      // Check if the date already exists in the appointmentDays array
      var appointmentDay = this.appointmentDays.find(obj => obj["timestamp"] == timestampOfDate);

      if(appointmentDay){
         var appointmentArray = appointmentDay["appointments"];
         appointmentArray.push(appointment);

         // Sort the appointments array
         appointmentArray.sort((a: Appointment, b: Appointment) => {
            if(a.start < b.start){
               return -1;
            }else if(a.start > b.start){
               return 1;
            }else{
               return 0;
            }
         });
      }else{
         // Create a new appointmentDay
         var newAppointmentDay = {
            date: date,
            timestamp: timestampOfDate,
            appointments: [appointment]
         }

         this.appointmentDays.push(newAppointmentDay);

         // Sort the appointmentDays array
         this.appointmentDays.sort((a: object, b: object) => {
            var timestampString = "timestamp";
            if(a[timestampString] < b[timestampString]){
               return -1;
            }else if(a[timestampString] > b[timestampString]){
               return 1;
            }else{
               return 0;
            }
         });
      }
   }
}