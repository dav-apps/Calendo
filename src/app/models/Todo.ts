import {
	TableObject,
	Property,
	GetTableObject,
	GetAllTableObjects,
	GetNotification
} from "dav-js"
import { environment } from "../../environments/environment"
import { GetAllTodoLists } from "./TodoList"

export class Todo {
	public uuid: string
	public name: string
	public completed: boolean
	public time: number
	public groups: string[]
	public list: string
	public notificationUuid: string

	constructor(
		name: string = "",
		completed: boolean = false,
		time: number = 0,
		groups: string[] = [],
		list: string = null,
		notificationUuid: string = null
	) {
		this.name = name
		this.completed = completed
		this.time = time
		this.groups = groups
		this.list = list
		this.notificationUuid = notificationUuid
	}

	public static async Create(
		name: string,
		completed: boolean = false,
		time: number = 0,
		groups: string[] = [],
		list: string = null,
		notificationUuid: string = null,
		uuid: string = null
	): Promise<Todo> {
		let todo = new Todo(name, completed, time, groups, list, notificationUuid)
		todo.uuid = uuid
		await todo.Save()
		return todo
	}

	async AddGoup(name: string) {
		if (this.groups.findIndex(n => n === name) === -1) {
			this.groups.push(name)
			await this.Save()
		}
	}

	async RemoveGroup(name: string) {
		var index = this.groups.findIndex(n => n === name)

		if (index !== -1) {
			this.groups.splice(index, 1)
			await this.Save()
		}
	}

	async SetCompleted(completed: boolean) {
		if (this.completed != completed) {
			this.completed = completed
			await this.Save()
		}
	}

	async SetList(list: string) {
		this.list = list
		await this.Save()
	}

	async Delete() {
		let tableObject = await GetTableObject(this.uuid)
		if (tableObject == null) return

		if (this.notificationUuid) {
			// Delete the notification
			let notification = await GetNotification(this.notificationUuid)

			if (notification != null) {
				await notification.Delete()
			}
		}

		await tableObject.Delete()
	}

	private async Save() {
		let tableObject = await GetTableObject(this.uuid)

		if (!tableObject) {
			// Create the table object
			tableObject = new TableObject({
				Uuid: this.uuid,
				TableId: environment.todoTableId
			})
			this.uuid = tableObject.Uuid
		}

		let properties: Property[] = [
			{ name: environment.todoNameKey, value: this.name },
			{
				name: environment.todoCompletedKey,
				value: this.completed.toString()
			}
		]

		if (this.time != null && this.time != 0) {
			properties.push({
				name: environment.todoTimeKey,
				value: this.time.toString()
			})
		}

		if (this.groups?.length > 0) {
			properties.push({
				name: environment.todoGroupsKey,
				value: this.groups.join(",")
			})
		}

		if (this.list) {
			properties.push({
				name: environment.todoListKey,
				value: this.list
			})
		}

		if (this.notificationUuid) {
			properties.push({
				name: environment.notificationUuidKey,
				value: this.notificationUuid
			})
		}

		await tableObject.SetPropertyValues(properties)
	}
}

export async function GetAllTodos(): Promise<Todo[]> {
	var tableObjects = await GetAllTableObjects(environment.todoTableId, false)
	var todos: Todo[] = []

	for (let tableObject of tableObjects) {
		var todo = ConvertTableObjectToTodo(tableObject)

		if (todo) {
			todos.push(todo)
		}
	}

	return todos
}

export async function GetTodo(uuid: string): Promise<Todo> {
	let tableObject = await GetTableObject(uuid)
	return ConvertTableObjectToTodo(tableObject)
}

export async function GetAllTodoGroups(): Promise<string[]> {
	let todoGroups: string[] = []
	let allTodos = await GetAllTodos()
	let allTodoLists = await GetAllTodoLists()

	allTodos.forEach(todo => {
		todo.groups.forEach(group => {
			let index = todoGroups.findIndex(g => g == group)

			if (index == -1) {
				// Add the group
				todoGroups.push(group)
			}
		})
	})

	allTodoLists.forEach(todoList => {
		todoList.groups.forEach(group => {
			let index = todoGroups.findIndex(g => g == group)

			if (index == -1) {
				// Add the group
				todoGroups.push(group)
			}
		})
	})

	return todoGroups
}

export function ConvertTableObjectToTodo(tableObject: TableObject): Todo {
	if (!tableObject || tableObject.TableId != environment.todoTableId)
		return null

	let name = tableObject.GetPropertyValue(environment.todoNameKey) as string

	let completed: boolean = false
	let completedString = tableObject.GetPropertyValue(
		environment.todoCompletedKey
	) as string
	if (completedString != null) {
		completed = completedString.toLowerCase() == "true"
	}

	let time: number = 0
	let timeString = tableObject.GetPropertyValue(
		environment.todoTimeKey
	) as string
	if (timeString != null) {
		time = +timeString
	}

	// Groups
	let groups: string[] = []
	let groupsString = tableObject.GetPropertyValue(
		environment.todoGroupsKey
	) as string
	if (groupsString != null) {
		groupsString.split(",").forEach(group => {
			groups.push(group)
		})
	}

	let list = tableObject.GetPropertyValue(environment.todoListKey) as string

	let notificationUuid = tableObject.GetPropertyValue(
		environment.notificationUuidKey
	) as string

	let todo = new Todo(name, completed, time, groups, list, notificationUuid)
	todo.uuid = tableObject.Uuid
	return todo
}
