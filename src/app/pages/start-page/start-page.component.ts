import { Component } from '@angular/core';
import * as moment from 'moment';
declare var $: any;
import fontawesome from '@fortawesome/fontawesome'
import solid from '@fortawesome/fontawesome-free-solid'

@Component({
   selector: "calendo-start-page",
   templateUrl: "./start-page.component.html",
   styleUrls: [
      "./start-page.component.scss"
   ]
})
export class StartPageComponent{
   appointments: string = "invisible";

   constructor(){
      fontawesome.library.add(solid);
   }

   ngOnInit(){
      setTimeout(() => {
         $('.todo-checkbox').iCheck({
            checkboxClass: 'icheckbox_square-blue',
            radioClass: 'iradio_square',
            increaseArea: '10%'
         });
      }, 10);
   }

   GetWeekDay(index: number): string{
      moment.locale('en');
      return moment().add(index, 'days').format('dddd');
   }

   GetDate(index: number): string{
      moment.locale('en');
      return moment().add(index, 'days').format('D. MMMM YYYY');
   }

   ShowOrHideAppointmentsOfDay(day: number){
      var elementId = "#appointments-day-" + day;
      if($(elementId).is(":visible")){
         $(elementId).hide();
      }else{
         $(elementId).show();
      }
   }

   ShowOrHideTodosOfDay(day: number){
      var elementId = "#todos-day-" + day;
      if($(elementId).is(":visible")){
         $(elementId).hide();
      }else{
         $(elementId).show();
      }
   }
}