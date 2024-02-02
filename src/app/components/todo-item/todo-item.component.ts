import { Component, Input, Output, EventEmitter } from "@angular/core"
import { Todo } from "../../models/Todo"
import { faTimes } from "@fortawesome/free-solid-svg-icons"

@Component({
	selector: "calendo-todo-item",
	templateUrl: "./todo-item.component.html"
})
export class TodoItemComponent {
	faTimes = faTimes
	@Input() todo: Todo = new Todo()
	@Input() showBadge: boolean = true
	@Output() delete = new EventEmitter()

	ToggleCheckbox() {
		this.todo.SetCompleted(!this.todo.completed)
	}

	Delete() {
		this.todo.Delete()
		this.delete.emit()
	}
}
