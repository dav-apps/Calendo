import { Component, ViewChild } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { Location } from "@angular/common"
import * as moment from "moment"
import { TodoList, GetTodoList } from "src/app/models/TodoList"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { TodoListTreeComponent } from "../../components/todo-list-tree/todo-list-tree.component"
import { TodoListModalComponent } from "src/app/components/todo-list-modal/todo-list-modal.component"
import { DeleteTodoListModalComponent } from "src/app/components/delete-todo-list-modal/delete-todo-list-modal.component"

@Component({
	templateUrl: "./todo-list-page.component.html"
})
export class TodoListPageComponent {
	locale = this.localizationService.locale.todoListDetailsPage
	@ViewChild("todoListTree", { static: true })
	todoListTree: TodoListTreeComponent
	@ViewChild("todoListModal", { static: true })
	todoListModal: TodoListModalComponent
	@ViewChild("deleteTodoListModal", { static: true })
	deleteTodoListModal: DeleteTodoListModalComponent
	todoList: TodoList = new TodoList()
	date: string = ""

	constructor(
		private dataService: DataService,
		private localizationService: LocalizationService,
		private route: ActivatedRoute,
		private location: Location
	) {
		moment.locale(this.dataService.locale)
	}

	ngOnInit() {
		this.route.params.subscribe(async param => {
			let list = await GetTodoList(param.uuid)

			if (!list) {
				this.location.back()
			}

			this.todoList.uuid = list.uuid
			this.todoList.name = list.name
			this.todoList.time = list.time
			this.todoList.groups = list.groups
			this.todoList.list = list.list
			this.todoList.items = list.items
			this.date = moment
				.unix(this.todoList.time)
				.format(this.locale.formats.date)

			this.todoListTree.Init()
		})
	}

	async Update(updatedTodoList?: TodoList) {
		if (updatedTodoList) {
			this.dataService.UpdateTodoList(updatedTodoList)

			// Update the local properties
			this.todoList.name = updatedTodoList.name
			this.todoList.time = updatedTodoList.time
			this.todoList.groups = updatedTodoList.groups

			this.date = moment
				.unix(this.todoList.time)
				.format(this.locale.formats.date)
		} else {
			this.dataService.UpdateTodoList(await GetTodoList(this.todoList.uuid))
		}
	}

	GoBack() {
		this.location.back()
	}

	ShowEditModal() {
		this.todoListModal.Show(this.todoList)
	}

	async ShowDeleteModal() {
		if (this.todoList.items.length == 0) {
			// Delete the todo list immediately
			await this.todoList.Delete()
			this.Remove()
		} else {
			// Show the confirmation modal
			this.deleteTodoListModal.Show(this.todoList)
		}
	}

	Remove() {
		this.dataService.RemoveTodoList(this.todoList)
		this.location.back()
	}
}
