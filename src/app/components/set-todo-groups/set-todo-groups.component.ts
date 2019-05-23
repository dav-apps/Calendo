import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from 'src/app/services/data-service';
import { GetAllTodoGroups } from '../../models/Todo';
import { enUS } from '../../../locales/locales';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
   selector: "calendo-set-todo-groups",
   templateUrl: "./set-todo-groups.component.html"
})
export class SetTodoGroupsComponent{
	faPlus = faPlus;
	locale = enUS.setTodoGroups;
   allGroups: string[] = [];
	@Input('groups')
   todoGroups: string[] = [];
   @Output()
   groupsChanged = new EventEmitter<string[]>();
	newGroupName: string = "";
	groupTextFieldStyle = {
		root: {
			width: 250,
		}
	}

	constructor(
		private dataService: DataService
	){
      this.locale = this.dataService.GetLocale().setTodoGroups;
		this.GetAllTodoGroups();
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

	AddGroup(name: string){
      this.newGroupName = "";

      if(this.todoGroups.findIndex(g => g == name) == -1){
         this.todoGroups.push(name);
   
         // Remove the group from allGroups
         var index = this.allGroups.findIndex(g => g == name);
   
         if(index !== -1){
            this.allGroups.splice(index, 1);
			}
			
			this.TriggerGroupsUpdate();
      }
	}
	
	RemoveGroup(name: string){
      var index = this.todoGroups.findIndex(g => g == name);

      if(index !== -1){
         this.todoGroups.splice(index, 1);
			this.GetAllTodoGroups();

			this.TriggerGroupsUpdate();
      }
	}
	
	TriggerGroupsUpdate(){
		this.groupsChanged.emit(this.todoGroups);
	}
}