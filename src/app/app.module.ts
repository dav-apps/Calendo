import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, Router } from '@angular/router';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { StartPageComponent } from './pages/start-page/start-page.component';

@NgModule({
  	declarations: [
		AppComponent,
		StartPageComponent
  	],
  	imports: [
		BrowserModule,
		RouterModule.forRoot([
			{path: '', component: StartPageComponent}
		], {
			useHash: false
		}),
		NgbModule.forRoot()
  	],
  	providers: [],
  	bootstrap: [AppComponent]
})
export class AppModule { }
