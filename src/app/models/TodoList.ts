import { TableObject, Property, GetTableObject, GetAllTableObjects } from 'dav-npm';
import { Todo, ConvertTableObjectToTodo } from './Todo';
import { environment } from '../../environments/environment';

export class TodoList{
   public uuid: string;
   public name: string;
   public time: number;
	public items: (Todo | TodoList)[];
	public groups: string[];
	public list: string;

   constructor(
		name: string = "",
      time: number = 0,
      items: (Todo | TodoList)[] = [],
		groups: string[] = [],
		list: string = null
	){
      this.name = name;
      this.time = time;
		this.items = items;
		this.groups = groups;
		this.list = list;
   }

	public static async Create(name: string, time: number = 0, items: (Todo | TodoList)[] = [], groups: string[] = [], list: string = null, uuid: string = null) : Promise<TodoList>{
		let todoList = new TodoList(name, time, items, groups, list);
		todoList.uuid = uuid;
		await todoList.Save();
		return todoList;
   }

   async Update(name?: string, time?: number, groups?: string[], list?: string){
      if(name != null) this.name = name;
      if(time != null) this.time = time;
      if(groups) this.groups = groups;
      if(list != null) this.list = list;
      await this.Save();
	}
	
	async SetName(name: string){
		if(this.name == name) return;

		this.name = name;
		await this.Save();
	}
	
	async SetItems(items: (Todo | TodoList)[]){
		this.items = items;
		await this.Save();
   }
   
   async SetList(list: string){
      this.list = list;
      await this.Save();
   }

	private async Save(){
		let tableObject = await GetTableObject(this.uuid);

		if(!tableObject){
			// Create the table object
			tableObject = new TableObject(this.uuid);
			tableObject.TableId = environment.todoListTableId;
			this.uuid = tableObject.Uuid;
		}

		let properties: Property[] = [
			{ name: environment.todoListNameKey, value: this.name },
			{ name: environment.todoListTimeKey, value: this.time.toString() }
		];

		// Create the items string
		let itemUuids: string[] = [];
		this.items.forEach((item: (Todo | TodoList)) => itemUuids.push(item.uuid));
		properties.push({
			name: environment.todoListItemsKey,
			value: itemUuids.join(",")
		});

		// Remove the todos and todoLists properties
		await tableObject.RemoveProperty(environment.todoListTodosKey);
		await tableObject.RemoveProperty(environment.todoListTodoListsKey);

		// Groups
		properties.push({
			name: environment.todoListGroupsKey, 
			value: this.groups.join(',')
		});

		// List
		if(this.list){
			properties.push({
				name: environment.todoListListKey,
				value: this.list
			});
		}

		// Set the properties
		await tableObject.SetPropertyValues(properties);
   }
   
   public async Delete(){
		// Delete each item
		for(let i = 0; i < this.items.length; i++){
			await this.items[i].Delete();
		}
      
      // Self-destruction!
		let tableObject = await GetTableObject(this.uuid);
		if(tableObject){
			await tableObject.Delete();
		}
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

export async function GetTodoList(uuid: string) : Promise<TodoList>{
	let tableObject = await GetTableObject(uuid);
	return await ConvertTableObjectToTodoList(tableObject);
}

export async function ConvertTableObjectToTodoList(tableObject: TableObject) : Promise<TodoList>{
	if(!tableObject || tableObject.TableId != environment.todoListTableId) return null;

	// name
	let name = tableObject.GetPropertyValue(environment.todoListNameKey);

	// time
	let time: number = 0;
	let todoTimeString = tableObject.GetPropertyValue(environment.todoListTimeKey);
	if(todoTimeString){
		time = Number.parseInt(todoTimeString);
	}

	// todos
	let todos: Todo[] = [];
	let todoUuidsString = tableObject.GetPropertyValue(environment.todoListTodosKey);
	
	if(todoUuidsString){
		for(let uuid of todoUuidsString.split(',')){
			// Get the todo from the local storage
         let todoTableObject = await GetTableObject(uuid);
         if(!todoTableObject) continue;
			let todo = ConvertTableObjectToTodo(todoTableObject);
			if(todo){
				todos.push(todo);
			}
		}
	}

	// todo lists
	let todoLists: TodoList[] = [];
	let todoListUuidsString = tableObject.GetPropertyValue(environment.todoListTodoListsKey);

	if(todoListUuidsString){
		for(let uuid of todoListUuidsString.split(',')){
			// Get the todo list from the local storage
			let todoListTableObject = await GetTableObject(uuid);
			let todoList = await ConvertTableObjectToTodoList(todoListTableObject);
			if(todoList){
				todoLists.push(todoList);
			}
		}
	}

	// Items
	let items: (Todo | TodoList)[] = [];
	let itemsUuidsString = tableObject.GetPropertyValue(environment.todoListItemsKey);

	if(itemsUuidsString){
		for(let uuid of itemsUuidsString.split(',')){
			// Get the todo or todo list from local storage
			let itemTableObject = await GetTableObject(uuid);
			if(!itemTableObject) continue;
			
			if(itemTableObject.TableId == environment.todoTableId){
				let todo = ConvertTableObjectToTodo(itemTableObject);
				if(todo) items.push(todo);
			}else if(itemTableObject.TableId == environment.todoListTableId){
				let todoList = await ConvertTableObjectToTodoList(itemTableObject);
				if(todoList) items.push(todoList);
			}
		}
	}
	
	// Move all todos and todo lists into the items array
	for(let todo of todos) items.push(todo);
	for(let todoList of todoLists) items.push(todoList);

	// Groups
	let groups: string[] = [];
	let groupsString = tableObject.GetPropertyValue(environment.todoListGroupsKey);
	
	if(groupsString){
		for(let group of groupsString.split(',')){
			groups.push(group);
		}
	}

	// List
	let list = tableObject.GetPropertyValue(environment.todoListListKey);

	let todoList = new TodoList(name, time, items, groups, list);
	todoList.uuid = tableObject.Uuid;
	return todoList;
}