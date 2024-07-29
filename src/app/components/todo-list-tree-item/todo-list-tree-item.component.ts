import { Component, Input, Output, EventEmitter } from "@angular/core"
import { trigger, state, style, animate, transition } from "@angular/animations"
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
	styleUrl: "./todo-list-tree-item.component.scss",
	animations: [
		trigger("expandCollapse", [
			state(
				"collapsed",
				style({
					transform: "translateY(-10px)",
					opacity: 0,
					height: 0,
					marginBottom: 0
				})
			),
			state(
				"expanded",
				style({
					transform: "",
					opacity: 1
				})
			),
			transition("expanded => collapsed", [animate("200ms 0s ease-in-out")]),
			transition("collapsed => expanded", [animate("200ms 0s ease-in-out")])
		])
	]
})
export class TodoListTreeItemComponent {
	faPlus = faPlus
	faEllipsis = faEllipsis
	faChevronRight = faChevronRight
	@Input() item: Todo | TodoList
	@Input() level: number = 0
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
