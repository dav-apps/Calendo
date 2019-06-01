import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TodoList, GetTodoList } from 'src/app/models/TodoList';
import { enUS } from '../../../locales/locales';
import { DataService } from '../../services/data-service';
import * as moment from 'moment';
import { TodoListTreeComponent } from '../../components/todo-list-tree/todo-list-tree.component';

@Component({
	selector: 'calendo-todo-list-details-page',
	templateUrl: './todo-list-details-page.component.html'
})
export class TodoListDetailsPageComponent{
   locale = enUS.todoListViewModal;
   @ViewChild('todoListTree') todoListTree: TodoListTreeComponent;
	todoList: TodoList = new TodoList(null, "");
	date: string = "";

	constructor(
		private dataService: DataService,
		private route: ActivatedRoute
	){
      moment.locale(this.dataService.locale);
		this.locale = this.dataService.GetLocale().todoListViewModal;
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
	
	async Update(){
		this.dataService.UpdateTodoList(await GetTodoList(this.todoList.uuid));
	}

	GoBack(){

	}

	ShowEditModal(){
		
	}

	ShowDeleteModal(){
		
	}
}