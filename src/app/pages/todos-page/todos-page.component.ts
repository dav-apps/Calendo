import { Component, ViewChild } from '@angular/core';
import { Todo } from '../../models/Todo';
import { DataService } from '../../services/data-service';
import { NewTodoModalComponent } from '../../components/new-todo-modal/new-todo-modal.component';
import { enUS } from '../../../locales/locales';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';

@Component({
   selector: "calendo-todos-page",
   templateUrl: "./todos-page.component.html",
   styleUrls: [
      "./todos-page.component.scss"
   ]
})
export class TodosPageComponent{
	locale = enUS.todosPage;
	faEllipsisH = faEllipsisH;
	@ViewChild(NewTodoModalComponent)
	private newTodoModalComponent: NewTodoModalComponent;

	constructor(public dataService: DataService){
		this.locale = this.dataService.GetLocale().todosPage;
		this.dataService.HideWindowsBackButton();
	}

	ShowNewTodoModal(){
		this.newTodoModalComponent.Show();
	}

	CreateTodo(todo){
		this.dataService.AddTodo(todo);
	}

	DeleteTodo(todo: Todo){
		this.dataService.RemoveTodo(todo);
	}

	SortByGroupOrDate(){
		this.dataService.sortTodosByDate = !this.dataService.sortTodosByDate;
		this.dataService.LoadAllTodos();
	}
}