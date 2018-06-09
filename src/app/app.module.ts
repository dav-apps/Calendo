import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { StartPageComponent } from './pages/start-page/start-page.component';
import { UserMenuComponent } from './components/user-menu.component/user-menu.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  	declarations: [
		AppComponent,
		StartPageComponent,
		UserMenuComponent
  	],
  	imports: [
		BrowserModule,
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
