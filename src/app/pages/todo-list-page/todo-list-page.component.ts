import { Component, ViewChild } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { Location } from "@angular/common"
import { DateTime } from "luxon"
import { TodoList, GetTodoList } from "src/app/models/TodoList"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"
import { TodoListTreeComponent } from "../../components/todo-list-tree/todo-list-tree.component"

@Component({
	templateUrl: "./todo-list-page.component.html"
})
export class TodoListPageComponent {
	locale = this.localizationService.locale.todoListDetailsPage
	@ViewChild("todoListTree", { static: true })
	todoListTree: TodoListTreeComponent
	todoList: TodoList = new TodoList()
	date: string = ""

	constructor(
		private dataService: DataService,
		private localizationService: LocalizationService,
		private route: ActivatedRoute,
		private location: Location
	) {}

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
			this.date = DateTime.fromSeconds(this.todoList.time).toFormat(
				this.locale.formats.date
			)

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

			this.date = DateTime.fromSeconds(this.todoList.time).toFormat(
				this.locale.formats.date
			)
		} else {
			this.dataService.UpdateTodoList(await GetTodoList(this.todoList.uuid))
		}
	}

	GoBack() {
		this.location.back()
	}

	Remove() {
		this.dataService.RemoveTodoList(this.todoList)
		this.location.back()
	}
}
