import { Component, Input } from "@angular/core"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"

@Component({
	selector: "calendo-todo-list-tree-item",
	templateUrl: "./todo-list-tree-item.component.html",
	styleUrl: "./todo-list-tree-item.component.scss"
})
export class TodoListTreeItemComponent {
	@Input() item: Todo | TodoList
	subItems: (Todo | TodoList)[] = []

	constructor() {
		if (!this.isItemTodoList) {
			this.subItems = (this.item as TodoList).items
		}
	}

	isItemTodoList(item: Todo | TodoList) {
		return item instanceof TodoList
	}
}
