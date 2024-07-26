import { Component, Input, Output, EventEmitter } from "@angular/core"
import {
	faPlus,
	faEllipsis,
	faChevronRight
} from "@fortawesome/pro-light-svg-icons"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"

@Component({
	selector: "calendo-todo-list-tree-item",
	templateUrl: "./todo-list-tree-item.component.html",
	styleUrl: "./todo-list-tree-item.component.scss"
})
export class TodoListTreeItemComponent {
	faPlus = faPlus
	faEllipsis = faEllipsis
	faChevronRight = faChevronRight
	@Input() item: Todo | TodoList
	@Output() addButtonClick = new EventEmitter()
	@Output() moreButtonClick = new EventEmitter()
	subItems: (Todo | TodoList)[] = []
	expanded: boolean = false

	ngOnInit() {
		if (this.isItemTodoList) {
			this.subItems = (this.item as TodoList).items
		}
	}

	isItemTodoList(item: Todo | TodoList) {
		return item instanceof TodoList
	}

	chevronButtonClick() {
		this.expanded = !this.expanded
	}
}
