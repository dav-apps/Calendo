import { Component, HostListener } from '@angular/core';
import * as moment from 'moment';
declare var $: any;
import { Appointment } from '../../models/Appointment';
import { AppointmentItemComponent } from '../../components/appointment-item/appointment-item.component';
import { Todo } from '../../models/Todo';

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
   currentYear: number = 2018;
   currentMonth: number = 1;
   currentWeek: number = 1;
   firstWeekDayOfMonth = 0;

   constructor(){}

   ngOnInit(){
      this.setSize();
      this.initialize();

      $(document).keydown((e) => {
         if(e.keyCode === 38){
            // Arrow up
            this.scroll(true);
         }else if(e.keyCode === 40){
            // Arrow down
            this.scroll(false);
         }
      });

      $(document).bind('mousewheel', (e) => {
         if(e.originalEvent.wheelDelta > 0){
            // Wheel up
            this.scroll(true);
         }else{
            // Wheel down
            this.scroll(false);
         }
      });
   }

   initialize(){
      var date = moment();
      this.currentYear = date.year();
      this.currentMonth = date.month();
      this.currentWeek = moment().week();

      this.showWeek();
   }

   showWeek(){
      // Get the first day of the current week
      var date = moment().year(this.currentYear).week(this.currentWeek).weekday(1);

      // Fill the days array with values
      for(let i = 0; i < 5; i++){
         // Go through each row
         for(let j = 0; j < 7; j++){
            // Go through each cell of the row
            var today: boolean = this.isToday(date);

            this.calendarDays[i][j] = {
               date: moment.unix(date.unix()),
               day: date.format("D"),
               today,
               appointments: [],
               todos: []
            }
            
            date.add('days', 1);
         }
      }
   }

   scroll(up: boolean){
      if(up){
         this.currentWeek--;
      }else{
         this.currentWeek++;
      }
      
      var date = moment().week(this.currentWeek);
      this.currentMonth = date.weekday(7).month();
      this.currentYear = date.year();

      this.showWeek();
   }

   isToday(date: moment.Moment): boolean{
      return date.startOf('day').unix() == moment().startOf('day').unix();
   }

   getMonthName(index: number): string{
      return moment.months(index);
   }

   getDayBackgroundColor(dayRow, dayColumn){
      var date = this.calendarDays[dayRow][dayColumn]["date"]

      if(date.month() % 2 == 0){
         return "#f9f9f9"
      }else{
         return "#ffffff"
      }
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