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
	setDateCheckboxChecked: boolean = true;
	todoListDate: NgbDateStruct;
   todoListName: string = "";
   todoGroups: string[] = []

	constructor(
		private modalService: NgbModal,
		private dataService: DataService
	){
      this.locale = this.dataService.GetLocale().todoListModal;
   }

	Show(date?: number){
		this.Reset(date);

		this.modalService.open(this.todoListModal).result.then(async () => {
			
		}, () => {});
	}
	
	Reset(date?: number){
		let d = new Date();
      if(date){
         d = new Date(date * 1000);
		}
		
		this.todoListDate = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
		this.todoListName = "";
		this.setDateCheckboxChecked = true;
	}
   
   ToggleSetDateCheckbox(){
      this.setDateCheckboxChecked = !this.setDateCheckboxChecked;
   }
}