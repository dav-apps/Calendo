import {
	Component,
	Input,
	Output,
	ViewChild,
	ElementRef,
	EventEmitter
} from "@angular/core"
import { Dialog } from "dav-ui-components"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "calendo-todo-list-sub-item-dialog",
	templateUrl: "./todo-list-sub-item-dialog.component.html",
	standalone: false
})
export class TodoListSubItemDialogComponent {
	locale = this.localizationService.locale.dialogs.todoListSubItemDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() mode: "addTodo" | "addTodoList" | "editTodoList" = "addTodo"
	@Input() loading: boolean = false
	@Output() primaryButtonClick = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	name: string = ""
	nameError: string = ""
	visible: boolean = false
	headline: string = this.locale.addTodoHeadline

	constructor(private localizationService: LocalizationService) {}

	ngAfterViewInit() {
		document.body.appendChild(this.dialog.nativeElement)
	}

	ngOnDestroy() {
		document.body.removeChild(this.dialog.nativeElement)
	}

	reset() {
		this.name = ""
		this.nameError = ""
	}

	show() {
		switch (this.mode) {
			case "addTodoList":
				this.headline = this.locale.addTodoListHeadline
				break
			case "editTodoList":
				this.headline = this.locale.editTodoListHeadline
				break
			default:
				this.headline = this.locale.addTodoHeadline
				break
		}

		this.visible = true
	}

	hide() {
		this.visible = false
	}

	nameTextfieldChange(event: Event) {
		this.name = ((event as CustomEvent).detail.value as string).trim()
		this.nameError = ""
	}

	submit() {
		this.primaryButtonClick.emit({
			name: this.name
		})
	}
}
