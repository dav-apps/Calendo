import { Component } from '@angular/core';
import { DataService } from '../../services/data-service';
import { environment } from '../../../environments/environment';
import { enUS } from "../../../locales/locales";
import { MatRadioChange } from '@angular/material/radio';
import { IDropdownOption } from 'office-ui-fabric-react';

const dateKey = "date";
const groupKey = "group";

@Component({
   selector: "calendo-settings-page",
   templateUrl: "./settings-page.component.html"
})
export class SettingsPageComponent{
	locale = enUS.settingsPage;
	version: string = environment.version;
	year = (new Date()).getFullYear();
   sortTodosSelectedKey: string = groupKey;
	isWindows: boolean = false;
	themeKeys: string[] = [environment.lightThemeKey, environment.darkThemeKey, environment.systemThemeKey]
	selectedTheme: string;

	constructor(
		public dataService: DataService
	) {
		this.locale = this.dataService.GetLocale().settingsPage;
      this.isWindows = window["Windows"] != null;
      this.dataService.HideWindowsBackButton();
   }

   async ngOnInit(){
      this.sortTodosSelectedKey = await this.dataService.GetSortTodosByDate() ? dateKey : groupKey;
      
      // Set the correct theme radio button
		this.selectedTheme = await this.dataService.GetTheme();
		if(!this.isWindows && this.selectedTheme == environment.systemThemeKey){
			this.selectedTheme = environment.lightThemeKey;
		}
   }

   onSortTodosSelectChanged(event: {ev: MouseEvent, option: IDropdownOption, index: number}){
		this.sortTodosSelectedKey = event.index == 0 ? dateKey : groupKey;
		this.dataService.SetSortTodosByDate(event.index == 0);
   }

   onThemeRadioButtonSelected(event: MatRadioChange){
		this.selectedTheme = event.value;
		this.dataService.SetTheme(event.value);
		this.dataService.ApplyTheme(event.value);
	}
}