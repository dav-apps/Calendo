import { Component } from '@angular/core';
import { DataService } from '../../services/data-service';
declare var $: any;

@Component({
   selector: "calendo-settings-page",
   templateUrl: "./settings-page.component.html",
   styleUrls: [
      "./settings-page.component.scss"
   ]
})
export class SettingsPageComponent{
   sortTodoByDateSelected: boolean = false;

   constructor(public dataService: DataService){}

   async ngOnInit(){
      this.sortTodoByDateSelected = await this.dataService.GetSortTodosByDate();

      $('#show-old-appointments-checkbox').iCheck({
         checkboxClass: 'icheckbox_square-blue',
         radioClass: 'iradio_square'
      });

      if(await this.dataService.GetShowOldAppointments()){
         $('#show-old-appointments-checkbox').iCheck('check');
      }
      $('#show-old-appointments-checkbox').on('ifChecked', (event) => this.onHideAppointmentsCheckboxChanged(true));
      $('#show-old-appointments-checkbox').on('ifUnchecked', (event) => this.onHideAppointmentsCheckboxChanged(false));
   }

   onSortTodosSelectChanged(value){
      this.dataService.SetSortTodosByDate(value == 0);
   }

   onHideAppointmentsCheckboxChanged(value: boolean){
      this.dataService.SetShowOldAppointments(value);
   }
}