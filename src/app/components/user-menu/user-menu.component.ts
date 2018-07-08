import { Component } from '@angular/core';
import * as Dav from 'dav-npm';
import { environment } from '../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data-service';

@Component({
   selector: "calendo-user-menu",
   templateUrl: "./user-menu.component.html",
   styleUrls: [
      "./user-menu.component.scss"
   ]
})
export class UserMenuComponent{
   constructor(private activatedRoute: ActivatedRoute,
               public dataService: DataService){
      this.activatedRoute.queryParams.subscribe(async params => {
         if(params["jwt"]){
            // Login with the jwt
            if(await this.dataService.user.Login(params["jwt"])){
               window.location.href = "/";
            }
         }
      });
   }

   Logout(){
      this.dataService.user.Logout();
      window.location.href = "/";
   }

   ShowLoginPage(){
      Dav.ShowLoginPage(environment.apiKey, environment.baseUrl);
   }
}