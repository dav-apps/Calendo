import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;
import { Todo, CreateTodo } from '../../models/Todo';

@Component({
   selector: "calendo-new-todo-modal",
   templateUrl: "./new-todo-modal.component.html",
   styleUrls: [
      "./new-todo-modal.component.scss"
   ]
})
export class NewTodoModalComponent{
   @Output() save = new EventEmitter();
   @ViewChild('createTodoModal') todoModal: ElementRef;
   newTodoDate: NgbDateStruct;
   newTodoName: string;
   newTodoSetDateCheckboxChecked: boolean;

   constructor(private modalService: NgbModal){}

   ngOnInit(){}

   Show(){
      this.ResetNewObjects();

      this.modalService.open(this.todoModal).result.then(() => {
         // Save new todo
         var todoTimeUnix: number = 0;
         if(this.newTodoSetDateCheckboxChecked){
            var todoTime = new Date(this.newTodoDate.year, this.newTodoDate.month - 1, this.newTodoDate.day, 0, 0, 0, 0);
            todoTimeUnix = Math.floor(todoTime.getTime() / 1000);
         }

         var todo = new Todo("", false, todoTimeUnix, this.newTodoName);
         todo.uuid = CreateTodo(todo);

         this.save.emit(todo);
      }, () => {});

      $('#new-todo-set-date-checkbox').iCheck({
         checkboxClass: 'icheckbox_square-blue',
         radioClass: 'iradio_square'
      });

      $('#new-todo-set-date-checkbox').iCheck('check');
      $('#new-todo-set-date-checkbox').on('ifChecked', (event) => this.newTodoSetDateCheckboxChecked = true);
      $('#new-todo-set-date-checkbox').on('ifUnchecked', (event) => this.newTodoSetDateCheckboxChecked = false);
   }

   ResetNewObjects(){
      this.newTodoDate = {year: new Date().getFullYear(), month: new Date().getMonth() + 1, day: new Date().getDate()};
      this.newTodoName = "";
      this.newTodoSetDateCheckboxChecked = true;
   }
}