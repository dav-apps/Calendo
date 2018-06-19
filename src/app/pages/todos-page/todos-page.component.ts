import { Component } from '@angular/core';
import { Todo, GetAllTodos } from '../../models/Todo';
import * as Dav from 'dav-npm';
import * as moment from 'moment';

@Component({
   selector: "calendo-todos-page",
   templateUrl: "./todos-page.component.html",
   styleUrls: [
      "./todos-page.component.scss"
   ]
})
export class TodosPageComponent{
	user: Dav.DavUser;
	todoDaysWithoutDate = {
		date: "",
		timestamp: 0,
		todos: []
	}
	todoDays: object[] = [];	// {date: string, timestamp: number, todos: Todo[]}

	constructor(){

	}

	ngOnInit(){
		this.user = new Dav.DavUser(async () => {
			var todos = GetAllTodos();
			todos.forEach(todo => {
				this.AddTodo(todo);
			});
		});
	}

	AddTodo(todo: Todo){
		if(todo.time != 0){
			var date: string = moment.unix(todo.time).format('D. MMMM YYYY');
			var timestampOfDate = moment.unix(todo.time).startOf('day').unix();

			// Check if the date already exists in the todoDays array
			var todoDay = this.todoDays.find(obj => obj["timestamp"] == timestampOfDate);

			if(todoDay){
				// Add the todo to the array of the todoDay
				var todosArray: Todo[] = todoDay["todos"];
				todosArray.push(todo);
			}else{
				// Add a new day to the array
				var newTodoDay = {
					date: date,
					timestamp: timestampOfDate,
					todos: [todo]
				}

				this.todoDays.push(newTodoDay);
			}
		}else{
			this.todoDaysWithoutDate.todos.push(todo);
		}

		// Sort the todoDays array
		this.todoDays.sort((a: object, b: object) => {
			var timestampString = "timestamp";
			if(a[timestampString] < b[timestampString]){
				return -1;
			}else if(a[timestampString] > b[timestampString]){
				return 1;
			}else{
				return 0;
			}
		});
	}

	DeleteTodo(uuid: string){
		// Find the todo in one of the arrays
		var index = this.todoDaysWithoutDate.todos.findIndex(t => t.uuid == uuid);

		if(index !== -1){
			this.todoDaysWithoutDate.todos.splice(index, 1);
		}else{
			this.todoDays.forEach(todoDay => {
				index = todoDay["todos"].findIndex(t => t.uuid == uuid);

				if(index !== -1){
					todoDay["todos"].splice(index, 1);
				}
			});
		}
	}
}