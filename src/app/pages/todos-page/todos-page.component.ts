import { Component, ViewChild } from '@angular/core';
import { Todo } from '../../models/Todo';
import { DataService } from '../../services/data-service';
import { NewTodoModalComponent } from '../../components/new-todo-modal/new-todo-modal.component';

@Component({
   selector: "calendo-todos-page",
   templateUrl: "./todos-page.component.html",
   styleUrls: [
      "./todos-page.component.scss"
   ]
})
export class TodosPageComponent{
	@ViewChild(NewTodoModalComponent)
	private newTodoModalComponent: NewTodoModalComponent;

	constructor(public dataService: DataService){}

	ShowNewTodoModal(){
		this.newTodoModalComponent.Show();
	}

	CreateTodo(todo){
		this.dataService.AddTodo(todo);
	}

	async DeleteTodo(todo: Todo){
		this.dataService.RemoveTodo(todo);
	}

	SortByGroupOrDate(){
		this.dataService.sortTodosByDate = !this.dataService.sortTodosByDate;
		this.dataService.LoadAllTodos();
	}
}