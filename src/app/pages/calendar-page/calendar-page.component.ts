import { Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
declare var $: any;
import { DataService } from '../../services/data-service';
import { enUS } from '../../../locales/locales';
import * as platform from 'platform';

@Component({
   selector: "calendo-calendar-page",
   templateUrl: "./calendar-page.component.html",
   styleUrls: [
      "./calendar-page.component.scss"
   ]
})
export class CalendarPageComponent{
	locale = enUS.calendarPage;
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

	topDay: moment.Moment = moment();	// The day at the very top of the mobile view
	currentDay: moment.Moment = moment();
	currentDayOfWeek: number = 0;
	position: number = 1;
	visibleRows: number = 5;		// The number of days that are visible
	dayBuffer: number = 14;			// The number of days of each before and after the current day
	scrolled: boolean = false;		// If true, load the todos and appointments in the days after the 2 seconds interval
	currentWeekDays: string[] = ["1", "2", "3", "4", "5", "6", "7"];

	constructor(public dataService: DataService,
					private router: Router){
		this.locale = this.dataService.GetLocale().calendarPage;
		moment.locale(this.dataService.locale);
		window["Windows"].UI.Core.SystemNavigationManager.getForCurrentView().appViewBackButtonVisibility = window["Windows"].UI.Core.AppViewBackButtonVisibility.collapsed;
		
		// Set the weekday labels in the current language
		let weekdays = moment.weekdaysMin();

		for(let i = 0; i < weekdays.length; i++){
			if(i < 6){
				this.weekDayLabels[i] = weekdays[i + 1];
			}else{
				this.weekDayLabels[i] = weekdays[0];
			}
		}
	}

   async ngOnInit(){
		await this.initialize();

		$("#calendarContainer").scroll(() => this.onScroll());
		$("#mobileCalendarContainer").scroll(() => this.onScroll());

		$(document).keydown((e) => {
			if(this.showMobileLayout) return;
         if(e.keyCode === 38 || e.keyCode === 37){
				// Arrow up or Arrow left
				this.ShowPrevious();
         }else if(e.keyCode === 40 || e.keyCode === 39){
            // Arrow down or Arrow right
            this.ShowNext();
         }
      });

      $(document).bind('mousewheel', (e) => {
			if(this.showMobileLayout) return;
         if(e.originalEvent.wheelDelta > 0){
            // Wheel up
            this.ShowPrevious();
         }else{
            // Wheel down
            this.ShowNext();
         }
      });
   }

   async initialize(){
		this.topDay = moment().subtract(this.dayBuffer, 'days');

		this.fillDaysMobile();
		this.fillDaysDesktop();
		
		setTimeout(() => {
			this.setSize();

			setTimeout(() => {
				this.scrollToDate(this.currentDay);
				this.setSize();

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
		if(!this.isInitializing && this.showMobileLayout){
			let bufferAbove = this.dayBuffer * this.calendarDayHeight;		// The height of all days before the current day
			let bufferBelow = (this.dataService.mobileCalendarDaysDates.length * this.calendarDayHeight) - bufferAbove;		// The height of the days from the current day to the last one

			if(this.mobileCalendarContainer.nativeElement.scrollTop < bufferAbove){
				// The user scrolled into the buffer above
				this.addDayTop();
				this.scrolled = true;

				// Update the scrollTop value (only needed in Edge and Firefox)
				if(platform.name.includes("Firefox") || platform.name.includes("Edge")){
					this.mobileCalendarContainer.nativeElement.scrollTop += this.calendarDayHeight;
				}
			}else if(this.mobileCalendarContainer.nativeElement.scrollTop > bufferBelow){
				// The user scrolled into the buffer below
				this.addDayBottom();
				this.scrolled = true;
			}else{
				this.position = Math.floor(this.mobileCalendarContainer.nativeElement.scrollTop / this.calendarDayHeight);
				this.currentDay = moment.unix(this.topDay.unix()).add(this.position, 'days');
				
				this.updateCurrentWeekDays();
			}
		}
	}

   fillDaysMobile(){
		this.dataService.mobileCalendarDaysDates = [];
		this.dataService.mobileCalendarDaysAppointments = [];
		this.dataService.mobileCalendarDaysTodos = [];

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
		this.dataService.desktopCalendarDaysDates = [];
		this.dataService.desktopCalendarDaysAppointments = [];
		this.dataService.desktopCalendarDaysTodos = [];

		var startDate = moment.unix(this.currentDay.unix()).startOf('month').isoWeekday(1).startOf('day');
		var endDate = moment.unix(this.currentDay.unix()).endOf('month').isoWeekday(7).endOf('day');
		var date = moment.unix(startDate.unix());
		var dates = [];

		while (date.unix() < endDate.unix()) {
			dates.push(date.unix())
			date.add(1, 'days');
		}

		let datesWeek = [];

		for(let i = 0; i < dates.length; i++){
			datesWeek.push(dates[i]);

			if(datesWeek.length == 7){
				// Add the datesWeek to the desktopCalendarDays array
				this.dataService.desktopCalendarDaysDates.push(datesWeek);
				this.dataService.desktopCalendarDaysAppointments.push([[], [], [], [], [], [], []]);
				this.dataService.desktopCalendarDaysTodos.push([[], [], [], [], [], [], []]);

				datesWeek = [];
			}
		}

		this.dataService.UpdateCalendarDays();
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

		// Add a new entry at the beginning of the mobileCalendarDaysDates and the todos and appointments arrays
		this.dataService.mobileCalendarDaysDates.unshift(this.topDay.startOf('day').unix());
		this.dataService.mobileCalendarDaysAppointments.unshift([]);
		this.dataService.mobileCalendarDaysTodos.unshift([]);
   }

   addDayBottom(){
		let date = moment.unix(this.topDay.unix()).startOf('day').add(this.dataService.mobileCalendarDaysDates.length, 'days').startOf('day');

		// Add a new entry at the end of the mobileCalendarDaysDates and the todos and appointments arrays
		this.dataService.mobileCalendarDaysDates.push(date.unix());
		this.dataService.mobileCalendarDaysAppointments.push([]);
		this.dataService.mobileCalendarDaysTodos.push([]);
	}

	ShowPrevious(){
		this.currentDay.subtract(1, 'month');
		this.fillDaysDesktop();
		this.setSize();
	}

	ShowNext(){
		this.currentDay.add(1, 'month');
		this.fillDaysDesktop();
		this.setSize();
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

		this.calendarDayHeight = this.calendarHeight / this.dataService.desktopCalendarDaysDates.length;
		this.calendarDayWidth = this.calendarWidth / 7;
	}
	
	onResize(){
		let showMobileLayoutBefore = this.showMobileLayout;
		this.setSize();
		
		// If it was desktop before and is now mobile
		if(!showMobileLayoutBefore && this.showMobileLayout){
			// Scroll to the current page
			this.scrollToDate(moment())
		}
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

	getDayOfDate(date: number){
		return moment.unix(date).format(this.dayFormat);
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

	getDayBackgroundColor(i: number, j: number){
		var date = moment.unix(this.dataService.desktopCalendarDaysDates[i][j]);

      if(this.isToday(date)){
         return "#dddddd";
      }else if(date.month() == this.currentDay.month()){
         return "#f9f9f9"
      }else{
         return "#ffffff"
      }
	}

	isToday(date: moment.Moment): boolean{
		return date.startOf('day').unix() == moment().startOf('day').unix();
	}
}