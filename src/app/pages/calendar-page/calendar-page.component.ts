import { Component } from '@angular/core';
import * as moment from 'moment';
declare var $: any;

@Component({
   selector: "calendo-calendar-page",
   templateUrl: "./calendar-page.component.html",
   styleUrls: [
      "./calendar-page.component.scss"
   ]
})
export class CalendarPageComponent{
   calendarHeight: number = 500;
   calendarDayHeight: number = this.calendarHeight / 5;
   calendarDayWidth: number = window.innerWidth / 7;
   calendarDays = [
      new Array(7),
      new Array(7),
      new Array(7),
      new Array(7),
      new Array(7)
   ];
   currentMonth: number = 1;
   currentYear: number = 2018;

   constructor(){}

   ngOnInit(){
      this.setSize();
      this.createDays();
   }

   createDays(){
      // Get the first day of the month
      var date = new Date(moment().unix() * 1000);
      this.currentMonth = date.getMonth() + 1;
      this.currentYear = date.getFullYear();
   }

   onResize(event: any){
      this.setSize();
   }

   setSize(){
      this.calendarHeight = window.innerHeight
                           - $("#calendo-navbar").height()
                           - $("#calendar-top-bar").height()
                           - $("#calendar-label-div").height()
                           - 42;

      this.calendarDayHeight = this.calendarHeight / 5;
      this.calendarDayWidth = window.innerWidth / 7;
   }
}