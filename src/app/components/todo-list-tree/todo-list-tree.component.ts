import { Component, Input, Output, EventEmitter } from "@angular/core"
import { faPlus } from "@fortawesome/pro-light-svg-icons"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"

@Component({
	selector: "calendo-todo-list-tree",
	templateUrl: "./todo-list-tree.component.html",
	styleUrl: "./todo-list-tree.component.scss"
})
export class TodoListTreeComponent {
	faPlus = faPlus
	@Input() todoList: TodoList = new TodoList()
	@Input() showRoot: boolean = false
	@Input() readonly: boolean = false
	@Output() update = new EventEmitter()
	@Output() addButtonClick = new EventEmitter()
	@Output() moreButtonClick = new EventEmitter()

	todoDragged(event: (Todo | TodoList)[]) {
		this.todoList.SetItems(event)
	}
}
