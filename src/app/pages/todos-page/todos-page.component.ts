import { Component, ViewChild } from '@angular/core';
import { Todo } from '../../models/Todo';
import { DataService } from '../../services/data-service';
import { NewTodoModalComponent } from '../../components/new-todo-modal/new-todo-modal.component';
import { TodoListModalComponent } from '../../components/todo-list-modal/todo-list-modal.component';
import { enUS } from '../../../locales/locales';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { TodoList } from 'src/app/models/TodoList';

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
   @ViewChild(TodoListModalComponent)
   private todoListModalComponent: TodoListModalComponent;

	constructor(public dataService: DataService){
		this.locale = this.dataService.GetLocale().todosPage;
		this.dataService.HideWindowsBackButton();
   }
   
   SortByGroupOrDate(){
		this.dataService.sortTodosByDate = !this.dataService.sortTodosByDate;
		this.dataService.LoadAllTodos();
	}

	ShowNewTodoModal(){
		this.newTodoModalComponent.Show();
   }

	CreateTodo(todo: Todo){
		this.dataService.AddTodo(todo);
	}

	DeleteTodo(todo: Todo){
		this.dataService.RemoveTodo(todo);
   }
   
   ShowNewTodoListModal(){
      this.todoListModalComponent.Show();
   }

   CreateTodoList(todoList: TodoList){
      this.dataService.AddTodoList(todoList);
   }
}