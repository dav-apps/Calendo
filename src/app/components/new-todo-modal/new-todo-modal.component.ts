import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core'
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Todo } from '../../models/Todo'
import { enUS } from '../../../locales/locales'
import { DataService } from '../../services/data-service'
import { Notification, SetupWebPushSubscription } from 'dav-npm'
import * as moment from 'moment'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

@Component({
	selector: "calendo-new-todo-modal",
	templateUrl: "./new-todo-modal.component.html"
})
export class NewTodoModalComponent {
	locale = enUS.newTodoModal
	notificationLocale = enUS.notifications.todo
	faPlus = faPlus
	@Output() save = new EventEmitter()
	@ViewChild('createTodoModal', { static: true }) todoModal: ElementRef
	newTodoDate: NgbDateStruct
	newTodoName: string
	newTodoSetDateCheckboxChecked: boolean = true
	newTodoReminderCheckboxChecked: boolean = false
	todoGroups: string[] = []
	allGroups: string[] = []
	todoReminderTime: { hour: number, minute: number }
	showReminderOption: boolean = true
	modalVisible: boolean = false
	submitButtonDisabled: boolean = false
	groupTextFieldStyle = {
		root: {
			width: 250,
		}
	}
	nameTextFieldStyle = {
		root: {
			width: 280,
		}
	}

	constructor(
		private modalService: NgbModal,
		private dataService: DataService
	) {
		this.locale = this.dataService.GetLocale().newTodoModal
		this.notificationLocale = this.dataService.GetLocale().notifications.todo
	}

	Show(date?: number) {
		if (this.modalVisible) return
		this.modalVisible = true

		this.ResetNewObjects(date)

		// Check if push is supported
		this.showReminderOption = (
			('serviceWorker' in navigator)
			&& ('PushManager' in window)
			&& this.dataService.user != null
			&& this.dataService.GetNotificationPermission() != "denied"
		)

		this.modalService.open(this.todoModal).result.then(async () => {
			if (this.submitButtonDisabled) return

			// Save new todo
			var todoTimeUnix: number = 0
			if (this.newTodoSetDateCheckboxChecked) {
				var todoTime = new Date(this.newTodoDate.year, this.newTodoDate.month - 1, this.newTodoDate.day, 0, 0, 0, 0)
				todoTimeUnix = Math.floor(todoTime.getTime() / 1000)
			}

			let notificationUuid = null

			if (this.newTodoReminderCheckboxChecked) {
				// Ask the user for notification permission
				if (await SetupWebPushSubscription()) {
					// Create the notification
					let notificationTime = moment.unix(todoTimeUnix).startOf('day').unix()
						+ this.todoReminderTime.hour * 60 * 60
						+ this.todoReminderTime.minute * 60
					
					let notification = new Notification({
						Time: notificationTime,
						Interval: 0,
						Title: this.notificationLocale.title,
						Body: this.newTodoName
					})
					await notification.Save()
					notificationUuid = notification.Uuid
				}
			}

			let todo = await Todo.Create(this.newTodoName, false, todoTimeUnix, this.todoGroups, null, notificationUuid)

			this.save.emit(todo)

			this.modalService.dismissAll()
			this.modalVisible = false
		}, () => {
			this.modalVisible = false
		})

		this.SetSubmitButtonDisabled()
	}

	ResetNewObjects(date?: number) {
		let d = new Date()
		if (date) {
			d = new Date(date * 1000)
		}

		this.newTodoDate = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
		this.newTodoName = ""
		this.newTodoSetDateCheckboxChecked = true
		this.todoGroups = []
		this.allGroups = []
		this.todoReminderTime = { hour: 10, minute: 0 }
		this.newTodoReminderCheckboxChecked = false

		this.SetSubmitButtonDisabled()
	}

	ToggleSetDateCheckbox() {
		if (this.newTodoSetDateCheckboxChecked) {
			this.newTodoSetDateCheckboxChecked = false
			this.newTodoReminderCheckboxChecked = false
		} else {
			this.newTodoSetDateCheckboxChecked = true
		}
	}

	ToggleReminderCheckbox() {
		if (this.newTodoSetDateCheckboxChecked) {
			this.newTodoReminderCheckboxChecked = !this.newTodoReminderCheckboxChecked
		}
	}

	SetSubmitButtonDisabled() {
		this.submitButtonDisabled = this.newTodoName.trim().length < 2
	}
}