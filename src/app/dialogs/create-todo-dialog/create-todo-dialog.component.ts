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
	selector: "calendo-create-todo-dialog",
	templateUrl: "./create-todo-dialog.component.html",
	styleUrl: "./create-todo-dialog.component.scss"
})
export class CreateTodoDialogComponent {
	locale = this.localizationService.locale.dialogs.createTodoDialog
	actionsLocale = this.localizationService.locale.actions
	faPlus = faPlus
	@Input() loading: boolean = false
	@Input() nameError: string = ""
	@Input() date: DateTime = DateTime.now()
	@Output() primaryButtonClick = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	name: string = ""
	saveDate: boolean = false
	label: string = ""
	labels: string[] = []

	constructor(private localizationService: LocalizationService) {}

	ngAfterViewInit() {
		document.body.appendChild(this.dialog.nativeElement)
	}

	ngOnDestroy() {
		document.body.removeChild(this.dialog.nativeElement)
	}

	show() {
		this.name = ""
		this.visible = true
	}

	hide() {
		this.visible = false
	}

	nameTextfieldChange(event: Event) {
		this.name = (event as CustomEvent).detail.value
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

	submit() {
		this.primaryButtonClick.emit({
			name: this.name
		})
	}
}
