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
import { LocalizationService } from "src/app/services/localization-service"

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
	@Input() name: string = ""
	@Input() nameError: string = ""
	@Input() date: DateTime = DateTime.now()
	@Input() saveDate: boolean = true
	@Input() labels: string[] = []
	@Output() primaryButtonClick = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	headline: string = this.locale.createTodoHeadline
	label: string = ""

	constructor(private localizationService: LocalizationService) {}

	ngAfterViewInit() {
		document.body.appendChild(this.dialog.nativeElement)
	}

	ngOnDestroy() {
		document.body.removeChild(this.dialog.nativeElement)
	}

	show() {
		switch (this.mode) {
			case "createTodoList":
				this.name = ""
				this.headline = this.locale.createTodoListHeadline
				break
			case "editTodoList":
				this.headline = this.locale.editTodoListHeadline
				break
			default:
				this.name = ""
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

	labelTextfieldChange(event: Event) {
		this.label = (event as CustomEvent).detail.value
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
			labels: this.labels
		})
	}
}
