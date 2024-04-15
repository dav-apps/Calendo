import {
	Component,
	ViewChild,
	ElementRef,
	Output,
	EventEmitter
} from "@angular/core"
import { NgbModal } from "@ng-bootstrap/ng-bootstrap"
import { TodoList } from "src/app/models/TodoList"
import { DataService } from "../../services/data-service"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "calendo-delete-todo-list-modal",
	templateUrl: "./delete-todo-list-modal.component.html"
})
export class DeleteTodoListModalComponent {
	locale = this.localizationService.locale.deleteTodoListModal
	todoList: TodoList = new TodoList()
	@Output() remove = new EventEmitter()
	@ViewChild("deleteTodoListModal", { static: true }) todoListModal: ElementRef

	constructor(
		private dataService: DataService,
		private localizationService: LocalizationService,
		private modalService: NgbModal
	) {}

	Show(todoList: TodoList) {
		this.todoList = todoList

		this.modalService.open(this.todoListModal).result.then(
			async () => {
				await this.todoList.Delete()
				this.remove.emit(this.todoList)
			},
			() => {}
		)
	}
}
