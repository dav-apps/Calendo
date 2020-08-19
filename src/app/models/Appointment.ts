import { TableObject, GetTableObject, GetAllTableObjects, DeleteNotification } from 'dav-npm';
import { environment } from "../../environments/environment";

export class Appointment {
	public uuid: string = null;
	public name: string = "";
	public start: number = 0;
	public end: number = 0;
	public allday: boolean = true;
	public color: string = "";
	public notificationUuid: string = null;

	constructor(
		uuid: string,
		name: string,
		start?: number,
		end?: number,
		allday?: boolean,
		color?: string,
		notificationUuid?: string
	) {
		this.uuid = uuid;
		this.name = name ? name : "";
		this.start = start ? start : 0;
		this.end = end ? end : 0;
		this.allday = allday == null ? true : allday;
		this.color = color ? color : "";
		this.notificationUuid = notificationUuid;
	}

	public static async Create(name: string, start: number = 0, end: number = 0, allday: boolean = true, color: string = "", notificationUuid: string = null): Promise<Appointment> {
		let appointment = new Appointment(null, name, start, end, allday, color, notificationUuid);
		await appointment.Save();
		return appointment;
	}

	async Update(name: string, start: number, end: number, allday: boolean, color: string, notificationUuid: string) {
		this.name = name;
		this.start = start;
		this.end = end;
		this.allday = allday;
		this.color = color;
		this.notificationUuid = notificationUuid;
		await this.Save();
	}

	async Delete() {
		var tableObject = await GetTableObject(this.uuid);
		if (tableObject) {
			if (this.notificationUuid) {
				// Delete the notification
				DeleteNotification(this.notificationUuid);
			}

			tableObject.Delete();
		}
	}

	private async Save() {
		let tableObject = await GetTableObject(this.uuid);

		if (!tableObject) {
			// Create the table object
			tableObject = new TableObject();
			tableObject.TableId = environment.appointmentTableId;
			this.uuid = tableObject.Uuid;
		}

		// Set the property values
		let properties: { name: string, value: string }[] = [
			{ name: environment.appointmentNameKey, value: this.name },
			{ name: environment.appointmentStartKey, value: this.start.toString() },
			{ name: environment.appointmentEndKey, value: this.end.toString() },
			{ name: environment.appointmentAllDayKey, value: this.allday.toString() },
			{ name: environment.appointmentColorKey, value: this.color }
		]

		if (this.notificationUuid) {
			properties.push({
				name: environment.notificationUuidKey,
				value: this.notificationUuid
			});
		}

		await tableObject.SetPropertyValues(properties);
	}
}

export async function GetAppointment(uuid: string): Promise<Appointment> {
	var tableObject = await GetTableObject(uuid);

	if (tableObject) {
		var appointment = ConvertTableObjectToAppointment(tableObject);

		if (appointment) {
			return appointment;
		}
	}

	return null;
}

export async function GetAllAppointments(): Promise<Appointment[]> {
	var tableObjects = await GetAllTableObjects(environment.appointmentTableId, false);
	var appointments: Appointment[] = [];

	tableObjects.forEach((tableObject: TableObject) => {
		var appointment = ConvertTableObjectToAppointment(tableObject);

		if (appointment) {
			appointments.push(appointment);
		}
	});

	return appointments;
}

export function ConvertTableObjectToAppointment(tableObject: TableObject): Appointment {
	if (tableObject.TableId != environment.appointmentTableId) return null

	let name = tableObject.GetPropertyValue(environment.appointmentNameKey) as string

	let allDay: boolean = false
	let allDayString = tableObject.GetPropertyValue(environment.appointmentAllDayKey) as string
	if (allDayString != null) {
		allDay = allDayString.toLowerCase() == "true"
	}

	let start: number = 0
	let startString = tableObject.GetPropertyValue(environment.appointmentStartKey) as string
	if (startString != null) {
		start = +startString
	}

	let end: number = 0
	let endString = tableObject.GetPropertyValue(environment.appointmentEndKey) as string
	if (endString != null) {
		end = +endString
	}

	let color = tableObject.GetPropertyValue(environment.appointmentColorKey) as string
	if (color == null) {
		color = environment.appointmentDefaultColor
	}

	let notificationUuid = tableObject.GetPropertyValue(environment.notificationUuidKey) as string

	return new Appointment(
		tableObject.Uuid,
		name,
		start,
		end,
		allDay,
		color,
		notificationUuid
	)
}