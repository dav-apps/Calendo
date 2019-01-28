import { GetTableObject, TableObject, GetAllTableObjects, DeleteNotification } from 'dav-npm';
import { environment } from "../../environments/environment";

export class Todo{
   constructor(public uuid: string, 
               public completed: boolean, 
               public time: number, 
					public name: string,
					public groups: string[],
					public notificationUuid: string = ""){}

	AddGoup(name: string){
		if(this.groups.findIndex(n => n === name) === -1){
			this.groups.push(name);
			this.Save();	
		}
	}

	RemoveGroup(name: string){
		var index = this.groups.findIndex(n => n === name);

		if(index !== -1){
			this.groups.splice(index, 1);
			this.Save();
		}
	}

   SetCompleted(completed: boolean){
      if(this.completed != completed){
         this.completed = completed;
         this.Save();
      }
	}
	
	async Delete(){
		var tableObject = await GetTableObject(this.uuid);
		if(tableObject){
			if(this.notificationUuid){
				// Delete the notification
				DeleteNotification(this.notificationUuid);
			}

			tableObject.Delete();
		}
	}

	private async Save(){
		var tableObject = await GetTableObject(this.uuid);
      if(tableObject){
			tableObject.SetPropertyValues([
				{ name: environment.todoNameKey, value: this.name},
				{ name: environment.todoCompletedKey, value: this.completed.toString() },
				{ name: environment.todoTimeKey, value: this.time.toString() },
				{ name: environment.todoGroupsKey, value: ConvertGroupsArrayToString(this.groups) }
			]);

			if(this.notificationUuid){
				tableObject.SetPropertyValue(environment.notificationUuidKey, this.notificationUuid);
			}
      }
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

export function CreateTodo(todo: Todo): string{
   var tableObject = new TableObject();
	tableObject.TableId = environment.todoTableId;

	var propertiesArray: {name: string, value: string}[] = [
		{ name: environment.todoCompletedKey, value: todo.completed.toString() },
		{ name: environment.todoTimeKey, value: todo.time.toString() },
		{ name: environment.todoNameKey, value: todo.name }
	];

	var groupsString = ConvertGroupsArrayToString(todo.groups);
	if(groupsString.length > 0){
		propertiesArray.push({name: environment.todoGroupsKey, value: groupsString});
	}

	if(todo.notificationUuid){
		propertiesArray.push({name: environment.notificationUuidKey, value: todo.notificationUuid});
	}

	tableObject.SetPropertyValues(propertiesArray);

	return tableObject.Uuid;
}

export function ConvertTableObjectToTodo(tableObject: TableObject): Todo{
	if(tableObject.TableId != environment.todoTableId) return null;

	var completed: boolean = (tableObject.GetPropertyValue(environment.todoCompletedKey) === 'true' || 
										tableObject.GetPropertyValue(environment.todoCompletedKey) === 'True')
	
	var todoTime: number = 0;
	var tableObjectTodoTime = tableObject.GetPropertyValue(environment.todoTimeKey);
	if(tableObjectTodoTime){
		todoTime = Number.parseInt(tableObjectTodoTime);
	}

	var groups: string[] = [];
	var groupsString = tableObject.GetPropertyValue(environment.todoGroupsKey);

	if(groupsString){
		ConvertGroupsStringToGroupsArray(groupsString).forEach(group => {
			groups.push(group);
		});
	}

	var tableObjectNotificationUuid = tableObject.GetPropertyValue(environment.notificationUuidKey);
	var notificationUuid = tableObjectNotificationUuid ? tableObjectNotificationUuid : "";

	return new Todo(tableObject.Uuid, completed, todoTime, tableObject.GetPropertyValue(environment.todoNameKey), groups, notificationUuid);
}

function ConvertGroupsArrayToString(groups: string[]): string{
	var groupsString = "";

	groups.forEach(group => {
		groupsString += group + ",";
	});

	// Remove the last comma from the string
	if(groupsString.length > 0){
		groupsString = groupsString.slice(0, groupsString.length - 1);
	}

	return groupsString;
}

function ConvertGroupsStringToGroupsArray(groups: string): string[]{
	if(groups){
		return groups.split(',');	
	}else{
		return [];
	}
}