import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Todo, GetAllTodoGroups } from '../../models/Todo';
import { enUS } from '../../../locales/locales';
import { DataService } from '../../services/data-service';
import { SubscribePushNotifications, CreateNotification } from 'dav-npm';
import * as moment from 'moment';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
   selector: "calendo-new-todo-modal",
   templateUrl: "./new-todo-modal.component.html"
})
export class NewTodoModalComponent{
   locale = enUS.newTodoModal;
   notificationLocale = enUS.notifications.todo;
   faPlus = faPlus;
   @Output() save = new EventEmitter();
   @ViewChild('createTodoModal') todoModal: ElementRef;
   newTodoDate: NgbDateStruct;
   newTodoName: string;
   newTodoSetDateCheckboxChecked: boolean = true
   newTodoReminderCheckboxChecked: boolean = false
   newGroupName: string = "";
   todoGroups: string[] = [];
   allGroups: string[] = [];
   todoReminderTime: {hour: number, minute: number};
	showReminderOption: boolean = true;
	groupTextFieldStyle = {
		root: {
			width: 250,
		}
	}
	nameTextFieldStyle = {
		root: {
			width: 280,
		}
	}

   constructor(private modalService: NgbModal,
               private dataService: DataService){
      this.locale = this.dataService.GetLocale().newTodoModal;
      this.notificationLocale = this.dataService.GetLocale().notifications.todo;
   }

   Show(date?: number){
      this.ResetNewObjects(date);
      this.GetAllTodoGroups();

      // Check if push is supported
		this.showReminderOption = ('serviceWorker' in navigator) 
                                 && ('PushManager' in window)
                                 && this.dataService.user.IsLoggedIn
                                 && Notification.permission != "denied";

      this.modalService.open(this.todoModal).result.then(async () => {
         // Save new todo
         var todoTimeUnix: number = 0;
         if(this.newTodoSetDateCheckboxChecked){
            var todoTime = new Date(this.newTodoDate.year, this.newTodoDate.month - 1, this.newTodoDate.day, 0, 0, 0, 0);
            todoTimeUnix = Math.floor(todoTime.getTime() / 1000);
			}
			
			let notificationUuid = null;

         if(this.newTodoReminderCheckboxChecked){
            // Ask the user for notification permission
            if(await this.dataService.GetNotificationPermission() && await SubscribePushNotifications()){
               // Create the notification
               let notificationTime = moment.unix(todoTimeUnix).startOf('day').unix() 
                           + this.todoReminderTime.hour * 60 * 60
                           + this.todoReminderTime.minute * 60;
               notificationUuid = await CreateNotification(notificationTime, 0, this.GenerateNotificationProperties(this.newTodoName));
            }
         }

         let todo = await Todo.Create(this.newTodoName, false, todoTimeUnix, this.todoGroups, null, notificationUuid);

         this.save.emit(todo);
      }, () => {});
   }

   ResetNewObjects(date?: number){
      let d = new Date();
      if(date){
         d = new Date(date * 1000);
      }

      this.newTodoDate = { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
      this.newTodoName = "";
      this.newTodoSetDateCheckboxChecked = true;
      this.todoGroups = [];
      this.newGroupName = "";
      this.allGroups = [];
      this.todoReminderTime = {hour: 10, minute: 0};
      this.newTodoReminderCheckboxChecked = false;
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
      todoGroups.forEach(group => {
         // Check if the group is already selected
         if(this.todoGroups.findIndex(g => g == group) == -1){
            this.allGroups.push(group);
         }
      });
   }

   RemoveGroup(name: string){
      var index = this.todoGroups.findIndex(g => g == name);

      if(index !== -1){
         this.todoGroups.splice(index, 1);
         this.GetAllTodoGroups();
      }
   }

   GenerateNotificationProperties(todoName: string) : {title: string, message: string}{
      return {
         title: this.notificationLocale.title,
         message: todoName
      }
   }
	
	ToggleSetDateCheckbox(){
		if(this.newTodoSetDateCheckboxChecked){
			this.newTodoSetDateCheckboxChecked = false;
         this.newTodoReminderCheckboxChecked = false;
		}else{
			this.newTodoSetDateCheckboxChecked = true;
		}
	}

	ToggleReminderCheckbox(){
		if(this.newTodoSetDateCheckboxChecked){
			this.newTodoReminderCheckboxChecked = !this.newTodoReminderCheckboxChecked;
		}
	}
}