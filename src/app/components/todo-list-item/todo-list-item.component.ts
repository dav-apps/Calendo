import { Component, Input } from '@angular/core';
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

	}
}