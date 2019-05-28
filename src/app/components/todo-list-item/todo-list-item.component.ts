import { Component, Input, ViewChild } from '@angular/core';
import { DeleteTodoListModalComponent } from '../delete-todo-list-modal/delete-todo-list-modal.component';
import { TodoList } from 'src/app/models/TodoList';
import { IIconProps } from 'office-ui-fabric-react';
import { DataService } from '../../services/data-service';
import { enUS } from '../../../locales/locales';

@Component({
   selector: 'calendo-todo-list-item',
	templateUrl: './todo-list-item.component.html'
})
export class TodoListItemComponent{
	locale = enUS.todoListItem;
   @Input()
   todoList: TodoList = new TodoList(null, "");
   @ViewChild(DeleteTodoListModalComponent)
   private deleteTodoListModalComponent: DeleteTodoListModalComponent;
   menuButtonIconProps: IIconProps = {
      iconName: "More",
      style: {
         fontSize: 16,
         color: this.dataService.darkTheme ? "white" : "black"
      }
   }

   constructor(
		public dataService: DataService
   ){
		this.locale = this.dataService.GetLocale().todoListItem;
	}

	Edit(){

	}

	Delete(){
		this.deleteTodoListModalComponent.Show();
   }
   
   Remove(){
      this.dataService.RemoveTodoList(this.todoList);
   }
}