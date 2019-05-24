import { Component, Input } from '@angular/core';
import { DataService } from 'src/app/services/data-service';
import { IIconStyles } from 'office-ui-fabric-react';
import { TodoList } from 'src/app/models/TodoList';

@Component({
	selector: "calendo-small-todo-list-item",
	templateUrl: "./small-todo-list-item.component.html"
})
export class SmallTodoListItemComponent{
	@Input()
   todoList: TodoList = new TodoList(null, "");
   completedTodos: number = 0;
	iconStyles: IIconStyles = {
		root: {
			fontSize: 15,
			color: "#1da520"
		}
	}

	constructor(
		public dataService: DataService
   ){}
   
   ngOnInit(){
		this.UpdateCompletedTodos();
   }

   UpdateCompletedTodos(){
      this.todoList.todos.forEach(todo => {
         if(todo.completed) this.completedTodos++;
      });
   }
}