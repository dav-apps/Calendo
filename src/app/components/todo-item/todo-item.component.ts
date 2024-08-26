import { Component, Input, Output, EventEmitter } from "@angular/core"
import { trigger, state, style, animate, transition } from "@angular/animations"
import { Todo } from "src/app/models/Todo"
import { faTimes } from "@fortawesome/pro-light-svg-icons"

@Component({
	selector: "calendo-todo-item",
	templateUrl: "./todo-item.component.html",
	styleUrl: "./todo-item.component.scss",
	animations: [
		trigger("hide", [
			state(
				"hidden",
				style({
					transform: "translateY(-10px)",
					opacity: 0,
					height: 0
				})
			),
			state(
				"visible",
				style({
					transform: "",
					opacity: 1
				})
			),
			transition("visible => hidden", [animate("200ms 0s ease-in-out")])
		])
	]
})
export class TodoItemComponent {
	faTimes = faTimes
	@Input() todo: Todo = new Todo()
	@Input() showBadge: boolean = true
	@Output() change = new EventEmitter()
	@Output() delete = new EventEmitter()
	hidden: boolean = false

	async checkboxChange(event: CustomEvent) {
		await this.todo.SetCompleted(event.detail.checked)
		this.change.emit()
	}

	deleteTodo() {
		this.hidden = true
		this.todo.Delete()
		this.delete.emit()
	}
}
