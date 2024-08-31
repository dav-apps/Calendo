import { Component, Input, Output, EventEmitter } from "@angular/core"
import { faPlus } from "@fortawesome/pro-light-svg-icons"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"
import { DataService } from "src/app/services/data-service"

@Component({
	selector: "calendo-todo-list-tree",
	templateUrl: "./todo-list-tree.component.html",
	styleUrl: "./todo-list-tree.component.scss"
})
export class TodoListTreeComponent {
	faPlus = faPlus
	@Input() todoList: TodoList = new TodoList()
	@Input() showRoot: boolean = false
	@Input() allowDragging: boolean = false
	@Input() expanded: boolean = true
	@Output() optionsButtonClick = new EventEmitter()
	@Output() moreButtonClick = new EventEmitter()
	@Output() removeTodo = new EventEmitter()

	constructor(public dataService: DataService) {}

	todoDragged(event: (Todo | TodoList)[]) {
		this.todoList.SetItems(event)
	}
}
