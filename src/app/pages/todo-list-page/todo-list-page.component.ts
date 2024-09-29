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
import { TodoDialogEventData } from "src/app/types"

@Component({
	templateUrl: "./todo-list-page.component.html",
	styleUrl: "./todo-list-page.component.scss"
})
export class TodoListPageComponent {
	locale = this.localizationService.locale.todoListPage
	actionsLocale = this.localizationService.locale.actions
	errorsLocale = this.localizationService.locale.errors
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

	//#region OptionsButtonContextMenu
	@ViewChild("optionsButtonContextMenu")
	optionsButtonContextMenu: ElementRef<ContextMenu>
	optionsButtonContextMenuVisible: boolean = false
	optionsButtonContextMenuPositionX: number = 0
	optionsButtonContextMenuPositionY: number = 0
	optionsButtonContextMenuSelectedItem: TodoList
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
		public dataService: DataService,
		private localizationService: LocalizationService,
		private route: ActivatedRoute,
		private location: Location
	) {}

	async ngOnInit() {
		await this.dataService.loadTodoLists()

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
			this.date = DateTime.fromSeconds(this.todoList.time).toFormat("DDD", {
				locale: this.dataService.locale
			})
		})
	}

	@HostListener("document:click", ["$event"])
	documentClick(event: PointerEvent) {
		if (
			!this.addButtonContextMenu.nativeElement.contains(
				event.target as Node
			) &&
			!this.optionsButtonContextMenu.nativeElement.contains(
				event.target as Node
			)
		) {
			this.addButtonContextMenuVisible = false
			this.optionsButtonContextMenuVisible = false
		}
	}

	addButtonClick(event: CustomEvent) {
		if (this.addButtonContextMenuVisible) {
			this.addButtonContextMenuVisible = false
		} else {
			this.addItemDialogParent = this.todoList
			this.addButtonContextMenuPositionX = event.detail.contextMenuPosition.x
			this.addButtonContextMenuPositionY = event.detail.contextMenuPosition.y

			this.addButtonContextMenuVisible = true
			this.optionsButtonContextMenuVisible = false
		}
	}

	optionsButtonClick(e: { event: CustomEvent; item: TodoList }) {
		if (this.optionsButtonContextMenuVisible) {
			this.optionsButtonContextMenuVisible = false
		} else {
			this.addItemDialogParent = e.item
			this.optionsButtonContextMenuSelectedItem = e.item
			this.optionsButtonContextMenuPositionX =
				e.event.detail.contextMenuPosition.x
			this.optionsButtonContextMenuPositionY =
				e.event.detail.contextMenuPosition.y

			this.addButtonContextMenuVisible = false
			this.optionsButtonContextMenuVisible = true
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
		this.optionsButtonContextMenuVisible = false

		this.addTodoDialog.reset()
		this.addTodoDialog.show()
	}

	showAddTodoListDialog() {
		this.addButtonContextMenuVisible = false
		this.optionsButtonContextMenuVisible = false

		this.addTodoListDialog.reset()
		this.addTodoListDialog.show()
	}

	showEditSubTodoListDialog() {
		this.optionsButtonContextMenuVisible = false
		this.editSubTodoListDialog.name =
			this.optionsButtonContextMenuSelectedItem.name
		this.editSubTodoListDialog.show()
	}

	showDeleteSubTodoListDialog() {
		this.optionsButtonContextMenuVisible = false

		if (this.optionsButtonContextMenuSelectedItem.items.length == 0) {
			// Delete the todo list immediately
			this.deleteSubTodoList()
		} else {
			this.deleteSubTodoListDialog.show()
		}
	}

	showDeleteTodoListDialog() {
		if (this.todoList.items.length == 0) {
			// Delete the todo list immediately
			this.deleteTodoList()
		} else {
			this.deleteTodoListDialog.show()
		}
	}

	async updateTodoList(event: TodoDialogEventData) {
		if (event.date != null) {
			this.date = DateTime.fromSeconds(this.todoList.time).toFormat("DD", {
				locale: this.dataService.locale
			})
		}

		await this.todoList.Update(
			event.name,
			event.date?.toUnixInteger() ?? 0,
			event.labels
		)

		this.editTodoListDialog.hide()
		this.dataService.todoListsChanged = true
	}

	async addTodo(event: { name: string }) {
		if (event.name.length == 0) {
			this.addTodoDialog.nameError = this.errorsLocale.nameMissing
			return
		}

		let todo = await Todo.Create(
			event.name,
			false,
			null,
			null,
			this.addItemDialogParent.uuid
		)

		await this.addItemDialogParent.AddItem(todo)
		this.addTodoDialog.hide()
		this.dataService.todoListsChanged = true
	}

	async addTodoList(event: { name: string }) {
		if (event.name.length == 0) {
			this.addTodoListDialog.nameError = this.errorsLocale.nameMissing
			return
		}

		let todoList = await TodoList.Create(
			event.name,
			null,
			null,
			null,
			this.addItemDialogParent.uuid
		)

		await this.addItemDialogParent.AddItem(todoList)
		this.addTodoListDialog.hide()
		this.dataService.todoListsChanged = true
	}

	async updateSubTodoList(event: { name: string }) {
		await this.optionsButtonContextMenuSelectedItem.Update(event.name)
		this.editSubTodoListDialog.hide()
		this.dataService.todoListsChanged = true
	}

	async deleteSubTodoList() {
		await this.optionsButtonContextMenuSelectedItem.Delete()
		this.removeItem(
			this.optionsButtonContextMenuSelectedItem.uuid,
			this.todoList
		)
		this.optionsButtonContextMenuSelectedItem = null
		this.deleteSubTodoListDialog.hide()
		this.dataService.todoListsChanged = true
	}

	async deleteTodoList() {
		await this.todoList.Delete()
		this.dataService.todoListsChanged = true
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

	getBadgeColor(i: number) {
		switch (i) {
			case 0:
				return "primary"
			case 1:
				return "secondary"
			default:
				return "tertiary"
		}
	}
}
