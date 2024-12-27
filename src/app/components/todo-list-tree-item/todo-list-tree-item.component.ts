import {
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild,
	ElementRef
} from "@angular/core"
import {
	faEllipsis,
	faChevronRight,
	faArrowRight
} from "@fortawesome/pro-light-svg-icons"
import { Todo } from "src/app/models/Todo"
import { TodoList } from "src/app/models/TodoList"

@Component({
	selector: "calendo-todo-list-tree-item",
	templateUrl: "./todo-list-tree-item.component.html",
	styleUrl: "./todo-list-tree-item.component.scss",
	standalone: false
})
export class TodoListTreeItemComponent {
	faEllipsis = faEllipsis
	faChevronRight = faChevronRight
	faArrowRight = faArrowRight
	@Input() item: Todo | TodoList
	@Input() level: number = 0
	@Input() allowDragging: boolean = false
	@Input() showOptionsButton: boolean = true
	@Input() showMoreButton: boolean = false
	@Input() expanded: boolean = true
	@Output() completedChange = new EventEmitter()
	@Output() optionsButtonClick = new EventEmitter()
	@Output() moreButtonClick = new EventEmitter()
	@Output() removeTodo = new EventEmitter()
	@ViewChild("itemsContainer")
	itemsContainer: ElementRef<HTMLDivElement>
	subItems: (Todo | TodoList)[] = []
	completed: boolean = false
	loaded: boolean = false
	marginBottom: string = "0"

	ngOnInit() {
		if (this.item instanceof TodoList) {
			this.subItems = this.item.items
		}

		this.checkCompleted()
	}

	async ngAfterViewInit() {
		await new Promise(r => setTimeout(r, 1))

		if (!this.expanded && this.itemsContainer != null) {
			this.marginBottom = `-${this.itemsContainer.nativeElement.clientHeight}px`
		}

		// Set loaded class on items-container to enable CSS transitions
		await new Promise(r => setTimeout(r, 100))
		this.loaded = true
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
		setTimeout(() => {
			this.removeTodo.emit(this.item.uuid)
		}, 250)
	}

	chevronButtonClick() {
		this.expanded = !this.expanded

		if (this.expanded) {
			this.marginBottom = "0"
		} else {
			this.marginBottom = `-${this.itemsContainer.nativeElement.clientHeight}px`
		}
	}

	todoDragged(event: (Todo | TodoList)[]) {
		let todoList = this.item as TodoList
		todoList.SetItems(event)
	}
}
