import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core'
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap'
import { IDropdownOption } from 'office-ui-fabric-react'
import * as moment from 'moment'
import {
	Notification,
	GetNotification,
	SetupWebPushSubscription
} from 'dav-npm'
import { Appointment, GetAppointment } from 'src/app/models/Appointment'
import { DataService } from 'src/app/services/data-service'
import { enUS } from 'src/locales/locales'

@Component({
	selector: "calendo-appointment-modal",
	templateUrl: "./appointment-modal.component.html",
	styleUrls: [
		"./appointment-modal.component.scss"
	]
})
export class AppointmentModalComponent {
	locale = enUS.appointmentModal
	notificationLocale = enUS.notifications.appointment
	@Output() save = new EventEmitter()
	@ViewChild('appointmentModal', { static: true }) appointmentModal: ElementRef
	appointmentDate: NgbDateStruct
	appointmentName: string
	appointmentAllDayCheckboxChecked: boolean
	appointmentStartTime: { hour: number, minute: number }
	appointmentEndTime: { hour: number, minute: number }
	new: boolean = true
	appointmentUuid: string
	availableColors: string[] = ["D32F2F", "D67724", "FFD600", "388E3C", "43A047", "00B0FF", "1565C0", "283593", "7B1FA2", "757575", "000000"]
	selectedColor: number = 6
	reminderCheckboxChecked: boolean = true
	notificationTime: number = 3600				// Saves the time of the notification in seconds before the start of the appointment
	showReminderOption: boolean = true
	reminderOptions: IDropdownOption[] = []
	modalVisible: boolean = false
	submitButtonDisabled: boolean = true

	constructor(
		private modalService: NgbModal,
		private dataService: DataService
	) {
		this.locale = this.dataService.GetLocale().appointmentModal
		this.notificationLocale = this.dataService.GetLocale().notifications.appointment
	}

	Show(appointment?: Appointment, date?: number) {
		if (this.modalVisible) return
		this.modalVisible = true

		// Check if push is supported
		this.showReminderOption = (
			('serviceWorker' in navigator)
			&& ('PushManager' in window)
			&& this.dataService.dav.isLoggedIn
			&& this.dataService.GetNotificationPermission() != "denied"
		)

		// Init reminderTimes
		this.reminderOptions = []
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

		if (appointment) {
			// Update appointment
			// Add the values of the appointment to the local variables
			this.new = false
			this.appointmentUuid = appointment.uuid

			var startDate = new Date(appointment.start * 1000)
			var endDate = new Date(appointment.end * 1000)

			if (appointment.notificationUuid) {
				// Get the date of the notification
				GetNotification(appointment.notificationUuid).then((notification: Notification) => {
					if (notification == null) return
					this.reminderCheckboxChecked = true

					// Calculate the seconds the notification is sent before the appointment starts
					let difference = (appointment.allday ? moment.unix(appointment.start).startOf('day').unix() : appointment.start) - notification.Time
					this.SetReminderSelection(difference)
				})
			} else {
				this.reminderCheckboxChecked = false
			}

			this.appointmentDate = { year: startDate.getFullYear(), month: startDate.getMonth() + 1, day: startDate.getDate() }
			this.appointmentName = appointment.name
			this.appointmentAllDayCheckboxChecked = appointment.allday
			this.appointmentStartTime = { hour: startDate.getHours(), minute: startDate.getMinutes() }
			this.appointmentEndTime = { hour: endDate.getHours(), minute: endDate.getMinutes() }
			if (appointment.color) {
				let colorIndex = this.availableColors.findIndex(c => c == appointment.color)
				if (colorIndex !== -1) {
					this.selectedColor = colorIndex
				}
			}
		} else {
			// New appointment
			this.ResetNewObjects(date)
		}

		this.modalService.open(this.appointmentModal).result.then(async () => {
			if (this.submitButtonDisabled) return

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
			var startUnix = Math.floor(start.getTime() / 1000)

			var end = new Date(
				this.appointmentDate.year,
				this.appointmentDate.month - 1,
				this.appointmentDate.day,
				this.appointmentEndTime.hour,
				this.appointmentEndTime.minute,
				0,
				0
			)
			var endUnix = Math.floor(end.getTime() / 1000)

			var color = this.availableColors[this.selectedColor]

			if (this.new) {
				// Create the new appointment
				let notificationUuid = null

				if (this.reminderCheckboxChecked && this.dataService.dav.isLoggedIn) {
					// Ask the user for notification permission
					if (await SetupWebPushSubscription()) {
						// Create the notification
						// Set the time of the notification to (the start of the day - seconds before) or (appointment start - seconds before)
						let time = (this.appointmentAllDayCheckboxChecked ? moment.unix(startUnix).startOf('day').unix() : startUnix) - this.notificationTime
						let notification = new Notification({
							Time: time,
							Interval: 0,
							Title: this.appointmentName,
							Body: this.GenerateNotificationBody(startUnix, endUnix)
						})
						await notification.Save()
						notificationUuid = notification.Uuid
					}
				}

				let appointment = await Appointment.Create(this.appointmentName, startUnix, endUnix, this.appointmentAllDayCheckboxChecked, color, notificationUuid)
				this.save.emit(appointment)
			} else {
				// Update the appointment
				let appointment = await GetAppointment(this.appointmentUuid)
				let notificationUuid: string = appointment.notificationUuid

				if (this.reminderCheckboxChecked) {
					let time = (this.appointmentAllDayCheckboxChecked ? moment.unix(appointment.start).startOf('day').unix() : appointment.start) - this.notificationTime

					if (appointment.notificationUuid) {
						// Update the existing notification
						let notification = await GetNotification(appointment.notificationUuid)

						if (notification != null) {
							notification.Time = time
							notification.Interval = 0
							notification.Title = appointment.name
							notification.Body = this.GenerateNotificationBody(startUnix, endUnix)

							await notification.Save()
						}
					} else {
						// Create a notification
						if (await SetupWebPushSubscription()) {
							let notification = new Notification({
								Time: time,
								Interval: 0,
								Title: appointment.name,
								Body: this.GenerateNotificationBody(startUnix, endUnix)
							})
							await notification.Save()
							notificationUuid = notification.Uuid
						}
					}
				} else if (appointment.notificationUuid) {
					// Delete the notification
					let notification = await GetNotification(appointment.notificationUuid)

					if (notification != null) {
						await notification.Delete()
					}

					notificationUuid = null
				}

				await appointment.Update(this.appointmentName, startUnix, endUnix, this.appointmentAllDayCheckboxChecked, color, notificationUuid)
				this.save.emit(appointment)
			}

			this.modalService.dismissAll()
			this.modalVisible = false
		}, () => {
			this.modalVisible = false
		})

		this.SetSubmitButtonDisabled()
	}

