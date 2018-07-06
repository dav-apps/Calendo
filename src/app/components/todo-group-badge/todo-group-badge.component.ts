import { Component, Input, Output, EventEmitter } from '@angular/core';
declare var $: any;

@Component({
   selector: "calendo-todo-group-badge",
   templateUrl: "./todo-group-badge.component.html",
   styleUrls: [
      "./todo-group-badge.component.scss"
   ]
})
export class TodoGroupBadgeComponent{
   @Input() groupName: string = "";
   @Input() canRemove: boolean = false;
   @Output() remove = new EventEmitter();

   constructor(){}

   ngOnInit(){
      this.ColorizeBadge();
   }

   ColorizeBadge(){
      
   }

   Remove(){
      if(this.canRemove){
         this.remove.emit(this.groupName);
      }
   }
}