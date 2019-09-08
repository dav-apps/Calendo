import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TodoList } from 'src/app/models/TodoList';
import { IIconProps } from 'office-ui-fabric-react';
import { DataService } from '../../services/data-service';

@Component({
   selector: 'calendo-todo-list-item',
	templateUrl: './todo-list-item.component.html'
})
export class TodoListItemComponent{
   @Input()
	todoList: TodoList = new TodoList();
	@Output()
	update = new EventEmitter();
   menuButtonIconProps: IIconProps = {
      iconName: "More",
      style: {
         fontSize: 16,
         color: this.dataService.darkTheme ? "white" : "black"
      }
   }

   constructor(
      public dataService: DataService,
      private router: Router
   ){}
   
   ShowDetails(){
      this.router.navigate(['todolist', this.todoList.uuid]);
	}
	
	async UpdateTodoList(){
		this.dataService.AddTodoListToUpdatedTodoLists(this.todoList.uuid);
		this.update.emit();
	}
}