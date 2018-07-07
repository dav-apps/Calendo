import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;
import { Todo, CreateTodo, GetAllTodoGroups } from '../../models/Todo';

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
   newGroupName: string = "";
   todoGroups: string[] = [];
   allGroups: string[] = [];

   constructor(private modalService: NgbModal){}

   ngOnInit(){}

   Show(){
      this.ResetNewObjects();
      this.GetAllTodoGroups();

      this.modalService.open(this.todoModal).result.then(() => {
         // Save new todo
         var todoTimeUnix: number = 0;
         if(this.newTodoSetDateCheckboxChecked){
            var todoTime = new Date(this.newTodoDate.year, this.newTodoDate.month - 1, this.newTodoDate.day, 0, 0, 0, 0);
            todoTimeUnix = Math.floor(todoTime.getTime() / 1000);
         }

         var todo = new Todo("", false, todoTimeUnix, this.newTodoName, this.todoGroups);
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
      this.todoGroups = [];
      this.newGroupName = "";
      this.allGroups = [];
   }

   AddGroup(name: string){
      this.newGroupName = "";

      if(this.todoGroups.findIndex(g => g == name) == -1){
         this.todoGroups.push(name);
   
         // Remove the group from allGroups
         var index = this.allGroups.findIndex(g => g == name);
   
         if(index !== -1){
            this.allGroups.splice(index, 1);
         }
      }
   }

   async GetAllTodoGroups(){
      this.allGroups = [];
      var todoGroups = await GetAllTodoGroups();
      todoGroups.forEach(group => this.allGroups.push(group));
   }

   RemoveGroup(name: string){
      var index = this.todoGroups.findIndex(g => g == name);

      if(index !== -1){
         this.todoGroups.splice(index, 1);
         this.GetAllTodoGroups();
      }
   }
}