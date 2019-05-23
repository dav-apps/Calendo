import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../../services/data-service';
import { enUS } from '../../../locales/locales';

@Component({
	selector: "calendo-set-name",
	templateUrl: "./set-name.component.html"
})
export class SetNameComponent{
	locale = enUS.setName;
	@Input()
	todo: boolean = true;
	@Input()
   name: string = "";
   @Output()
   nameChanged = new EventEmitter<string>();
	nameTextFieldStyle = {
		root: {
			width: 280,
		}
	}

	constructor(
      public dataService: DataService
   ){
      this.locale = this.dataService.GetLocale().setName;
   }

   onChange(event: {ev: any, newValue: string}){
		this.nameChanged.emit(event.newValue)
   }
}