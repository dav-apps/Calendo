import { Component } from '@angular/core';
import * as Dav from 'dav-npm';
import { environment } from '../environments/environment';
import { enUS } from '../locales/locales';
import { DataService } from './services/data-service';
import { ConvertTableObjectToAppointment } from './models/Appointment';
import { ConvertTableObjectToTodo } from './models/Todo';

@Component({
  	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: [
		'./app.component.scss'
	]
})
export class AppComponent {
	locale = enUS.navbar;
	isWindowSmall = false;
	smallWindowMaxSize: number = 768;
	windowWidth: number = 500;

	constructor(public dataService: DataService){
		this.locale = this.dataService.GetLocale().navbar;
	}

	ngOnInit(){
		this.setSize();
		this.setTitleBarColor();

		// Set the background colors
		this.dataService.SetTheme();

		let notificationOptions = {
			icon: "/assets/icons/icon-192x192.png",
			badge: "/favicon.ico"
		}

		Dav.Initialize(environment.production, 
							environment.appId, 
							[environment.todoTableId, environment.appointmentTableId], 
							[], 
							notificationOptions, {
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

	setTitleBarColor(){
		if(window["Windows"] && window["Windows"].UI.ViewManagement){
			// #007bff
			var themeColor = {
				r: 0,
				g: 123,
				b: 255,
				a: 255
			}

			let titleBar = window["Windows"].UI.ViewManagement.ApplicationView.getForCurrentView().titleBar;
			titleBar.foregroundColor = themeColor;
			titleBar.backgroundColor = themeColor;
			titleBar.buttonBackgroundColor = themeColor;
			titleBar.buttonInactiveBackgroundColor = themeColor;
			titleBar.inactiveForegroundColor = themeColor;
			titleBar.inactiveBackgroundColor = themeColor;
		}
	}
}