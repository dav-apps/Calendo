import { Component } from '@angular/core';
import * as Dav from 'dav-npm';
import { environment } from '../../../environments/environment';

@Component({
   selector: "calendo-user-menu",
   templateUrl: "./user-menu.component.html",
   styleUrls: [
      "./user-menu.component.scss"
   ]
})
export class UserMenuComponent{
   user: Dav.DavUser;

   constructor(){}

   ngOnInit(){
      this.user = new Dav.DavUser();
   }

   ShowLoginPage(){
      Dav.ShowLoginPage(environment.apiKey, environment.baseUrl);
   }
}