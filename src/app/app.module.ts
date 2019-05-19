import { AngularReactBrowserModule } from '@angular-react/core';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FabCheckboxModule, FabButtonModule, FabDropdownModule, FabTextFieldModule } from '@angular-react/fabric';

import { AppComponent } from './app.component';
import { StartPageComponent } from './pages/start-page/start-page.component';
import { TodosPageComponent } from './pages/todos-page/todos-page.component';
import { AppointmentsPageComponent } from './pages/appointments-page/appointments-page.component';
import { AccountPageComponent } from './pages/account-page/account-page.component';
import { SettingsPageComponent } from './pages/settings-page/settings-page.component';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { CalendarDayPageComponent } from './pages/calendar-day-page/calendar-day-page.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { TodoItemComponent } from './components/todo-item/todo-item.component';
import { SmallTodoItemComponent } from './components/small-todo-item/small-todo-item.component';
import { AppointmentItemComponent } from './components/appointment-item/appointment-item.component';
import { SmallAppointmentItemComponent } from './components/small-appointment-item/small-appointment-item.component';
import { NewTodoModalComponent } from './components/new-todo-modal/new-todo-modal.component';
import { AppointmentModalComponent } from './components/appointment-modal/appointment-modal.component';
import { DeleteAppointmentModalComponent } from './components/delete-appointment-modal/delete-appointment-modal.component';
import { LogoutModalComponent } from './components/logout-modal/logout-modal.component';
import { TodoGroupBadgeComponent } from './components/todo-group-badge/todo-group-badge.component';
import { DataService } from './services/data-service';
import { environment } from '../environments/environment';

@NgModule({
  	declarations: [
		AppComponent,
		StartPageComponent,
		TodosPageComponent,
		AppointmentsPageComponent,
		AccountPageComponent,
		SettingsPageComponent,
		CalendarPageComponent,
		CalendarDayPageComponent,
		UserMenuComponent,
		TodoItemComponent,
		SmallTodoItemComponent,
		AppointmentItemComponent,
		SmallAppointmentItemComponent,
		NewTodoModalComponent,
		AppointmentModalComponent,
		DeleteAppointmentModalComponent,
		LogoutModalComponent,
      TodoGroupBadgeComponent
  	],
  	imports: [
		AngularReactBrowserModule,
		FormsModule,
		RouterModule.forRoot([
			{ path: '', component: StartPageComponent },
			{ path: 'calendar', component: CalendarPageComponent },
			{ path: 'calendar/day/:time', component: CalendarDayPageComponent },
			{ path: 'todos', component: TodosPageComponent },
			{ path: 'appointments', component: AppointmentsPageComponent },
			{ path: 'account', component: AccountPageComponent },
			{ path: 'settings', component: SettingsPageComponent }
		], {
			useHash: false
		}),
		NgbModule.forRoot(),
		FontAwesomeModule,
      ServiceWorkerModule.register('/sw.js', { enabled: environment.production }),
      FabCheckboxModule,
      FabButtonModule,
		FabDropdownModule,
		FabTextFieldModule
  	],
  	providers: [
		DataService
	],
  	bootstrap: [AppComponent]
})
export class AppModule {}