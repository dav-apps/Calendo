import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { DataService } from '../../services/data-service';
import { enUS } from '../../../locales/locales';
import { TodoList } from 'src/app/models/TodoList';

@Component({
	selector: "calendo-todo-list-view-modal",
	templateUrl: "./todo-list-view-modal.component.html"
})
export class TodoListViewModalComponent{
	locale = enUS.todoListViewModal;
	@Input()
	todoList: TodoList;
	@ViewChild('todoListViewModal') todoListViewModal: ElementRef;
	date: string = "";

	constructor(
		private modalService: NgbModal,
		private dataService: DataService
	){
		this.locale = this.dataService.GetLocale().todoListViewModal;
	}

	Show(){
		this.date = moment.unix(this.todoList.time).format(this.locale.formats.date);

		this.modalService.open(this.todoListViewModal).result.then(() => {
			
		}, () => {});
   }

	EditButtonClicked(){
		
   }
   
   DeleteButtonClicked(){

   }
}