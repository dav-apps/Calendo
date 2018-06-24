import { Observable } from "rxjs";
import { GetTableObject, TableObject, GetAllTableObjects } from 'dav-npm';
import { environment } from "../../environments/environment";

export class Todo{
   constructor(public uuid: string, 
               public completed: boolean, 
               public time: number, 
               public name: string){}

   SetCompleted(completed: boolean){
      if(this.completed != completed){
         this.completed = completed;
         this.Save();
      }
	}
	
	async Delete(){
		var tableObject = await GetTableObject(this.uuid);
		if(tableObject){
			tableObject.Delete();
		}
	}

	private async Save(){
		var tableObject = await GetTableObject(this.uuid);
      if(tableObject){
			tableObject.SetPropertyValues([
				{ name: environment.todoNameKey, value: this.name},
				{ name: environment.todoCompletedKey, value: this.completed.toString() },
				{ name: environment.todoTimeKey, value: this.time.toString() }
			]);
      }
	}
}
/*
export function GetAllTodos(): Observable<Todo>{
   return new Observable<Todo>((observer: any) => {
		GetAllTableObjects(environment.todoTableId, false).then((tableObjects: TableObject[]) => {
			tableObjects.forEach((tableObject: TableObject) => {
				if(tableObject.TableId != environment.todoTableId){
					return;
				}
	
				var completed: boolean = (tableObject.Properties.get(environment.todoCompletedKey) === 'true' || 
													tableObject.Properties.get(environment.todoCompletedKey) === 'True')
				
				var todoTime: number = 0;
				var tableObjectTodoTime = tableObject.Properties.get(environment.todoTimeKey);
				if(tableObjectTodoTime){
					todoTime = Number.parseInt(tableObjectTodoTime);
				}
				var todo = new Todo(tableObject.Uuid, completed, todoTime, tableObject.Properties.get(environment.todoNameKey));
				
				observer.next(todo)
				return;
			});
		});
   });
}
*/
export async function GetAllTodos(): Promise<Todo[]>{
	var tableObjects = await GetAllTableObjects(environment.todoTableId, false);
	var todos: Todo[] = [];

	for(let tableObject of tableObjects){
		if(tableObject.TableId != environment.todoTableId){
			return;
		}

		var completed: boolean = (tableObject.Properties.get(environment.todoCompletedKey) === 'true' || 
											tableObject.Properties.get(environment.todoCompletedKey) === 'True')
		
		var todoTime: number = 0;
		var tableObjectTodoTime = tableObject.Properties.get(environment.todoTimeKey);
		if(tableObjectTodoTime){
			todoTime = Number.parseInt(tableObjectTodoTime);
		}
		var todo = new Todo(tableObject.Uuid, completed, todoTime, tableObject.Properties.get(environment.todoNameKey));
		
		todos.push(todo);
	}

	return todos;
}

export function CreateTodo(todo: Todo): string{
   var tableObject = new TableObject();
	tableObject.TableId = environment.todoTableId;
	tableObject.SetPropertyValues([
		{ name: environment.todoCompletedKey, value: todo.completed.toString() },
		{ name: environment.todoTimeKey, value: todo.time.toString() },
		{ name: environment.todoNameKey, value: todo.name }
	]);

	return tableObject.Uuid;
}