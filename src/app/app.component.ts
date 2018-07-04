import { Component } from '@angular/core';
import * as Dav from 'dav-npm';
import { environment } from '../environments/environment';
import { DataService } from './services/data-service';
import { ConvertTableObjectToAppointment } from './models/Appointment';
import { ConvertTableObjectToTodo } from './models/Todo';

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
			UpdateAllOfTable: (tableId: number) => {
				if(tableId === environment.appointmentTableId){
					this.dataService.LoadAllAppointments();
				}else if(tableId === environment.todoTableId){
					this.dataService.LoadAllTodos();
				}
			},
			UpdateTableObject: (tableObject: Dav.TableObject) => {
				if(tableObject.TableId == environment.appointmentTableId){
					// Update appointment
					var appointment = ConvertTableObjectToAppointment(tableObject);

					if(appointment){
						this.dataService.UpdateAppointment(appointment);
					}
				}else if(tableObject.TableId == environment.todoTableId){
					// Update todo
					var todo = ConvertTableObjectToTodo(tableObject);

					if(todo){
						this.dataService.UpdateTodo(todo);
					}
				}
			},
			DeleteTableObject: (tableObject: Dav.TableObject) => {
				if(tableObject.TableId == environment.appointmentTableId){
					// Remove appointment
					var appointment = ConvertTableObjectToAppointment(tableObject);

					if(appointment){
						this.dataService.RemoveAppointment(appointment);
					}
				}else if(tableObject.TableId == environment.todoTableId){
					// Remove todo
					var todo = ConvertTableObjectToTodo(tableObject);

					if(todo){
						this.dataService.RemoveTodo(todo);
					}
				}
			}
		});
	}

	onResize(event: any) {
		this.isWindowSmall = (window.innerWidth < 576);
	}
}