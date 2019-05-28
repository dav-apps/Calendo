import { Component, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../services/data-service';
import { enUS } from '../../../locales/locales';
import { TodoList } from 'src/app/models/TodoList';

@Component({
	selector: "calendo-delete-todo-list-modal",
	templateUrl: "./delete-todo-list-modal.component.html"
})
export class DeleteTodoListModalComponent{
	locale = enUS.deleteTodoListModal;
	@Input() todoList: TodoList;
	@Output() remove = new EventEmitter();
	@ViewChild('deleteTodoListModal') todoListModal: ElementRef;

	constructor(
		private modalService: NgbModal,
		private dataService: DataService
	){
		this.locale = this.dataService.GetLocale().deleteTodoListModal;
   }
   
   Show(){
      this.modalService.open(this.todoListModal).result.then(async () => {
			await this.todoList.Delete();
			this.remove.emit(null);
      }, () => {});
   }
}