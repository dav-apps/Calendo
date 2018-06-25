import { Observable } from "rxjs";
import { TableObject, GetTableObject, GetAllTableObjects } from 'dav-npm';
import { environment } from "../../environments/environment";

export class Appointment{
   constructor(public uuid: string, 
               public name: string, 
               public start: number, 
               public end: number, 
					public allday: boolean){}
	

	async Delete(){
		var tableObject = await GetTableObject(this.uuid);
		if(tableObject){
			tableObject.Delete();
		}
	}
}

export async function GetAllAppointments(): Promise<Appointment[]>{
	var tableObjects = await GetAllTableObjects(environment.appointmentTableId, false);
	var appointments: Appointment[] = [];

	tableObjects.forEach((tableObject: TableObject) => {
		if(tableObject.TableId != environment.appointmentTableId){
			return;
		}

		var appointmentAllDay: boolean = (tableObject.Properties.get(environment.appointmentAllDayKey) === "true" || 
										tableObject.Properties.get(environment.appointmentAllDayKey) === "True");
		
		var appointmentStart: number = 0;
		var tableObjectAppointmentStart = tableObject.Properties.get(environment.appointmentStartKey);
		if(tableObjectAppointmentStart){
			appointmentStart = Number.parseInt(tableObjectAppointmentStart);
		}

		var appointmentEnd: number = 0;
		var tableObjectAppointmentEnd = tableObject.Properties.get(environment.appointmentNameKey);
		if(tableObjectAppointmentEnd){
			appointmentEnd = Number.parseInt(tableObjectAppointmentEnd);
		}

		var appointment = new Appointment(tableObject.Uuid, 
													tableObject.Properties.get(environment.appointmentNameKey),
													appointmentStart,
													appointmentEnd,
													appointmentAllDay);

		appointments.push(appointment);
	});

	return appointments;
}

export async function CreateAppointment(appointment: Appointment): Promise<string>{
   var tableObject = new TableObject();
	tableObject.TableId = environment.appointmentTableId;
	tableObject.SetPropertyValues([
		{ name: environment.appointmentNameKey, value: appointment.name },
		{ name: environment.appointmentStartKey, value: appointment.start.toString() },
		{ name: environment.appointmentEndKey, value: appointment.end.toString() },
		{ name: environment.appointmentAllDayKey, value: appointment.allday.toString() }
	]);

   return tableObject.Uuid;
}