import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { StartPageComponent } from './pages/start-page/start-page.component';
import { TodosPageComponent } from './pages/todos-page/todos-page.component';
import { AppointmentsPageComponent } from './pages/appointments-page/appointments-page.component';
import { SettingsPageComponent } from './pages/settings-page/settings-page.component';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { CalendarDayPageComponent } from './pages/calendar-day-page/calendar-day-page.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { TodoItemComponent } from './components/todo-item/todo-item.component';
import { AppointmentItemComponent } from './components/appointment-item/appointment-item.component';
import { NewTodoModalComponent } from './components/new-todo-modal/new-todo-modal.component';
import { AppointmentModalComponent } from './components/appointment-modal/appointment-modal.component';
import { DeleteAppointmentModalComponent } from './components/delete-appointment-modal/delete-appointment-modal.component';
import { TodoGroupBadgeComponent } from './components/todo-group-badge/todo-group-badge.component';
import { DataService } from './services/data-service';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  	declarations: [
		AppComponent,
		StartPageComponent,
		TodosPageComponent,
		AppointmentsPageComponent,
		SettingsPageComponent,
		CalendarPageComponent,
		CalendarDayPageComponent,
		UserMenuComponent,
		TodoItemComponent,
		AppointmentItemComponent,
		NewTodoModalComponent,
		AppointmentModalComponent,
		DeleteAppointmentModalComponent,
		TodoGroupBadgeComponent
  	],
  	imports: [
		BrowserModule,
		FormsModule,
		RouterModule.forRoot([
			{ path: '', component: StartPageComponent },
			{ path: 'todos', component: TodosPageComponent },
			{ path: 'appointments', component: AppointmentsPageComponent },
			{ path: 'settings', component: SettingsPageComponent },
			{ path: 'calendar', component: CalendarPageComponent },
			{ path: 'calendar/day/:time', component: CalendarDayPageComponent }
		], {
			useHash: false
		}),
		NgbModule.forRoot(),
		ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
  	],
  	providers: [
		DataService
	],
  	bootstrap: [AppComponent]
})
export class AppModule { }
