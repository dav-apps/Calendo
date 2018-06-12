import { Observable } from "rxjs";
import { TableObject, GetAllTableObjects, SaveTableObject } from 'dav-npm';
import { environment } from "../../environments/environment";
import { TableObjectUploadStatus } from "../../../../dav-npm/dist/lib/models/TableObject";

export class Appointment{
   constructor(public uuid: string, 
               public name: string, 
               public start: number, 
               public end: number, 
               public allday: boolean){}
}

export function GetAllAppointments(): Observable<Appointment>{
   return new Observable<Appointment>((observer: any) => {
		GetAllTableObjects()
         .forEach((tableObject: TableObject) => {
            if(tableObject.TableId != environment.appointmentTableId){
               return;
            }

            var appointmentAllDay: boolean = (tableObject.Properties[environment.appointmentAllDayKey] === "true" || 
                                    tableObject.Properties[environment.appointmentAllDayKey] === "True");
            
            var appointmentStart: number = 0;
            var tableObjectAppointmentStart = tableObject.Properties[environment.appointmentStartKey];
            if(tableObjectAppointmentStart){
               appointmentStart = Number.parseInt(tableObjectAppointmentStart);
            }

            var appointmentEnd: number = 0;
            var tableObjectAppointmentEnd = tableObject.Properties[environment.appointmentNameKey];
            if(tableObjectAppointmentEnd){
               appointmentEnd = Number.parseInt(tableObjectAppointmentEnd);
            }

            var appointment = new Appointment(tableObject.Uuid, 
                                             tableObject.Properties[environment.appointmentNameKey],
                                             appointmentStart,
                                             appointmentEnd,
                                             appointmentAllDay);

            observer.next(appointment);
            return;
         });
   });
}

export function CreateAppointment(appointment: Appointment): string{
   var tableObject = new TableObject();
   tableObject.TableId = environment.appointmentTableId;
   tableObject.Properties.add(environment.appointmentNameKey, appointment.name);
   tableObject.Properties.add(environment.appointmentStartKey, appointment.start.toString());
   tableObject.Properties.add(environment.appointmentEndKey, appointment.end.toString());
   tableObject.Properties.add(environment.appointmentAllDayKey, appointment.allday.toString());

   SaveTableObject(tableObject);
   return tableObject.Uuid;
}