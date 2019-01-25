import { TableObject, GetTableObject, GetAllTableObjects } from 'dav-npm';
import { environment } from "../../environments/environment";

export class Appointment{
   constructor(public uuid: string, 
               public name: string, 
               public start: number, 
               public end: number, 
					public allday: boolean,
					public color: string,
					public notificationUuid: string = ""){}
	
	async Delete(){
		var tableObject = await GetTableObject(this.uuid);
		if(tableObject){
			tableObject.Delete();
		}
	}
}

export async function GetAppointment(uuid: string): Promise<Appointment>{
	var tableObject = await GetTableObject(uuid);

	if(tableObject){
		var appointment = ConvertTableObjectToAppointment(tableObject);

		if(appointment){
			return appointment;
		}
	}

	return null;
}

export async function GetAllAppointments(): Promise<Appointment[]>{
	var tableObjects = await GetAllTableObjects(environment.appointmentTableId, false);
	var appointments: Appointment[] = [];

	tableObjects.forEach((tableObject: TableObject) => {
		var appointment = ConvertTableObjectToAppointment(tableObject);

		if(appointment){
			appointments.push(appointment);
		}
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
		{ name: environment.appointmentAllDayKey, value: appointment.allday.toString() },
		{ name: environment.appointmentColorKey, value: appointment.color }
	]);

	if(appointment.notificationUuid){
		tableObject.SetPropertyValue(environment.appointmentNotificationUuidKey, appointment.notificationUuid);
	}

   return tableObject.Uuid;
}

export async function UpdateAppointment(appointment: Appointment){
	var tableObject = await GetTableObject(appointment.uuid);

	if(tableObject){
		await tableObject.SetPropertyValues([
			{ name: environment.appointmentNameKey, value: appointment.name },
			{ name: environment.appointmentStartKey, value: appointment.start.toString() },
			{ name: environment.appointmentEndKey, value: appointment.end.toString() },
			{ name: environment.appointmentAllDayKey, value: appointment.allday.toString() },
			{ name: environment.appointmentColorKey, value: appointment.color }
		]);
		
		if(tableObject.GetPropertyValue(environment.appointmentNotificationUuidKey) || appointment.notificationUuid){
			await tableObject.SetPropertyValue(environment.appointmentNotificationUuidKey, appointment.notificationUuid);
		}
	}
}

export function ConvertTableObjectToAppointment(tableObject: TableObject): Appointment{
	if(tableObject.TableId != environment.appointmentTableId) return null;

	var appointmentAllDay: boolean = (tableObject.GetPropertyValue(environment.appointmentAllDayKey) === "true" || 
									tableObject.GetPropertyValue(environment.appointmentAllDayKey) === "True");
	
	var appointmentStart: number = 0;
	var tableObjectAppointmentStart = tableObject.GetPropertyValue(environment.appointmentStartKey);
	if(tableObjectAppointmentStart){
		appointmentStart = Number.parseInt(tableObjectAppointmentStart);
	}

	var appointmentEnd: number = 0;
	var tableObjectAppointmentEnd = tableObject.GetPropertyValue(environment.appointmentEndKey);
	if(tableObjectAppointmentEnd){
		appointmentEnd = Number.parseInt(tableObjectAppointmentEnd);
	}

	var color: string = environment.appointmentDefaultColor;
	var tableObjectAppointmentColor = tableObject.GetPropertyValue(environment.appointmentColorKey);
	if(tableObjectAppointmentColor){
		color = tableObjectAppointmentColor;
	}

	var notificationUuid = "";
	var tableObjectNotificationUuid = tableObject.GetPropertyValue(environment.appointmentNotificationUuidKey);
	if(tableObjectNotificationUuid){
		notificationUuid = tableObjectNotificationUuid;
	}

	return new Appointment(tableObject.Uuid, 
									tableObject.GetPropertyValue(environment.appointmentNameKey),
									appointmentStart,
									appointmentEnd,
									appointmentAllDay,
									color,
									notificationUuid);
}