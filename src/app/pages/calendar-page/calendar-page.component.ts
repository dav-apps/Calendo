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
	@ViewChild("calendarContainer", { read: ElementRef }) calendarContainer: ElementRef<any>;
	@ViewChild("mobileCalendarContainer", {read: ElementRef}) mobileCalendarContainer: ElementRef<any>;
	currentYear: number = 2018;
	currentMonth: number = 1;
	showMobileLayout: boolean = true;
	isInitializing: boolean = true;
	weekDayLabels: string[] = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
	dayFormat: string = "D";
	fullDayFormat: string = "dddd D";
	
	//#region Desktop Design
   calendarHeight: number = 500;
   calendarWidth: number = 200;
   calendarDayHeight: number = this.showMobileLayout ? this.calendarHeight / 7 :  this.calendarHeight / 5;
   calendarDayWidth: number = window.innerWidth / 7;
   defaultCalendarDay = {
      date: moment(),
		day: moment().format(this.dayFormat),
		fullDay: moment().format(this.fullDayFormat),
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
   weekBufferCount: number = 3;         // The number of buffer weeks at the beginning and at the end of the calendarDays array
   visibleWeeksCount: number = this.calendarDays.length - (2 * this.weekBufferCount);   // The number of weeks that are visible
   topWeek: number = 1;
	position: number = 1;
	//#endregion

	//#region Mobile Design
	currentWeekDays: string[] = ["1", "2", "3", "4", "5", "6", "7"];
	currentDayOfWeek: number = 0;		// Number of the week day between 0 and 6
	currentDayOfYear: number = 0;
	currentDayBackgroundColor: string = "#e3e4e5";
	topDay: moment.Moment = moment();
	dayBufferCount: number = 5;
	visibleDaysCount: number = 5;
	//#endregion

   constructor(public dataService: DataService){}

   async ngOnInit(){
		await this.initialize();
		this.setSize();
		
		setTimeout(() => {
			this.calendarContainer.nativeElement.scrollTop = this.calendarDayHeight * 3;
			this.mobileCalendarContainer.nativeElement.scrollTop = (this.calendarDayHeight * this.weekBufferCount * 7) + (this.calendarDayHeight * this.currentDayOfWeek);
		}, 1);

      $("#calendarContainer").scroll(() => {
         if(!this.isInitializing){
				let bottomScrollAreaHeight = (this.calendarDays.length - (this.weekBufferCount + this.visibleWeeksCount)) * this.calendarDayHeight;

				if(this.calendarContainer.nativeElement.scrollTop < 2 * this.calendarDayHeight){
					// Create a new row of days at the top of the array
					this.addWeekTop();
				}else if(this.calendarContainer.nativeElement.scrollTop > bottomScrollAreaHeight){
					// Create a new row of days at the end of the array
					this.addWeekBottom();
				}else{
					this.position = Math.floor(this.calendarContainer.nativeElement.scrollTop / this.calendarDayHeight);
					let currentWeek = moment().week(this.topWeek + this.position + 1).weekday(0)
					this.currentMonth = currentWeek.month();
					this.currentYear = currentWeek.year();
				}
         }else{
            this.isInitializing = false;
         }
		});

		$("#mobileCalendarContainer").scroll(() => {
			if(!this.isInitializing){
				let daysCount = this.calendarDays.length * this.calendarDays[0].length;
				let bottomScrollAreaHeight = (daysCount - this.dayBufferCount - this.visibleDaysCount) * this.calendarDayHeight;

				if(this.mobileCalendarContainer.nativeElement.scrollTop < this.dayBufferCount * this.calendarDayHeight){
					console.log("Add top")
				}else if(this.mobileCalendarContainer.nativeElement.scrollTop > bottomScrollAreaHeight){
					console.log("Add bottom")
				}else{
					this.position = Math.floor(this.mobileCalendarContainer.nativeElement.scrollTop / this.calendarDayHeight);
					let currentDay = moment().year(this.topDay.year()).dayOfYear(this.topDay.dayOfYear());
					currentDay.add(this.position, 'days');

					this.currentMonth = currentDay.month();
					this.currentYear = currentDay.year();
					this.currentDayOfWeek = currentDay.isoWeekday() - 1;
					this.currentDayOfYear = currentDay.dayOfYear();

					this.updateCurrentWeekDays();
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
		this.currentDayOfWeek = date.day() - 1;
		this.currentDayOfYear = date.dayOfYear();
		this.topWeek = moment().subtract(3, 'weeks').week();
		this.topDay = moment().subtract(3, 'weeks').day(1);

      await this.dataService.LoadAllTodos();
      await this.dataService.LoadAllAppointments();

		this.showCurrentWeek();
		this.updateCurrentWeekDays();
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
					day: date.format(this.dayFormat),
					fullDay: date.format(this.fullDayFormat),
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
				day: date.format(this.dayFormat),
				fullDay: date.format(this.fullDayFormat),
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
				day: date.format(this.dayFormat),
				fullDay: date.format(this.fullDayFormat),
            today: false,
            appointments: this.dataService.GetAppointmentsOfDay(date),
            todos: this.dataService.GetTodosOfDay(date, false)
         }

         date.add('days', 1);
      }

      this.calendarDays.push(newWeek);
	}

	addDayTop(){

	}

	addDayBottom(){

	}
	
	updateCurrentWeekDays(){
		var date = moment().year(this.currentYear).dayOfYear(this.currentDayOfYear);
		date.isoWeekday(1);

		for(let i = 0; i < 7; i++){
			this.currentWeekDays[i] = date.format("D");
			date.add('day', 1);
		}
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
		this.showMobileLayout = window.innerWidth < 500;

		this.calendarContainer.nativeElement.hidden = this.showMobileLayout;
		this.mobileCalendarContainer.nativeElement.hidden = !this.showMobileLayout;

		this.calendarWidth = window.innerWidth;
		this.calendarHeight = window.innerHeight
									- $("#calendo-navbar").height()
									- $("#calendar-top-bar").height()
									- $("#calendar-label-div").height();

		this.calendarHeight -= this.showMobileLayout ? 81 : 52 ;

		this.calendarDayHeight = this.calendarHeight / 5;
		this.calendarDayWidth = this.calendarWidth / 7;
   }
}