import { Component } from '@angular/core';
import * as Dav from 'dav-npm';
import { environment } from '../environments/environment';
import { DataService } from './services/data-service';

@Component({
  	selector: 'app-root',
  	templateUrl: './app.component.html'
})
export class AppComponent {
	isCollapsed = false;
	isWindowSmall = false;

	constructor(private dataService: DataService){

	}

	ngOnInit(){
		this.isWindowSmall = (window.innerWidth < 576);
		Dav.Initialize(environment.production, environment.appId, [environment.todoTableId, environment.appointmentTableId], {
			UpdateAll: () => {
				console.log("UpdateAll called")
			},
			UpdateAllOfTable: (tableId: number) => {
				if(tableId === environment.appointmentTableId){
					this.dataService.LoadAllAppointments();
				}else if(tableId === environment.todoTableId){
					this.dataService.LoadAllTodos();
				}
			},
			UpdateTableObject: () => {
				console.log("UpdateTableObject called")
			}
		});
	}

	onResize(event: any) {
		this.isWindowSmall = (window.innerWidth < 576);
	}
}