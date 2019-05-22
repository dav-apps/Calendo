import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../services/data-service';
import { enUS } from '../../../locales/locales';

@Component({
	selector: "calendo-todo-list-modal",
	templateUrl: "./todo-list-modal.component.html"
})
export class TodoListModalComponent{
	locale = enUS.todoListModal;
	@Output() save = new EventEmitter();
	@ViewChild('todoListModal') todoListModal: ElementRef;
	saveDateCheckboxChecked: boolean = true;
	selectedDate: NgbDateStruct;
	todoListName: string = "";

	constructor(
		private modalService: NgbModal,
		private dataService: DataService
	){
      this.locale = this.dataService.GetLocale().todoListModal;
   }

	Show(){
		this.modalService.open(this.todoListModal).result.then(async () => {
			
		}, () => {});
	}
}