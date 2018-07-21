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
	weekDayLabels: string[] = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
	dayFormat: string = "D";
	fullDayFormat: string = "dddd D";

	showMobileLayout: boolean = true;
	isInitializing: boolean = true;
	defaultCalendarDay = {
      date: moment(),
		day: moment().format(this.dayFormat),
		fullDay: moment().format(this.fullDayFormat),
      today: false,
      appointments: new Array<Appointment>(),
      todos: new Array<Todo>()
   };
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
	calendarHeight: number = 500;
	calendarWidth: number = 200;
	calendarDayHeight: number = this.showMobileLayout ? this.calendarHeight / 7 :  this.calendarHeight / 5;
   calendarDayWidth: number = window.innerWidth / 7;
	topDay: moment.Moment = moment();
	currentDay: moment.Moment = moment();
	currentDayOfWeek: number = 0;
	position: number = 1;
	weekBufferCount: number = 3;		// The number of buffer weeks at the beginning and at the end of the calendarDays array
   visibleRowsCount: number = 5;		// The number of weeks that are visible
	currentWeekDays: string[] = ["1", "2", "3", "4", "5", "6", "7"];

	constructor(public dataService: DataService){}

   async ngOnInit(){
		await this.initialize();

		$("#calendarContainer").scroll(() => this.onScroll());
		$("#mobileCalendarContainer").scroll(() => this.onScroll());
   }

   async initialize(){
		await this.dataService.LoadAllTodos();
      await this.dataService.LoadAllAppointments();

		this.currentDay = moment();
		this.topDay = moment().subtract(this.weekBufferCount, 'weeks').isoWeekday(1);

		this.fillDaysArray();
		this.setSize();
		this.scrollToDate(this.currentDay);
	}
	
	onScroll(){
		if(this.isInitializing){
			this.isInitializing = false;
		}else{
			var container = this.showMobileLayout ? this.mobileCalendarContainer : this.calendarContainer;
			var buffer = this.showMobileLayout ? this.visibleRowsCount : 3;
			var bufferHeight = this.calendarDays.length - (buffer + 5);

			if(this.showMobileLayout){
				bufferHeight = (this.calendarDays.length * 7) - (2 * buffer);
			}

			if(container.nativeElement.scrollTop < buffer * this.calendarDayHeight){
				this.addWeekTop();
			}else if(container.nativeElement.scrollTop > bufferHeight * this.calendarDayHeight){
				this.addWeekBottom();
			}else{
				this.position = Math.floor(container.nativeElement.scrollTop / this.calendarDayHeight);
				
				this.currentDay = moment.unix(this.topDay.unix()).add(this.position, this.showMobileLayout ? 'days' : 'weeks');
				this.updateCurrentWeekDays();
			}
		}
	}

   fillDaysArray(){
      // Get the first day of the top week
		//var date = moment().year(this.currentYear).week(this.topWeek).weekday(1);
		var date = moment.unix(this.topDay.unix())

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
		
		this.updateCurrentWeekDays();
	}

	scrollToDate(date: moment.Moment){
		let dateStart: number = date.startOf('day').unix();
		let weeks = 0;
		let days = 0;
		let dayFound = false;

		for(let week of this.calendarDays){
			for(let day of week){
				if(day.date.startOf('day').unix() == dateStart){
					dayFound = true;
					break;
				}
				days++;
			}

			if(dayFound) break;
			weeks++;
		}

		if(this.showMobileLayout){
			this.mobileCalendarContainer.nativeElement.scrollTop = days * this.calendarDayHeight + 1;
		}else{
			this.calendarContainer.nativeElement.scrollTop = weeks * this.calendarDayHeight + 1;
		}

		this.updateCurrentWeekDays();
	}

	goToWeekday(index: number){
		this.scrollToDate(moment.unix(this.currentDay.unix()).startOf('isoWeek').add(index, 'days'));
	}

   addWeekTop(){
      var newWeek = [this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay, this.defaultCalendarDay];
      this.topDay.subtract(1, 'week');
      var date = moment.unix(this.topDay.unix()).weekday(1);

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
		var date = moment.unix(this.topDay.unix()).weekday(1).add(this.calendarDays.length, 'weeks');

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
	
	updateCurrentWeekDays(){
		var date = moment.unix(this.currentDay.unix());
		date.isoWeekday(1);

		for(let i = 0; i < 7; i++){
			this.currentWeekDays[i] = date.format("D");
			date.add('day', 1);
		}

		this.currentDayOfWeek = this.currentDay.isoWeekday() - 1;
	}

   isToday(date: moment.Moment): boolean{
      return date.startOf('day').unix() == moment().startOf('day').unix();
   }

   getMonthName(index: number): string{
      return moment.months(index);
	}

	getCurrentMonth(){
		return this.currentDay.format("MMMM")
	}
	
	getCurrentYear(): number{
		return this.currentDay.year();
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
		let oldShowMobileLayout = this.showMobileLayout;
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

		if(oldShowMobileLayout != this.showMobileLayout){
			// The layout changed
			this.goToWeekday(0);
		}
   }
}