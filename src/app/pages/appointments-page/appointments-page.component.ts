import { Component } from '@angular/core';
import { DataService } from '../../services/data-service';

@Component({
   selector: "calendo-appointments-page",
   templateUrl: "./appointments-page.component.html",
   styleUrls: [
      "./appointments-page.component.scss"
   ]
})
export class AppointmentsPageComponent{

   constructor(public dataService: DataService){}

   ngOnInit(){}
}