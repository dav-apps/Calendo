import {
	Component,
	Input,
	Output,
	ViewChild,
	ElementRef,
	EventEmitter
} from "@angular/core"
import { DateTime } from "luxon"
import { faPlus } from "@fortawesome/pro-light-svg-icons"
import { Dialog } from "dav-ui-components"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { getNotificationPermission } from "src/app/utils"
import { TodoDialogEventData } from "src/app/types"

@Component({
	selector: "calendo-todo-dialog",
	templateUrl: "./todo-dialog.component.html",
	styleUrl: "./todo-dialog.component.scss"
})
export class TodoDialogComponent {
	locale = this.localizationService.locale.dialogs.todoDialog
	actionsLocale = this.localizationService.locale.actions
	faPlus = faPlus
	@Input() loading: boolean = false
	@Input() mode: "createTodo" | "createTodoList" | "editTodoList" =
		"createTodo"
	@Output() primaryButtonClick = new EventEmitter<TodoDialogEventData>()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	name: string = ""
	nameError: string = ""
	date: DateTime = DateTime.now()
	saveDate: boolean = true
	showActivateReminderOption: boolean = false
	activateReminder: boolean = true
	labels: string[] = []
	visible: boolean = false
	headline: string = this.locale.createTodoHeadline
	label: string = ""

	constructor(
		private dataService: DataService,
		private localizationService: LocalizationService
	) {}

	async ngOnInit() {
		await this.dataService.userPromiseHolder.AwaitResult()

		// Check if push is supported
		this.showActivateReminderOption =
			this.mode == "createTodo" &&
			"serviceWorker" in navigator &&
			"PushManager" in window &&
			this.dataService.dav.isLoggedIn &&
			getNotificationPermission() != "denied"
	}

	ngAfterViewInit() {
		document.body.appendChild(this.dialog.nativeElement)
	}

	ngOnDestroy() {
		document.body.removeChild(this.dialog.nativeElement)
	}

	reset() {
		this.name = ""
		this.nameError = ""
		this.date = DateTime.now()
		this.saveDate = true
		this.activateReminder = true
		this.labels = []
	}

	show() {
		switch (this.mode) {
			case "createTodoList":
				this.headline = this.locale.createTodoListHeadline
				break
			case "editTodoList":
				this.headline = this.locale.editTodoListHeadline
				break
			default:
				this.headline = this.locale.createTodoHeadline
				break
		}

		this.visible = true
	}

	hide() {
		this.visible = false
	}

	nameTextfieldChange(event: Event) {
		this.name = (event as CustomEvent).detail.value
		this.nameError = ""
	}

	calendarChange(event: CustomEvent) {
		this.date = event.detail.date
	}

	saveDateCheckboxChange(event: CustomEvent) {
		this.saveDate = event.detail.checked
	}

	activateReminderCheckboxChange(event: CustomEvent) {
		this.activateReminder = event.detail.checked
	}

	labelTextfieldChange(event: Event) {
		this.label = (event as CustomEvent).detail.value
	}

	getBadgeColor(i: number) {
		switch (i) {
			case 0:
				return "primary"
			case 1:
				return "secondary"
			default:
				return "tertiary"
		}
	}

	addLabel() {
		let label = this.label
		this.label = ""

		if (label.length == 0) return

		let i = this.labels.findIndex(l => l == label)
		if (i != -1) return

		this.labels.push(label)
	}

	removeLabel(label: string) {
		let i = this.labels.findIndex(l => l == label)
		if (i != -1) this.labels.splice(i, 1)
	}

	submit() {
		this.primaryButtonClick.emit({
			name: this.name,
			date: this.saveDate ? this.date : null,
			activateReminder:
				this.saveDate &&
				this.showActivateReminderOption &&
				this.activateReminder,
			labels: this.labels
		})
	}
}
