import { Component } from '@angular/core';
declare var $: any;

@Component({
   selector: "calendo-start-page",
   templateUrl: "./start-page.component.html",
   styleUrls: [
      "./start-page.component.scss"
   ]
})
export class StartPageComponent{

   constructor(){
		
   }

   ngOnInit(){
      $('.todo-checkbox').iCheck({
         checkboxClass: 'icheckbox_square-blue',
         radioClass: 'iradio_square',
         increaseArea: '10%'
      });
   }
}