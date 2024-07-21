import { Component, ViewChild, ElementRef, HostListener } from "@angular/core"
import { ActivatedRoute } from "@angular/router"
import { Location } from "@angular/common"
import { DateTime } from "luxon"
import {
	faCircleCheck,
	faListCheck,
	faEdit,
	faTrash
} from "@fortawesome/pro-light-svg-icons"
import { ContextMenu } from "dav-ui-components"
import { TodoListTreeComponent } from "src/app/components/todo-list-tree/todo-list-tree.component"
import { TodoDialogComponent } from "src/app/dialogs/todo-dialog/todo-dialog.component"
import { TodoListSubItemDialogComponent } from "src/app/dialogs/todo-list-sub-item-dialog/todo-list-sub-item-dialog.component"
import { DeleteTodoListDialogComponent } from "src/app/dialogs/delete-todo-list-dialog/delete-todo-list-dialog.component"
import { Todo } from "src/app/models/Todo"
import { TodoList, GetTodoList } from "src/app/models/TodoList"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	templateUrl: "./todo-list-page.component.html",
	styleUrl: "./todo-list-page.component.scss"
})
export class TodoListPageComponent {
	locale = this.localizationService.locale.todoListPage
	actionsLocale = this.localizationService.locale.actions
	faCircleCheck = faCircleCheck
	faListCheck = faListCheck
	faEdit = faEdit
	faTrash = faTrash
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
	//#endregion

	//#region MoreButtonContextMenu
	@ViewChild("moreButtonContextMenu")
	moreButtonContextMenu: ElementRef<ContextMenu>
	moreButtonContextMenuVisible: boolean = false
	moreButtonContextMenuPositionX: number = 0
	moreButtonContextMenuPositionY: number = 0
	moreButtonContextMenuSelectedItem: TodoList
	//#endregion

	//#region EditTodoListDialog
	@ViewChild("editTodoListDialog")
	editTodoListDialog: TodoDialogComponent
	//#endregion

	//#region AddTodoDialog
	@ViewChild("addTodoDialog")
	addTodoDialog: TodoListSubItemDialogComponent
	addItemDialogParent: TodoList
	//#endregion

	//#region AddTodoListDialog
	@ViewChild("addTodoListDialog")
	addTodoListDialog: TodoListSubItemDialogComponent
	//#endregion

	//#region EditSubTodoListDialog
	@ViewChild("editSubTodoListDialog")
	editSubTodoListDialog: TodoListSubItemDialogComponent
	//#endregion

	//#region DeleteSubTodoListDialog
	@ViewChild("deleteSubTodoListDialog")
	deleteSubTodoListDialog: DeleteTodoListDialogComponent
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
		})
	}

	@HostListener("document:click", ["$event"])
	documentClick(event: PointerEvent) {
		if (
			!this.addButtonContextMenu.nativeElement.contains(
				event.target as Node
			) &&
			!this.moreButtonContextMenu.nativeElement.contains(
				event.target as Node
			)
		) {
			this.addButtonContextMenuVisible = false
			this.moreButtonContextMenuVisible = false
		}
	}

	addButtonClick(e: { event: CustomEvent; parent: TodoList }) {
		if (this.addButtonContextMenuVisible) {
			this.addButtonContextMenuVisible = false
		} else {
			this.addItemDialogParent = e.parent
			this.addButtonContextMenuPositionX =
				e.event.detail.contextMenuPosition.x
			this.addButtonContextMenuPositionY =
				e.event.detail.contextMenuPosition.y

			this.addButtonContextMenuVisible = true
			this.moreButtonContextMenuVisible = false
		}
	}

	moreButtonClick(e: { event: CustomEvent; item: TodoList }) {
		if (this.moreButtonContextMenuVisible) {
			this.moreButtonContextMenuVisible = false
		} else {
			this.moreButtonContextMenuSelectedItem = e.item
			this.moreButtonContextMenuPositionX =
				e.event.detail.contextMenuPosition.x
			this.moreButtonContextMenuPositionY =
				e.event.detail.contextMenuPosition.y

			this.addButtonContextMenuVisible = false
			this.moreButtonContextMenuVisible = true
		}
	}

	showEditTodoListDialog() {
		this.editTodoListDialog.name = this.todoList.name
		this.editTodoListDialog.labels = this.todoList.groups

		if (this.todoList.time != 0) {
			this.editTodoListDialog.date = DateTime.fromSeconds(this.todoList.time)
			this.editTodoListDialog.saveDate = true
		} else {
			this.editTodoListDialog.saveDate = false
		}

		this.editTodoListDialog.show()
	}

	showAddTodoDialog() {
		this.addButtonContextMenuVisible = false
		this.addTodoDialog.show()
	}

	showAddTodoListDialog() {
		this.addButtonContextMenuVisible = false
		this.addTodoListDialog.show()
	}

	showEditSubTodoListDialog() {
		this.moreButtonContextMenuVisible = false
		this.editSubTodoListDialog.name =
			this.moreButtonContextMenuSelectedItem.name
		this.editSubTodoListDialog.show()
	}

	showDeleteSubTodoListDialog() {
		this.moreButtonContextMenuVisible = false
		this.deleteSubTodoListDialog.show()
	}

	async updateTodoList(event: {
		name: string
		date: DateTime
		labels: string[]
	}) {
		if (event.date != null) {
			this.date = DateTime.fromSeconds(this.todoList.time).toFormat("DD")
		}

		await this.todoList.Update(
			event.name,
			event.date?.toUnixInteger() ?? 0,
			event.labels
		)

		this.editTodoListDialog.hide()
	}

	async addTodo(event: { name: string }) {
		let todo = await Todo.Create(
			event.name,
			false,
			null,
			null,
			this.addItemDialogParent.uuid
		)

		await this.addItemDialogParent.AddItem(todo)
		this.addTodoDialog.hide()
	}

	async addTodoList(event: { name: string }) {
		let todoList = await TodoList.Create(
			event.name,
			null,
			null,
			null,
			this.addItemDialogParent.uuid
		)

		await this.addItemDialogParent.AddItem(todoList)
		this.addTodoListDialog.hide()
	}

	async updateSubTodoList(event: { name: string }) {
		await this.moreButtonContextMenuSelectedItem.Update(event.name)
		this.editSubTodoListDialog.hide()
	}

	async deleteSubTodoList() {
		await this.moreButtonContextMenuSelectedItem.Delete()
		this.removeItem(
			this.moreButtonContextMenuSelectedItem.uuid,
			this.todoList
		)
		this.moreButtonContextMenuSelectedItem = null
		this.deleteSubTodoListDialog.hide()
	}

	async deleteTodoList() {
		await this.todoList.Delete()
		this.goBack()
	}

	goBack() {
		this.location.back()
	}

	async removeItem(itemUuid: string, parent: TodoList) {
		for (let i = 0; i < parent.items.length; i++) {
			let item = parent.items[i]

			if (item.uuid == itemUuid) {
				// Remove the item & save the new item list
				parent.items.splice(i, 1)
				await parent.SetItems(parent.items)
				break
			} else if (item instanceof TodoList) {
				await this.removeItem(itemUuid, item)
			}
		}
	}
}
