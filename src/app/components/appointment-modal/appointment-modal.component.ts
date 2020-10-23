import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { IDropdownOption } from 'office-ui-fabric-react';
import * as moment from 'moment';
import {
	SubscribePushNotifications,
	CreateNotification,
	GetNotification,
	DeleteNotification,
	UpdateNotification
} from 'dav-npm';
import { Appointment, GetAppointment } from 'src/app/models/Appointment';
import { DataService } from 'src/app/services/data-service';
import { enUS } from 'src/locales/locales';

@Component({
   selector: "calendo-appointment-modal",
	templateUrl: "./appointment-modal.component.html",
	styleUrls: [
		"./appointment-modal.component.scss"
	]
})
export class AppointmentModalComponent{
	locale = enUS.appointmentModal;
	notificationLocale = enUS.notifications.appointment;
	@Output() save = new EventEmitter();
   @ViewChild('appointmentModal', { static: true }) appointmentModal: ElementRef;
   appointmentDate: NgbDateStruct;
   appointmentName: string;
   appointmentAllDayCheckboxChecked: boolean;
   appointmentStartTime: {hour: number, minute: number};
   appointmentEndTime: {hour: number, minute: number};
	new: boolean = true;
	appointmentUuid: string;
	availableColors: string[] = ["D32F2F", "D67724", "FFD600", "388E3C", "43A047", "00B0FF", "1565C0", "283593", "7B1FA2", "757575", "000000"];
	selectedColor: number = 6;
	reminderCheckboxChecked: boolean = true;
	notificationTime: number = 3600;				// Saves the time of the notification in seconds before the start of the appointment
	showReminderOption: boolean = true;
	reminderOptions: IDropdownOption[] = [];

	constructor(
		private modalService: NgbModal,
		private dataService: DataService
	) {
		this.locale = this.dataService.GetLocale().appointmentModal;
		this.notificationLocale = this.dataService.GetLocale().notifications.appointment;
	}

   Show(appointment?: Appointment, date?: number){
		// Check if push is supported
		this.showReminderOption = (
			('serviceWorker' in navigator)
			&& ('PushManager' in window)
			&& this.dataService.user.IsLoggedIn
			&& Notification.permission != "denied"
		)
		
		// Init reminderTimes
		this.reminderOptions = [];
		this.reminderOptions.push(
			{ key: 0, text: this.locale.reminderTimes.minutes0 },
			{ key: 900, text: this.locale.reminderTimes.minutes15 },
			{ key: 1800, text: this.locale.reminderTimes.minutes30 },
			{ key: 3600, text: this.locale.reminderTimes.hour1 },
			{ key: 10800, text: this.locale.reminderTimes.hours3 },
			{ key: 21600, text: this.locale.reminderTimes.hours6 },
			{ key: 43200, text: this.locale.reminderTimes.hours12 },
			{ key: 86400, text: this.locale.reminderTimes.day1 },
			{ key: 604800, text: this.locale.reminderTimes.week1 }
		)

      if(appointment){
			// Update appointment
			// Add the values of the appointment to the local variables
			this.new = false;
			this.appointmentUuid = appointment.uuid;

         var startDate = new Date(appointment.start * 1000);
			var endDate = new Date(appointment.end * 1000);
			
			if(appointment.notificationUuid){
				// Get the date of the notification
				GetNotification(appointment.notificationUuid).then((notification: {time: number, interval: number, properties: object}) => {
					if(notification){
						this.reminderCheckboxChecked = true;

						// Calculate the seconds the notification is sent before the appointment starts
						let difference = (appointment.allday ? moment.unix(appointment.start).startOf('day').unix() : appointment.start) - notification.time;
						this.SetReminderSelection(difference);
					}
				});
			}else{
				this.reminderCheckboxChecked = false;
			}

         this.appointmentDate = { year: startDate.getFullYear(), month: startDate.getMonth() + 1, day: startDate.getDate() };
         this.appointmentName = appointment.name;
         this.appointmentAllDayCheckboxChecked = appointment.allday;
         this.appointmentStartTime = { hour: startDate.getHours(), minute: startDate.getMinutes() };
			this.appointmentEndTime = { hour: endDate.getHours(), minute: endDate.getMinutes() };
			if(appointment.color){
				let colorIndex = this.availableColors.findIndex(c => c == appointment.color);
				if(colorIndex !== -1){
					this.selectedColor = colorIndex;
				}
			}
      }else{
         // New appointment
         this.ResetNewObjects(date);
      }

      this.modalService.open(this.appointmentModal).result.then(async () => {
			// Save the new appointment
			// Calculate the unix timestamp of start and end
			var start = new Date(
				this.appointmentDate.year,
				this.appointmentDate.month - 1,
				this.appointmentDate.day,
				this.appointmentStartTime.hour,
				this.appointmentStartTime.minute,
				0,
				0
			)
			var startUnix = Math.floor(start.getTime() / 1000);

			var end = new Date(
				this.appointmentDate.year,
				this.appointmentDate.month - 1,
				this.appointmentDate.day,
				this.appointmentEndTime.hour,
				this.appointmentEndTime.minute,
				0,
				0
			)
			var endUnix = Math.floor(end.getTime() / 1000);

			var color = this.availableColors[this.selectedColor];

			if(this.new){
				// Create the new appointment
				let notificationUuid = null;

				if(this.reminderCheckboxChecked && this.dataService.user.IsLoggedIn){
					// Ask the user for notification permission
					if(await this.dataService.GetNotificationPermission() && await SubscribePushNotifications()){
						// Create the notification
						// Set the time of the notification to (the start of the day - seconds before) or (appointment start - seconds before)
						let time = (this.appointmentAllDayCheckboxChecked ? moment.unix(startUnix).startOf('day').unix() : startUnix) - this.notificationTime;
						notificationUuid = await CreateNotification(time, 0, this.GenerateNotificationProperties(this.appointmentName, startUnix, endUnix));
					}
				}

				let appointment = await Appointment.Create(this.appointmentName, startUnix, endUnix, this.appointmentAllDayCheckboxChecked, color, notificationUuid);
				this.save.emit(appointment);
			}else{
				// Update the appointment
				let appointment = await GetAppointment(this.appointmentUuid);
				let notificationUuid: string = appointment.notificationUuid;

				if(this.reminderCheckboxChecked){
					let time = (this.appointmentAllDayCheckboxChecked ? moment.unix(appointment.start).startOf('day').unix() : appointment.start) - this.notificationTime;
					let notificationProperties = this.GenerateNotificationProperties(this.appointmentName, startUnix, endUnix);

					if(appointment.notificationUuid){
						// There already is a notification; update it
						UpdateNotification(appointment.notificationUuid, time, 0, notificationProperties);
					}else{
						// There was no notification before; create one
						if(await this.dataService.GetNotificationPermission() && await SubscribePushNotifications()){
							notificationUuid = await CreateNotification(time, 0, notificationProperties);
						}
					}
				}else if(appointment.notificationUuid){
					// Delete the notification
					DeleteNotification(appointment.notificationUuid);
					notificationUuid = null;
				}

				await appointment.Update(this.appointmentName, startUnix, endUnix, this.appointmentAllDayCheckboxChecked, color, notificationUuid);
				this.save.emit(appointment);
			}

			this.modalService.dismissAll()
      }, () => {});
   }

