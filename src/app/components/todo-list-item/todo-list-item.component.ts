import { Component, Input, Output, EventEmitter } from "@angular/core"
import { Router } from "@angular/router"
import { faArrowRight as faArrowRightLight } from "@fortawesome/pro-light-svg-icons"
import { TodoList } from "src/app/models/TodoList"
import { DataService } from "src/app/services/data-service"

@Component({
	selector: "calendo-todo-list-item",
	templateUrl: "./todo-list-item.component.html",
	styleUrl: "./todo-list-item.component.scss"
})
export class TodoListItemComponent {
	faArrowRightLight = faArrowRightLight
	@Input()
	todoList: TodoList = new TodoList()
	@Output()
	update = new EventEmitter()

	constructor(public dataService: DataService, private router: Router) {}

	navigateToTodoList(event: PointerEvent) {
		event.preventDefault()

		this.router.navigate(["todolist", this.todoList.uuid])
	}

	async UpdateTodoList() {
		this.dataService.AddTodoListToUpdatedTodoLists(this.todoList.uuid)
		this.update.emit()
	}
}
