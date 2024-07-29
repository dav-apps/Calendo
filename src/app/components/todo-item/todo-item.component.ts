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

	async checkboxChange(event: CustomEvent) {
		await this.todo.SetCompleted(event.detail.checked)
	}

	Delete() {
		this.todo.Delete()
		this.delete.emit()
	}
}
