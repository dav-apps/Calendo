import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { TodoList, GetTodoList } from 'src/app/models/TodoList';
import { enUS } from '../../../locales/locales';
import { DataService } from '../../services/data-service';
import * as moment from 'moment';
import { TodoListTreeComponent } from '../../components/todo-list-tree/todo-list-tree.component';
import { TodoListModalComponent } from 'src/app/components/todo-list-modal/todo-list-modal.component';
import { DeleteTodoListModalComponent } from 'src/app/components/delete-todo-list-modal/delete-todo-list-modal.component';

@Component({
	selector: 'calendo-todo-list-details-page',
	templateUrl: './todo-list-details-page.component.html'
})
export class TodoListDetailsPageComponent{
   locale = enUS.todoListDetailsPage;
	@ViewChild('todoListTree') todoListTree: TodoListTreeComponent;
	@ViewChild('todoListModal') todoListModal: TodoListModalComponent;
	@ViewChild('deleteTodoListModal') deleteTodoListModal: DeleteTodoListModalComponent;
	todoList: TodoList = new TodoList(null, "");
	date: string = "";

	constructor(
		private dataService: DataService,
      private route: ActivatedRoute,
      private location: Location
	){
      moment.locale(this.dataService.locale);
		this.locale = this.dataService.GetLocale().todoListDetailsPage;
	}

	ngOnInit(){
      this.route.params.subscribe(async param => {
			let list = await GetTodoList(param.uuid);
			this.todoList.uuid = list.uuid;
			this.todoList.name = list.name;
			this.todoList.time = list.time;
			this.todoList.groups = list.groups;
         this.todoList.list = list.list;
         this.todoList.todos = list.todos;
         this.todoList.todoLists = list.todoLists;
         this.date = moment.unix(this.todoList.time).format(this.locale.formats.date);
         
         this.todoListTree.ngOnInit();
      });
	}
	
	async Update(updatedTodoList?: TodoList){
		if(updatedTodoList){
			this.dataService.UpdateTodoList(updatedTodoList);

			// Update the local properties
			this.todoList.name = updatedTodoList.name;
			this.todoList.time = updatedTodoList.time;
			this.todoList.groups = updatedTodoList.groups;

			this.date = moment.unix(this.todoList.time).format(this.locale.formats.date);
		}else{
			this.dataService.UpdateTodoList(await GetTodoList(this.todoList.uuid));
		}
	}

	GoBack(){
      this.location.back();
	}

	ShowEditModal(){
		this.todoListModal.Show(this.todoList);
	}

	ShowDeleteModal(){
		this.deleteTodoListModal.Show();
   }
   
   Remove(){
      this.dataService.RemoveTodoList(this.todoList);
      this.location.back();
   }
}