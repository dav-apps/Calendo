import { Todo, ConvertTableObjectToTodo } from './Todo';
import { GetTableObject, TableObject, GetAllTableObjects } from 'dav-npm';
import { environment } from '../../environments/environment';

export class TodoList{
   public uuid: string = null;
   public name: string = "";
   public time: number = 0;
	public todos: Todo[] = [];
	public groups: string[] = [];

   constructor(
      uuid: string,
		name: string,
      time?: number,
      todos?: Todo[],
      groups?: string[]
	){
      this.uuid = uuid;
      this.name = name;
      this.time = time ? time : 0;
      this.todos = todos ? todos : [];
      this.groups = groups ? groups : [];
   }

	public static async Create(name: string, time: number = 0, todos: Todo[] = [], groups: string[] = []) : Promise<TodoList>{
		let list = new TodoList(null, name, time, todos, groups);
		await list.Save();
		return list;
	}

	private async Save(){
		let tableObject = await GetTableObject(this.uuid);

		if(!tableObject){
			// Create the table object
			tableObject = new TableObject();
			tableObject.TableId = environment.todoListTableId;
			this.uuid = tableObject.Uuid;
		}

		// Create the todos string
		let todoUuids: string[] = [];
		this.todos.forEach((todo: Todo) => todoUuids.push(todo.uuid));

		let todoUuidsString = todoUuids.join(",");

		// Set the properties
		await tableObject.SetPropertyValues([
			{ name: environment.todoListNameKey, value: this.name },
			{ name: environment.todoListTimeKey, value: this.time.toString() },
			{ name: environment.todoListTodosKey, value: todoUuidsString },
			{ name: environment.todoListGroupsKey, value: this.groups.join(',') }
		]);
	}
}

export async function GetAllTodoLists() : Promise<TodoList[]>{
	let tableObjects = await GetAllTableObjects(environment.todoListTableId, false);
	let todoLists: TodoList[] = [];

	for(let tableObject of tableObjects){
		let todoList = await ConvertTableObjectToTodoList(tableObject);

		if(todoList){
			todoLists.push(todoList);
		}
	}

	return todoLists;
}

export async function ConvertTableObjectToTodoList(tableObject: TableObject) : Promise<TodoList>{
	if(tableObject.TableId != environment.todoListTableId) return null;

	let name: string = "";
	name = tableObject.GetPropertyValue(environment.todoListNameKey);

	let time: number = 0;
	let todoTimeString = tableObject.GetPropertyValue(environment.todoListTimeKey);
	if(todoTimeString){
		time = Number.parseInt(todoTimeString);
	}

	let todos: Todo[] = [];
	let todoUuidsString = tableObject.GetPropertyValue(environment.todoListTodosKey);
	
	if(todoUuidsString){
		for(let uuid of todoUuidsString.split(',')){
			// Get the todo from the local storage
			let todoTableObject = await GetTableObject(uuid);
			let todo = ConvertTableObjectToTodo(todoTableObject);
			if(todo){
				todos.push(todo);
			}
		}
	}

	let groups: string[] = [];
	let groupsString = tableObject.GetPropertyValue(environment.todoListGroupsKey);
	
	if(groupsString){
		for(let group of groupsString.split(',')){
			groups.push(group);
		}
	}

	return new TodoList(tableObject.Uuid, name, time, todos, groups);
}