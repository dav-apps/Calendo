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
		var tableObject = new Dav.TableObject();
		Dav.Initialize(false, environment.appId, [environment.todoTableId, environment.appointmentTableId], {
			UpdateAll(){
				console.log("UpdateAll called")
			},
			UpdateAllOfTable(){
				console.log("UpdateAllOfTable called")
			},
			UpdateTableObject(){
				console.log("UpdateTableObject called")
			}
		});
	}

	onResize(event: any) {
		this.isWindowSmall = (window.innerWidth < 576);
	}
}