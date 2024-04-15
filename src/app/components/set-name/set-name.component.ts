import { Component, Input, Output, EventEmitter } from "@angular/core"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "calendo-set-name",
	templateUrl: "./set-name.component.html"
})
export class SetNameComponent {
	locale = this.localizationService.locale.setName
	@Input()
	type: number = 0 // Todo: 0, TodoList: 1, Appointment: 2
	@Input()
	name: string = ""
	@Input()
	width: number = 280
	@Output()
	nameChanged = new EventEmitter<string>()
	@Output()
	submit = new EventEmitter()
	textFieldPlaceholder: string = this.locale.todoName
	nameTextFieldStyle = {
		root: {
			width: this.width
		}
	}

	constructor(
		public dataService: DataService,
		private localizationService: LocalizationService
	) {}

	ngOnInit() {
		// Update the width of the text field
		this.nameTextFieldStyle.root.width = this.width

		// Set the placeholder text
		switch (this.type) {
			case 0: // Todo
				this.textFieldPlaceholder = this.locale.todoName
				break
			case 1: // TodoList
				this.textFieldPlaceholder = this.locale.todoListName
				break
			case 2: // Appointment
				this.textFieldPlaceholder = this.locale.appointmentName
				break
		}
	}

	onChange(event: { ev: any; newValue: string }) {
		this.nameChanged.emit(event.newValue)
	}

	Submit() {
		this.submit.emit()
	}
}
