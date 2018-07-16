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
      [{}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}]
   ];
   currentMonth: number = 1;
   currentYear: number = 2018;
   firstWeekDayOfMonth = 0;

   constructor(){}

   ngOnInit(){
      this.setSize();
      this.initialize();
   }

   initialize(){
      var date = new Date();
      this.currentMonth = date.getMonth();
      this.currentYear = date.getFullYear();

      this.createDays();
   }

   createDays(){
      // Get the first day of the month
      var date = new Date();
      date.setMonth(this.currentMonth);
      date.setFullYear(this.currentYear);

      var firstOfMonth = moment.unix(date.getTime() / 1000).startOf('month');
      var currentDay = $.extend(true, {}, firstOfMonth);
      this.firstWeekDayOfMonth = firstOfMonth.day();

      if(this.firstWeekDayOfMonth == 0){
         this.firstWeekDayOfMonth = 6;
      }else{
         this.firstWeekDayOfMonth = this.firstWeekDayOfMonth - 1;
      }

      for (let i = 0; i < firstOfMonth.daysInMonth(); i++) {
         this.addDateToCalendarDaysArray(i, currentDay);
         currentDay.add(1, 'days');
      }
   }

   addDateToCalendarDaysArray(index: number, date: moment.Moment){
      var obj = {
         day: date.format("D")
      }

      index = index + this.firstWeekDayOfMonth;
      var rowIndex = Math.floor(index / 7);
      var columnIndex = index % 7;

      if(this.calendarDays[rowIndex]){
         this.calendarDays[rowIndex][columnIndex] = obj;
      }
   }

   getMonthName(index: number): string{
      return moment.months(index);
   }

   onResize(event: any){
      this.setSize();
   }

   setSize(){
      this.calendarHeight = window.innerHeight
                           - $("#calendo-navbar").height()
                           - $("#calendar-top-bar").height()
                           - $("#calendar-label-div").height()
                           - 75;

      this.calendarDayHeight = this.calendarHeight / 5;
      this.calendarDayWidth = window.innerWidth / 7;
   }
}