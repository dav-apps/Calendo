import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../services/data-service';
import { enUS } from '../../../locales/locales';
import { TodoList, GetTodoList } from '../../models/TodoList';

@Component({
	selector: "calendo-todo-list-modal",
	templateUrl: "./todo-list-modal.component.html"
})
export class TodoListModalComponent{
   locale = enUS.todoListModal;
	@Output() save = new EventEmitter<TodoList>();
	@ViewChild('todoListModal', { static: true }) todoListModal: ElementRef;
	setDateCheckboxChecked: boolean = true;
	todoListDate: NgbDateStruct;
   todoListName: string = "";
	todoGroups: string[] = [];
	new: boolean = true;
	todoListUuid: string;
	modalVisible: boolean = false
	submitButtonDisabled: boolean = true

	constructor(
		private modalService: NgbModal,
		private dataService: DataService
	){
      this.locale = this.dataService.GetLocale().todoListModal;
   }

	Show(todoList?: TodoList, date?: number) {
		if(this.modalVisible) return
		this.modalVisible = true

      if(todoList){
			// Update todo list
			this.new = false;
			this.todoListUuid = todoList.uuid;

         let date = new Date();
         if(todoList.time != 0){
            date = new Date(todoList.time * 1000);
         }

         this.todoListDate = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
			}
			
			this.todoListDate.year = date.getFullYear();
			this.todoListDate.month = date.getMonth() + 1;
			this.todoListDate.day = date.getDate();

			this.todoListName = todoList.name
			
			this.todoGroups = [];
			todoList.groups.forEach(group => {
				this.todoGroups.push(group);
			});
			
			setTimeout(() => {
				this.setDateCheckboxChecked = todoList.time != 0;
			}, 1);
      }else{
         // New todo list
         this.Reset(date);
      }

		this.modalService.open(this.todoListModal).result.then(async () => {
			if (this.submitButtonDisabled) return

			// Calculate the unix timestamp
			let todoListTimeUnix = 0;
			if(this.setDateCheckboxChecked){
				let todoListTime = new Date(this.todoListDate.year, this.todoListDate.month - 1, this.todoListDate.day, 0, 0, 0, 0);
				todoListTimeUnix = Math.floor(todoListTime.getTime() / 1000);
			}

			if(this.new){
				// Create the todo list
				let todoList = await TodoList.Create(this.todoListName, todoListTimeUnix, [], this.todoGroups);
				this.save.emit(todoList);
			}else{
				let todoList = await GetTodoList(this.todoListUuid);
				await todoList.Update(this.todoListName, todoListTimeUnix, this.todoGroups);
				this.save.emit(todoList);
			}

			this.modalService.dismissAll()
			this.modalVisible = false
		}, () => {
			this.modalVisible = false
		})
		
		this.SetSubmitButtonDisabled()
	}
	
	Reset(date?: number){
		let d = new Date();
      if(date){
         d = new Date(date * 1000);
		}
		
		this.todoListDate = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
      this.todoListName = "";
      this.setDateCheckboxChecked = true;
		this.todoGroups = [];
		
		this.SetSubmitButtonDisabled()
	}
   
   ToggleSetDateCheckbox(){
      this.setDateCheckboxChecked = !this.setDateCheckboxChecked;
	}
	
	SetSubmitButtonDisabled() {
		this.submitButtonDisabled = this.todoListName.trim().length < 2
	}
}