import { Component, Input, Output, EventEmitter } from "@angular/core"
import { Todo } from "../../models/Todo"
import { faTimes } from "@fortawesome/pro-light-svg-icons"

@Component({
	selector: "calendo-todo-item",
	templateUrl: "./todo-item.component.html",
	styleUrl: "./todo-item.component.scss"
})
export class TodoItemComponent {
	faTimes = faTimes
	@Input() todo: Todo = new Todo()
	@Input() showBadge: boolean = true
	@Output() change = new EventEmitter()
	@Output() delete = new EventEmitter()

	async checkboxChange(event: CustomEvent) {
		await this.todo.SetCompleted(event.detail.checked)
		this.change.emit()
	}

	deleteTodo() {
		this.todo.Delete()
		this.delete.emit()
	}
}
