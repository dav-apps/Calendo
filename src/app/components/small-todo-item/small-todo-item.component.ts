import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Todo } from '../../models/Todo';
declare var $: any;

@Component({
   selector: "calendo-small-todo-item",
   templateUrl: "./small-todo-item.component.html",
   styleUrls: [
      "./small-todo-item.component.scss"
   ]
})
export class SmallTodoItemComponent{
   @Input() todo: Todo = new Todo("", false, 0, "", []);
   @Input() showBadge: boolean = true;
   @Output() delete = new EventEmitter();

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

   Delete(){
      this.todo.Delete();
      this.delete.emit();
   }
}