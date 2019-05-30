import { GetTableObject, TableObject, GetAllTableObjects, DeleteNotification } from 'dav-npm';
import { environment } from "../../environments/environment";

export class Todo{
	public uuid: string = null;
	public name: string = "";
	public completed: boolean = false;
	public time: number = 0;
	public groups: string[] = [];
	public notificationUuid: string = null;

   constructor(
		uuid: string,
		name: string,
		completed?: boolean,
		time?: number,
		groups?: string[],
		notificationUuid?: string
	){
		this.uuid = uuid;
		this.name = name;
		this.completed = completed == null ? false : completed;
		this.time = time ? time : 0;
		this.groups = groups ? groups : [];
		this.notificationUuid ? notificationUuid : null;
	}

	public static async Create(name: string, completed: boolean = false, time: number, groups: string[] = [], notificationUuid: string = null, uuid: string = null) : Promise<Todo>{
		let todo = new Todo(uuid, name, completed, time, groups, notificationUuid);
		await todo.Save();
		return todo;
   }

	async AddGoup(name: string){
		if(this.groups.findIndex(n => n === name) === -1){
			this.groups.push(name);
			await this.Save();
		}
	}

	async RemoveGroup(name: string){
		var index = this.groups.findIndex(n => n === name);

		if(index !== -1){
			this.groups.splice(index, 1);
			await this.Save();
		}
	}

   async SetCompleted(completed: boolean){
      if(this.completed != completed){
         this.completed = completed;
         await this.Save();
      }
	}
	
	async Delete(){
		var tableObject = await GetTableObject(this.uuid);
		if(tableObject){
			if(this.notificationUuid){
				// Delete the notification
				await DeleteNotification(this.notificationUuid);
			}

			await tableObject.Delete();
		}
	}

	private async Save(){
		let tableObject = await GetTableObject(this.uuid);

		if(!tableObject){
			// Create the table object
			tableObject = new TableObject();
			tableObject.TableId = environment.todoTableId;
			this.uuid = tableObject.Uuid;
		}

		let properties: {name: string, value: string}[] = [
			{ name: environment.todoNameKey, value: this.name},
			{ name: environment.todoCompletedKey, value: this.completed.toString() },
			{ name: environment.todoTimeKey, value: this.time.toString() }
		]

		if(this.groups.length > 0){
			properties.push({
				name: environment.todoGroupsKey,
				value: this.groups.join(',')
			});
		}

		if(this.notificationUuid){
			properties.push({
				name: environment.notificationUuidKey,
				value: this.notificationUuid
			});
		}

		await tableObject.SetPropertyValues(properties);
	}
}

export async function GetAllTodos(): Promise<Todo[]>{
	var tableObjects = await GetAllTableObjects(environment.todoTableId, false);
	var todos: Todo[] = [];

	for(let tableObject of tableObjects){
		var todo = ConvertTableObjectToTodo(tableObject);

		if(todo){
			todos.push(todo);
		}
	}

	return todos;
}

export async function GetTodo(uuid: string) : Promise<Todo>{
	let tableObject = await GetTableObject(uuid);
	return ConvertTableObjectToTodo(tableObject);
}

export async function GetAllTodoGroups(): Promise<string[]>{
	var allTodos = await GetAllTodos();
	var todoGroups: string[] = [];

	allTodos.forEach(todo => {
		todo.groups.forEach(group => {
			let index = todoGroups.findIndex(g => g == group);

			if(index == -1){
				// Add the group
				todoGroups.push(group);
			}
		});
	});

	return todoGroups;
}

export function ConvertTableObjectToTodo(tableObject: TableObject): Todo{
	if(tableObject.TableId != environment.todoTableId) return null;

	var completed: boolean = tableObject.GetPropertyValue(environment.todoCompletedKey).toLowerCase() === 'true';
	
	var todoTime: number = 0;
	var tableObjectTodoTime = tableObject.GetPropertyValue(environment.todoTimeKey);
	if(tableObjectTodoTime){
		todoTime = Number.parseInt(tableObjectTodoTime);
	}

	var groups: string[] = [];
	var groupsString = tableObject.GetPropertyValue(environment.todoGroupsKey);

	if(groupsString){
		groupsString.split(',').forEach(group => {
			groups.push(group);
		});
   }
   
	var tableObjectNotificationUuid = tableObject.GetPropertyValue(environment.notificationUuidKey);
	var notificationUuid = tableObjectNotificationUuid ? tableObjectNotificationUuid : "";

	return new Todo(
		tableObject.Uuid, 
		tableObject.GetPropertyValue(environment.todoNameKey),
		completed,
		todoTime,
		groups,
		notificationUuid
	);
}