   ResetNewObjects(date?: number){
		let d = new Date();
		if (date) d = new Date(date * 1000);
		
      this.appointmentDate = {year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate()};
      this.appointmentName = "";
      this.appointmentAllDayCheckboxChecked = false;
      this.appointmentStartTime = { hour: 15, minute: 0 };
		this.appointmentEndTime = { hour: 16, minute: 0 };
		this.reminderCheckboxChecked = true;

		// Select a random color
		this.selectedColor = Math.floor(Math.random() * this.availableColors.length);
   }

   SetAppointmentSaveButtonDisabled(): boolean{
      // Check if the start time is after the end time
      var timeOkay = this.appointmentAllDayCheckboxChecked;

      if(!this.appointmentAllDayCheckboxChecked){
         if(this.appointmentStartTime.hour > this.appointmentEndTime.hour){
            timeOkay = false;
         }else if(this.appointmentStartTime.hour == this.appointmentEndTime.hour){
            if(this.appointmentStartTime.minute > this.appointmentEndTime.minute){
               timeOkay = false;
            }else{
               timeOkay = true;
            }
         }else{
            timeOkay = true;
         }
      }
      
		return !(this.appointmentName.length > 1 && timeOkay);
	}

	GenerateNotificationProperties(name: string, start: number, end: number) : {title: string, message: string}{
		// Format the time in the message correctly
		let title = name;
		let message = "";
		if(this.appointmentAllDayCheckboxChecked){
			let appointmentMoment = moment.unix(start);
			message = this.notificationLocale.messageSpecificTime + ", " + appointmentMoment.format(this.notificationLocale.formats.allDay);
		}else{
			let appointmentStartMoment = moment.unix(start);
			let appointmentEndMoment = moment.unix(end);

			message = (
				appointmentStartMoment.format(this.notificationLocale.formats.specificTime)
				+ " - "
				+ appointmentEndMoment.format(this.notificationLocale.formats.specificTime)
			)
		}

		return {
			title,
			message
		}
	}

	SetReminderSelection(secondsBefore: number){
		this.notificationTime = secondsBefore;
	}
	
	ReminderDropdownChanged(event: {ev: MouseEvent, index: number, option: IDropdownOption}){
		this.SetReminderSelection(event.option.key as number);
	}

	ToggleAllDayCheckbox(){
		if(!this.appointmentAllDayCheckboxChecked){
			this.appointmentAllDayCheckboxChecked = true

			// Set the notification time to 12 hours
			this.SetReminderSelection(43200);
      }else{
			this.appointmentAllDayCheckboxChecked = false

			// Set the notification time to 1 hour
			this.SetReminderSelection(3600);
      }
	}

	ToggleReminderCheckbox(){
		this.reminderCheckboxChecked = !this.reminderCheckboxChecked;
	}
}