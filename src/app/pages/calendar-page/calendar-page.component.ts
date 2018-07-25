import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
declare var $: any;
import { DataService } from '../../services/data-service';

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
	calendarHeight: number = 500;
	calendarWidth: number = 200;
	calendarDayHeight: number = this.showMobileLayout ? this.calendarHeight / 7 :  this.calendarHeight / 5;
   calendarDayWidth: number = window.innerWidth / 7;

	//#region Mobile
	topDay: moment.Moment = moment();
	currentDay: moment.Moment = moment();
	currentDayOfWeek: number = 0;
	position: number = 1;
	visibleRows: number = 5;		// The number of days that are visible
	dayBuffer: number = 14;			// The number of days before and after the current day at the beginning
	scrolled: boolean = false;
	currentWeekDays: string[] = ["1", "2", "3", "4", "5", "6", "7"];
	//#endregion

	//#region Desktop

	//#endregion

	constructor(private dataService: DataService,
					private router: Router){}

   async ngOnInit(){
		await this.initialize();

		$("#calendarContainer").scroll(() => this.onScroll());
		$("#mobileCalendarContainer").scroll(() => this.onScroll());
   }

   async initialize(){
		this.topDay = moment().subtract(this.dayBuffer, 'days');

		// Clear the arrays
		this.dataService.mobileCalendarDaysDates = [];
		this.dataService.mobileCalendarDaysAppointments = [];
		this.dataService.mobileCalendarDaysTodos = [];

		this.fillDaysMobile();
		this.fillDaysDesktop();
		
		setTimeout(() => {
			this.setSize();

			setTimeout(() => {
				this.scrollToDate(this.currentDay);

				setTimeout(() => {
					this.isInitializing = false;
				}, 500);
			}, 1);
		}, 1);

		if(this.showMobileLayout){
			setInterval(() => {
				if(this.scrolled){
					this.dataService.UpdateCalendarDays();
					this.scrolled = false;
				}
			}, 2000);
		}
	}
	
	onScroll(){
		if(!this.isInitializing){
			if(this.showMobileLayout){
				let bufferHeight = this.dayBuffer * this.calendarDayHeight;
				let calendarHeightWithoutBuffer = (this.dataService.mobileCalendarDaysDates.length * this.calendarDayHeight) - bufferHeight;

				if(this.mobileCalendarContainer.nativeElement.scrollTop < bufferHeight){
					this.addDayTop();
					this.scrolled = true;
				}else if(this.mobileCalendarContainer.nativeElement.scrollTop > calendarHeightWithoutBuffer){
					this.addDayBottom();
					this.scrolled = true;
				}else{
					this.position = Math.floor(this.mobileCalendarContainer.nativeElement.scrollTop / this.calendarDayHeight);
					this.currentDay = moment.unix(this.topDay.unix()).add(this.position, 'days');
					
					this.updateCurrentWeekDays();
				}
			}
		}
	}

   fillDaysMobile(){
      // Get the first day of the top week
		var date = moment.unix(this.topDay.unix()).startOf('day');

		// Fill the days array with values
      for(let i = 0; i < this.dayBuffer * 2; i++){
			this.dataService.mobileCalendarDaysDates.push(date.unix());
			this.dataService.mobileCalendarDaysAppointments.push([]);
			this.dataService.mobileCalendarDaysTodos.push([]);

			date.add(1, 'days');
		}
		
		this.updateCurrentWeekDays();
		this.dataService.UpdateCalendarDays();
	}

	fillDaysDesktop(){

	}

	scrollToDate(date: moment.Moment){
		let dateStart: number = date.startOf('day').unix();
		let days = 0;

		for(let day of this.dataService.mobileCalendarDaysDates){
			if(moment.unix(day).startOf('day').unix() == dateStart){
				break;
			}
			days++;
		}

		this.mobileCalendarContainer.nativeElement.scrollTop = days * this.calendarDayHeight + 1;
		this.updateCurrentWeekDays();
	}

   addDayTop(){
      this.topDay.subtract(1, 'day');

		this.dataService.mobileCalendarDaysDates.unshift(this.topDay.startOf('day').unix());
		this.dataService.mobileCalendarDaysAppointments.unshift([]);
		this.dataService.mobileCalendarDaysTodos.unshift([]);
   }

   addDayBottom(){
		let date = moment.unix(this.topDay.unix()).startOf('day').add(this.dataService.mobileCalendarDaysDates.length, 'days').startOf('day');

		this.dataService.mobileCalendarDaysDates.push(date.unix());
		this.dataService.mobileCalendarDaysAppointments.push([]);
		this.dataService.mobileCalendarDaysTodos.push([]);
	}
	
	updateCurrentWeekDays(){
		var date = moment.unix(this.currentDay.unix());
		date.isoWeekday(1);

		for(let i = 0; i < 7; i++){
			this.currentWeekDays[i] = date.format("D");
			date.add(1, 'day');
		}

		this.currentDayOfWeek = this.currentDay.isoWeekday() - 1;
	}

   setSize(){
		this.showMobileLayout = window.innerWidth < 650;

		this.calendarContainer.nativeElement.hidden = this.showMobileLayout;
		this.mobileCalendarContainer.nativeElement.hidden = !this.showMobileLayout;

		this.calendarWidth = window.innerWidth;
		this.calendarHeight = window.innerHeight
									- $("#calendo-navbar").height()
									- $("#calendar-top-bar").height()
									- $("#calendar-label-div").height();

		this.calendarHeight -= this.showMobileLayout ? 82 : 52 ;

		this.calendarDayHeight = this.calendarHeight / 5;
		this.calendarDayWidth = this.calendarWidth / 7;
	}
	
	onResize(event: any){
      this.setSize();
	}

	dayClicked(date: number){
		this.router.navigate(['/calendar/day', date]);
	}

	goToWeekday(index: number){
		this.scrollToDate(moment.unix(this.currentDay.unix()).startOf('isoWeek').add(index, 'days'));
	}
	
	getFullDayOfDate(date: number){
		return moment.unix(date).format(this.fullDayFormat);
	}

	getCurrentMonth(){
		return this.currentDay.format("MMMM")
	}
	
	getCurrentYear(): number{
		return this.currentDay.year();
	}

	getTimeOfDate(date: number){
		return moment.unix(date).format("H:mm");
	}

	getDayBackgroundColor(index: number){
      var date = this.dataService.mobileCalendarDaysDates[index]["date"];

      if(this.isToday(date)){
         return "#dddddd";
      }else if(date.month() % 2 == 0){
         return "#f9f9f9"
      }else{
         return "#ffffff"
      }
	}

	isToday(date: moment.Moment): boolean{
		return date.startOf('day').unix() == moment().startOf('day').unix();
	}
}