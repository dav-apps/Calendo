import { Todo } from './Todo';
import { GetTableObject, TableObject } from 'dav-npm';
import { environment } from '../../environments/environment';

export class TodoList{
   public uuid: string;
   public name: string;
   public time: number;
	public todos: Todo[];
	public groups: string[];

   constructor(
		name: string,
      time?: number,
      todos?: Todo[],
      groups?: string[]
	){
      this.name = name;
      this.time = time ? time : 0;
      this.todos = todos ? todos : [];
      this.groups = groups ? groups : [];
   }

	public static async Create(name: string, time: number = 0, todos: Todo[] = [], groups: string[] = []) : Promise<TodoList>{
		let list = new TodoList(name, time, todos, groups);
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