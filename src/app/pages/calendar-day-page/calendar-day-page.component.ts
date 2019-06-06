import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { DataService } from '../../services/data-service';
import { AppointmentModalComponent } from '../../components/appointment-modal/appointment-modal.component';
import { NewTodoModalComponent } from '../../components/new-todo-modal/new-todo-modal.component';
import { Appointment } from '../../models/Appointment';
import { Todo } from '../../models/Todo';
import { TodoList } from '../../models/TodoList';
import { enUS } from '../../../locales/locales';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { TodoListModalComponent } from 'src/app/components/todo-list-modal/todo-list-modal.component';
import { MatSnackBar } from '@angular/material';
import { IIconStyles } from 'office-ui-fabric-react';
import { Location } from '@angular/common';

@Component({
   selector: "calendo-calendar-day-page",
   templateUrl: "./calendar-day-page.component.html"
})
export class CalendarDayPageComponent{
	locale = enUS.calendarDayPage;
	snackbarLocale = enUS.snackbar;
   faPlus = faPlus;
   @ViewChild(AppointmentModalComponent)
   private newAppointmentModalComponent: AppointmentModalComponent;
   @ViewChild(NewTodoModalComponent)
   private newTodoModalComponent: NewTodoModalComponent;
   @ViewChild('todoListModal')
   private todoListModal: TodoListModalComponent;
   date: moment.Moment = moment();
   backButtonIconStyles: IIconStyles = {
		root: {
         fontSize: 19
		}
	}

   constructor(
		public dataService: DataService,
		private router: Router,
      private route: ActivatedRoute,
      private location: Location,
		private snackBar: MatSnackBar
	){
		this.locale = this.dataService.GetLocale().calendarDayPage;
		this.snackbarLocale = this.dataService.GetLocale().snackbar;
      moment.locale(this.dataService.locale);
      this.dataService.HideWindowsBackButton();
   }

   ngOnInit(){
      this.route.params.subscribe(param => {
         if(param.time){
            this.date = moment.unix(param.time).startOf('day');
            this.dataService.selectedDay = this.date;
            
            this.dataService.LoadAllAppointments();
            this.dataService.LoadAllTodos();
         }
      });
   }

   getCurrentDate(){
      return this.date.format(this.locale.formats.currentDay);
   }

   ShowNewAppointmentModal(){
      this.newAppointmentModalComponent.Show(null, this.date.unix());
   }

   CreateAppointment(appointment: Appointment){
		this.dataService.AddAppointment(appointment);
		
		// Show snackbar if the appointment was created for another day
		if(this.date.unix() != moment(appointment.start * 1000).startOf('day').unix()){
			// Another day
			this.snackBar.open(this.snackbarLocale.appointmentCreated, this.snackbarLocale.show, {duration: 3000}).onAction().subscribe(() => {
				// Show the day of the appointment
				this.router.navigate(["calendar/day", appointment.start]);
			});
		}
   }

   ShowNewTodoModal(){
      this.newTodoModalComponent.Show(this.date.unix());
   }

   CreateTodo(todo: Todo){
		this.dataService.AddTodo(todo);
		
		// Show snackbar if the todo was created for another day
		if(todo.time == 0){
			// Show snackbar without action
			this.snackBar.open(this.snackbarLocale.todoCreated, null, {duration: 3000});
		}else if(this.date.unix() != todo.time){
			// Another day
			this.snackBar.open(this.snackbarLocale.todoCreated, this.snackbarLocale.show, {duration: 3000}).onAction().subscribe(() => {
				// Show the day of the todo
				this.router.navigate(["calendar/day", todo.time]);
			});
		}
   }

   DeleteTodo(todo: Todo){
      this.dataService.RemoveTodo(todo);
   }

   ShowTodoListModal(){
      this.todoListModal.Show(null, this.date.unix());
   }

   CreateTodoList(todoList: TodoList){
		this.dataService.AddTodoList(todoList);
		
		// Show snackbar
		this.snackBar.open(this.snackbarLocale.todoListCreated, this.snackbarLocale.show, {duration: 3000}).onAction().subscribe(() => {
			// Show the todo list
			this.router.navigate(["todolist", todoList.uuid]);
		});
   }

   GoBack(){
      this.location.back();
   }
}