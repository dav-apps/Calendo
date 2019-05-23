import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../services/data-service';
import { enUS } from '../../../locales/locales';
import { TodoList } from '../../models/TodoList';

@Component({
	selector: "calendo-todo-list-modal",
	templateUrl: "./todo-list-modal.component.html"
})
export class TodoListModalComponent{
	locale = enUS.todoListModal;
	@Output() save = new EventEmitter<TodoList>();
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
			// Calculate the unix timestamp
			let todoListTimeUnix = 0;
			if(this.setDateCheckboxChecked){
				let todoListTime = new Date(this.todoListDate.year, this.todoListDate.month - 1, this.todoListDate.day, 0, 0, 0, 0);
				todoListTimeUnix = Math.floor(todoListTime.getTime() / 1000);
			}

			// Create the todo list
			let todoList = await TodoList.Create(this.todoListName, todoListTimeUnix, [], this.todoGroups);
			this.save.emit(todoList);
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