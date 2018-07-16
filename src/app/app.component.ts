import { Component } from '@angular/core';
declare var $: any;
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
	smallWindowMaxSize: number = 768;
	windowWidth: number = 500;

	constructor(private dataService: DataService){}

	ngOnInit(){
		this.setSize();

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

		Dav.Log(environment.apiKey, environment.visitKey);
	}

	onResize(event: any) {
		this.setSize();
	}

	setSize(){
		this.isWindowSmall = (window.innerWidth < this.smallWindowMaxSize);
		this.windowWidth = window.innerWidth - 15;
	}
}