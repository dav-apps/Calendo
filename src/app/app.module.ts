import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { StartPageComponent } from './pages/start-page/start-page.component';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { TodoItemComponent } from './components/todo-item/todo-item.component';
import { AppointmentItemComponent } from './components/appointment-item/appointment-item.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  	declarations: [
		AppComponent,
		StartPageComponent,
		UserMenuComponent,
		TodoItemComponent,
		AppointmentItemComponent
  	],
  	imports: [
		BrowserModule,
		FormsModule,
		RouterModule.forRoot([
			{path: '', component: StartPageComponent}
		], {
			useHash: false
		}),
		NgbModule.forRoot(),
		ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
  	],
  	providers: [],
  	bootstrap: [AppComponent]
})
export class AppModule { }
