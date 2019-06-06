import { Todo, ConvertTableObjectToTodo } from './Todo';
import { GetTableObject, TableObject, GetAllTableObjects } from 'dav-npm';
import { environment } from '../../environments/environment';

export class TodoList{
   public uuid: string = null;
   public name: string = "";
   public time: number = 0;
   public todos: Todo[] = [];
   public todoLists: TodoList[] = [];
	public groups: string[] = [];
	public list: string = null;

   constructor(
      uuid: string,
		name: string,
      time?: number,
      todos?: Todo[],
      todoLists?: TodoList[],
		groups?: string[],
		list?: string
	){
      this.uuid = uuid;
      this.name = name;
      this.time = time ? time : 0;
		this.todos = todos ? todos : [];
		this.todoLists = todoLists ? todoLists : [];
		this.groups = groups ? groups : [];
		this.list = list;
   }

	public static async Create(name: string, time: number = 0, todos: Todo[] = [], todoLists: TodoList[] = [], groups: string[] = [], list: string = null, uuid: string = null) : Promise<TodoList>{
		let todoList = new TodoList(uuid, name, time, todos, todoLists, groups, list);
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
   
   async AddTodo(todo: Todo){
      this.todos.push(todo);
      await this.Save();
   }

   async RemoveTodo(todo: Todo | string){
      let uuid = typeof todo == 'string' ? todo : todo.uuid;

		let index = this.todos.findIndex(t => t.uuid == uuid);
      if(index !== -1){
			this.todos.splice(index, 1);
         await this.Save();
      }
   }

   async AddTodoList(todoList: TodoList){
      this.todoLists.push(todoList);
      await this.Save();
   }

   async RemoveTodoList(todoList: TodoList | string){
		let uuid = typeof todoList == 'string' ? todoList : todoList.uuid;

      let index = this.todoLists.findIndex(t => t.uuid == uuid);
      if(index !== -1){
         this.todoLists.splice(index, 1);
         await this.Save();
      }
   }

	private async Save(){
		let tableObject = await GetTableObject(this.uuid);

		if(!tableObject){
			// Create the table object
			tableObject = new TableObject(this.uuid);
			tableObject.TableId = environment.todoListTableId;
			this.uuid = tableObject.Uuid;
		}

		let properties: {name: string, value: string}[] = [
			{ name: environment.todoListNameKey, value: this.name },
			{ name: environment.todoListTimeKey, value: this.time.toString() }
		];

		// Create the todos string
		let todoUuids: string[] = [];
		this.todos.forEach((todo: Todo) => todoUuids.push(todo.uuid));
		let todoUuidsString = todoUuids.join(",");
		properties.push({
			name: environment.todoListTodosKey,
			value: todoUuidsString
		});
      
      // Create the todoLists string
      let todoListUuids: string[] = [];
      this.todoLists.forEach((todoList: TodoList) => todoListUuids.push(todoList.uuid));
		let todoListUuidsString = todoListUuids.join(",");
		properties.push({
			name: environment.todoListTodoListsKey,
			value: todoListUuidsString
		});

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
      // Delete each todo
      for(let i = 0; i < this.todos.length; i++){
			await this.todos[i].Delete();
		}

		// Delete each child todo list
		for(let i = 0; i < this.todoLists.length; i++){
			await this.todoLists[i].Delete();
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

	return new TodoList(tableObject.Uuid, name, time, todos, todoLists, groups, list);
}