	ResetNewObjects(date?: number) {
		let d = new Date();
		if (date) d = new Date(date * 1000);

		this.appointmentDate = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
		this.appointmentName = "";
		this.appointmentAllDayCheckboxChecked = false;
		this.appointmentStartTime = { hour: 15, minute: 0 };
		this.appointmentEndTime = { hour: 16, minute: 0 };
		this.reminderCheckboxChecked = true;

		// Select a random color
		this.selectedColor = Math.floor(Math.random() * this.availableColors.length);

		this.SetSubmitButtonDisabled()
	}

	SetSubmitButtonDisabled() {
		this.submitButtonDisabled = !(
			this.appointmentName.trim().length > 1
			&& (
				this.appointmentAllDayCheckboxChecked ?
					true
					: (
						this.appointmentStartTime.hour < this.appointmentEndTime.hour
						|| (
							this.appointmentStartTime.hour == this.appointmentEndTime.hour
							&& this.appointmentStartTime.minute <= this.appointmentEndTime.minute
						)
					)
			)
		)
	}

	GenerateNotificationBody(start: number, end: number): string {
		// Format the time in the message correctly
		let message = ""

		if (this.appointmentAllDayCheckboxChecked) {
			let appointmentMoment = moment.unix(start)
			message = this.notificationLocale.messageSpecificTime + ", " + appointmentMoment.format(this.notificationLocale.formats.allDay)
		} else {
			let appointmentStartMoment = moment.unix(start)
			let appointmentEndMoment = moment.unix(end)

			message = (
				appointmentStartMoment.format(this.notificationLocale.formats.specificTime)
				+ " - "
				+ appointmentEndMoment.format(this.notificationLocale.formats.specificTime)
			)
		}

		return message
	}

	SetReminderSelection(secondsBefore: number) {
		this.notificationTime = secondsBefore;
	}

	ReminderDropdownChanged(event: { ev: MouseEvent, index: number, option: IDropdownOption }) {
		this.SetReminderSelection(event.option.key as number);
	}

	ToggleAllDayCheckbox() {
		if (!this.appointmentAllDayCheckboxChecked) {
			this.appointmentAllDayCheckboxChecked = true

			// Set the notification time to 12 hours
			this.SetReminderSelection(43200);
		} else {
			this.appointmentAllDayCheckboxChecked = false

			// Set the notification time to 1 hour
			this.SetReminderSelection(3600);
		}

		this.SetSubmitButtonDisabled()
	}

	ToggleReminderCheckbox() {
		this.reminderCheckboxChecked = !this.reminderCheckboxChecked;
	}

	TimepickerValueChanged() {
		this.SetSubmitButtonDisabled()
	}
}