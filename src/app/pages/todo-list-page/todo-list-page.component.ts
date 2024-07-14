import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { Location } from "@angular/common"
import { DateTime } from "luxon"
import {
	faCircleCheck as faCircleCheckLight,
	faListCheck as faListCheckLight
} from "@fortawesome/pro-light-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { TodoListTreeComponent } from "../../components/todo-list-tree/todo-list-tree.component"
import { DeleteTodoListDialogComponent } from "src/app/dialogs/delete-todo-list-dialog/delete-todo-list-dialog.component"
import { TodoList, GetTodoList } from "src/app/models/TodoList"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	templateUrl: "./todo-list-page.component.html",
	styleUrl: "./todo-list-page.component.scss"
})
export class TodoListPageComponent {
	locale = this.localizationService.locale.todoListPage
	faCircleCheckLight = faCircleCheckLight
	faListCheckLight = faListCheckLight
	@ViewChild("todoListTree", { static: true })
	todoListTree: TodoListTreeComponent
	todoList: TodoList = new TodoList()
	date: string = ""

	//#region AddButtonContextMenu
	@ViewChild("addButtonContextMenu")
	addButtonContextMenu: ElementRef<ContextMenu>
	addButtonContextMenuVisible: boolean = false
	addButtonContextMenuPositionX: number = 0
	addButtonContextMenuPositionY: number = 0
	preventHidingAddButtonContextMenu = false
	//#endregion

	//#region DeleteTodoListDialog
	@ViewChild("deleteTodoListDialog")
	deleteTodoListDialog: DeleteTodoListDialogComponent
	//#endregion

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
			this.date = DateTime.fromSeconds(this.todoList.time).toFormat("DD")

			//this.todoListTree.Init()
		})
	}

	@HostListener("document:click", ["$event"])
	documentClick(event: MouseEvent) {
		if (this.preventHidingAddButtonContextMenu) {
			this.preventHidingAddButtonContextMenu = false
		} else if (
			!this.addButtonContextMenu.nativeElement.contains(event.target as Node)
		) {
			this.addButtonContextMenuVisible = false
		}
	}

	addButtonClick(event: CustomEvent) {
		if (this.addButtonContextMenuVisible) {
			this.addButtonContextMenuVisible = false
		} else {
			this.addButtonContextMenuPositionX = event.detail.contextMenuPosition.x
			this.addButtonContextMenuPositionY = event.detail.contextMenuPosition.y
			this.addButtonContextMenuVisible = true
			this.preventHidingAddButtonContextMenu = true
		}
	}

	async Update(updatedTodoList?: TodoList) {
		if (updatedTodoList) {
			// Update the local properties
			this.todoList.name = updatedTodoList.name
			this.todoList.time = updatedTodoList.time
			this.todoList.groups = updatedTodoList.groups

			this.date = DateTime.fromSeconds(this.todoList.time).toFormat("DD")
		}
	}

	goBack() {
		this.location.back()
	}

	async deleteTodoList() {
		await this.todoList.Delete()
		this.goBack()
	}
}
