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
	selector: "calendo-todo-list-add-dialog",
	templateUrl: "./todo-list-add-dialog.component.html"
})
export class TodoListAddDialogComponent {
	locale = this.localizationService.locale.dialogs.todoListAddDialog
	actionsLocale = this.localizationService.locale.actions
	@Input() mode: "todo" | "todoList" = "todo"
	@Input() loading: boolean = false
	@Input() nameError: string = ""
	@Output() primaryButtonClick = new EventEmitter()
	@ViewChild("dialog") dialog: ElementRef<Dialog>
	visible: boolean = false
	name: string = ""

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

	submit() {
		this.primaryButtonClick.emit({
			name: this.name
		})
	}
}
