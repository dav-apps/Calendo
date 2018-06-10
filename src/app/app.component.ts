import { Component } from '@angular/core';
import * as Dav from 'dav-npm';
import { environment } from '../environments/environment';

@Component({
  	selector: 'app-root',
  	templateUrl: './app.component.html'
})
export class AppComponent {
	isCollapsed = false;
	isWindowSmall = false;

	ngOnInit(){
		this.isWindowSmall = (window.innerWidth < 576);
		Dav.Initialize(false, environment.appId);
	}

	onResize(event: any) {
		this.isWindowSmall = (window.innerWidth < 576);
	}
}