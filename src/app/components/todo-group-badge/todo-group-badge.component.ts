import { Component, Input } from '@angular/core';
declare var $: any;

@Component({
   selector: "calendo-todo-group-badge",
   templateUrl: "./todo-group-badge.component.html"
})
export class TodoGroupBadgeComponent{
   @Input() groupName: string = "";

   constructor(){}

   ngOnInit(){
      this.ColorizeBadge();
   }

   ColorizeBadge(){
      
   }
}