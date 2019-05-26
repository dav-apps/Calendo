import { Component, Input, ViewChild } from '@angular/core';
import { DataService } from 'src/app/services/data-service';
import { IIconStyles } from 'office-ui-fabric-react';
import { TodoList } from 'src/app/models/TodoList';
import { TodoListViewModalComponent } from '../todo-list-view-modal/todo-list-view-modal.component';

@Component({
	selector: "calendo-small-todo-list-item",
	templateUrl: "./small-todo-list-item.component.html"
})
export class SmallTodoListItemComponent{
	@Input()
	todoList: TodoList = new TodoList(null, "");
	@ViewChild(TodoListViewModalComponent)
	private todoListViewModal: TodoListViewModalComponent;

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

   ShowModal(){
		this.todoListViewModal.Show();
   }
}