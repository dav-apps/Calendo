import { Component, Input } from '@angular/core';
import { Todo } from '../../models/Todo';
declare var $: any;

@Component({
   selector: "calendo-todo-item",
   templateUrl: "./todo-item.component.html",
   styleUrls: [
      "./todo-item.component.scss"
   ]
})
export class TodoItemComponent{
   @Input() todo: Todo = new Todo("", false, 0, "");

   constructor(){}

   ngOnInit(){
      setTimeout(() => {
         var todoItemClass = '.todo-item-' + this.todo.uuid;

         $(todoItemClass).iCheck({
            checkboxClass: 'icheckbox_square-blue',
            radioClass: 'iradio_square'
         });
         
         if(this.todo.completed){
            $(todoItemClass).iCheck('check');
         }

         $(todoItemClass).on('ifChecked', (event) => {
            this.todo.SetCompleted(true);
            $(todoItemClass).iCheck('check');
         });
         $(todoItemClass).on('ifUnchecked', (event) => {
            this.todo.SetCompleted(false);
            $(todoItemClass).iCheck('uncheck');
         });
      }, 10);
   }
}