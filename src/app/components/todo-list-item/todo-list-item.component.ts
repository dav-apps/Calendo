import { Component, Input } from '@angular/core';
import { TodoList } from 'src/app/models/TodoList';

@Component({
   selector: 'calendo-todo-list-item',
   templateUrl: './todo-list-item.component.html'
})
export class TodoListItemComponent{
   @Input()
   todoList: TodoList = new TodoList(null, "");
}