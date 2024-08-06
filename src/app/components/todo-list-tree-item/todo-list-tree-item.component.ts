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
					marginBottom: 0,
					visibility: "hidden"
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
		]),
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
export class TodoListTreeItemComponent {
	faPlus = faPlus
	faEllipsis = faEllipsis
	faChevronRight = faChevronRight
	@Input() item: Todo | TodoList
	@Input() level: number = 0
	@Output() completedChange = new EventEmitter()
	@Output() moreButtonClick = new EventEmitter()
	@Output() removeTodo = new EventEmitter()
	subItems: (Todo | TodoList)[] = []
	hidden: boolean = false
	expanded: boolean = false
	completed: boolean = false

	ngOnInit() {
		if (this.item instanceof TodoList) {
			this.subItems = this.item.items
		}

		this.checkCompleted()
	}

	checkCompleted() {
		let completedBefore = this.completed

		if (this.item instanceof TodoList) {
			this.completed = this.subItems.length > 0 && this.item.IsCompleted()
		} else {
			this.completed = this.item.completed
		}

		if (this.completed != completedBefore) {
			this.completedChange.emit()
		}
	}

	isItemTodoList(item: Todo | TodoList) {
		return item instanceof TodoList
	}

	hideTodoItem() {
		this.hidden = true

		setTimeout(() => {
			this.removeTodo.emit(this.item.uuid)
		}, 250)
	}

	chevronButtonClick() {
		this.expanded = !this.expanded
	}

	todoDragged(event: (Todo | TodoList)[]) {
		let todoList = this.item as TodoList
		todoList.SetItems(event)
	}
}
