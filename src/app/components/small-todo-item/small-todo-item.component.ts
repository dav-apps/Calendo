import { Component, Input, Output, EventEmitter } from "@angular/core"
import { Todo } from "../../models/Todo"
import { DataService } from "../../services/data-service"
import { faTimes } from "@fortawesome/free-solid-svg-icons"

@Component({
	selector: "calendo-small-todo-item",
	templateUrl: "./small-todo-item.component.html",
	styleUrls: ["./small-todo-item.component.scss"]
})
export class SmallTodoItemComponent {
	faTimes = faTimes
	@Input() todo: Todo = new Todo()
	@Input() showBadge: boolean = true
	@Output() delete = new EventEmitter()

	constructor(public dataService: DataService) {}

	ToggleCheckbox() {
		this.todo.SetCompleted(!this.todo.completed)
	}

	Delete() {
		this.todo.Delete()
		this.delete.emit()
	}
}
