import { Component, ViewChild, ElementRef } from '@angular/core';
import * as moment from 'moment';
declare var $: any;
import { DataService } from '../../services/data-service';
import { Appointment } from '../../models/Appointment';
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
   calendarWidth: number = 200;
   calendarDayHeight: number = this.calendarHeight / 5;
   calendarDayWidth: number = window.innerWidth / 7;
   defaultCalendarDay = {
      date: moment(),
      day: moment().format("D"),
      today: false,
      appointments: new Array<Appointment>(),
      todos: new Array<Todo>()
   }
   calendarDays = [
      [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay],
      [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay],
      [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay],    // Buffer for Scrolling
      [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay],    // 1. Row
      [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay],    // 2. Row
      [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay],    // 3. Row
      [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay],    // 4. Row
      [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay],    // 5. Row
      [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay],    // Buffer for Scrolling
      [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay],
      [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay]
   ];
   bufferCount: number = 3;         // The number of buffer weeks at the beginning and at the end of the calendarDays array
   visibleWeeksCount: number = this.calendarDays.length - (2 * this.bufferCount);   // The number of weeks that are visible
   currentYear: number = 2018;
   currentMonth: number = 1;
   topWeek: number = 1;
   firstWeekDayOfMonth = 0;
   @ViewChild("calendarContainer", { read: ElementRef }) calendarContainer: ElementRef<any>;
   isInitializing: boolean = true;
   position: number = 1;

   constructor(public dataService: DataService){}

   async ngOnInit(){
      await this.initialize();
      this.setSize();
      this.calendarContainer.nativeElement.scrollTop = 2 * this.calendarDayHeight;

      $("#calendarContainer").scroll(() => {
         if(!this.isInitializing){
            let bottomScrollAreaHeight = (this.calendarDays.length - (this.bufferCount + this.visibleWeeksCount)) * this.calendarDayHeight;
            if(this.calendarContainer.nativeElement.scrollTop < 2 * this.calendarDayHeight){
               // Create a new row of days at the top of the array
               this.addWeekTop();
            }else if(this.calendarContainer.nativeElement.scrollTop > bottomScrollAreaHeight){
               // Create a new row of days at the end of the array
               this.addWeekBottom();
            }else{
               this.position = Math.floor(this.calendarContainer.nativeElement.scrollTop / this.calendarDayHeight);
               var currentWeek = moment().week(this.topWeek + this.position + 1).weekday(0)
               this.currentMonth = currentWeek.month();
               this.currentYear = currentWeek.year();
            }
         }else{
            this.isInitializing = false;
         }
      });
   }

   async initialize(){
      var date = moment();
      this.currentYear = date.year();
      this.currentMonth = date.month();
      this.topWeek = moment().week() - 2;

      await this.dataService.LoadAllTodos();
      await this.dataService.LoadAllAppointments();

      this.showCurrentWeek();
   }

   showCurrentWeek(){
      // Get the first day of the current week
      var date = moment().year(this.currentYear).week(this.topWeek).weekday(1);

      // Fill the days array with values
      for(let i = 0; i < this.calendarDays.length; i++){
         // Go through each row
         for(let j = 0; j < 7; j++){
            // Go through each cell of the row
            var today: boolean = this.isToday(date);

            this.calendarDays[i][j] = {
               date: moment.unix(date.unix()),
               day: date.format("D"),
               today,
               appointments: this.dataService.GetAppointmentsOfDay(date),
               todos: this.dataService.GetTodosOfDay(date, false)
            }
            
            date.add('days', 1);
         }
      }
   }

   addWeekTop(){
      var newWeek = [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay];
      this.topWeek--;
      var date = moment().week(this.topWeek).weekday(1);

      for(let i = 0; i < 7; i++){
         newWeek[i] = {
            date: moment.unix(date.unix()),
            day: date.format("D"),
            today: false,
            appointments: this.dataService.GetAppointmentsOfDay(date),
            todos: this.dataService.GetTodosOfDay(date, false)
         }

         date.add('days', 1);
      }

      this.calendarDays.unshift(newWeek);
   }

   addWeekBottom(){
      var newWeek = [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay];
      var date = moment().week(this.topWeek + this.calendarDays.length).weekday(1);

      // Check if the week is already in the array
      if(this.calendarDays[this.calendarDays.length - 1][0]["date"].format("D") == date.format("D")){
         return;
      }

      for(let i = 0; i < 7; i++){
         newWeek[i] = {
            date: moment.unix(date.unix()),
            day: date.format("D"),
            today: false,
            appointments: this.dataService.GetAppointmentsOfDay(date),
            todos: this.dataService.GetTodosOfDay(date, false)
         }

         date.add('days', 1);
      }

      this.calendarDays.push(newWeek);
   }

   isToday(date: moment.Moment): boolean{
      return date.startOf('day').unix() == moment().startOf('day').unix();
   }

   getMonthName(index: number): string{
      return moment.months(index);
   }

   getDayBackgroundColor(dayRow, dayColumn){
      var date = this.calendarDays[dayRow][dayColumn]["date"];

      if(this.isToday(date)){
         return "#dddddd";
      }else if(date.month() % 2 == 0){
         return "#f9f9f9"
      }else{
         return "#ffffff"
      }
   }

   onResize(event: any){
      this.setSize();
   }

   setSize(){
      this.calendarWidth = window.innerWidth;
      this.calendarHeight = window.innerHeight
                           - $("#calendo-navbar").height()
                           - $("#calendar-top-bar").height()
                           - $("#calendar-label-div").height()
                           - 52;

      this.calendarDayHeight = this.calendarHeight / 5;
      this.calendarDayWidth = this.calendarWidth / 7;
   }
}