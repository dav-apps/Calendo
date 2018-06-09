import { Component } from '@angular/core';
import * as Dav from 'dav-npm';
import { environment } from '../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
   selector: "calendo-user-menu",
   templateUrl: "./user-menu.component.html",
   styleUrls: [
      "./user-menu.component.scss"
   ]
})
export class UserMenuComponent{
   user: Dav.DavUser;

   constructor(private activatedRoute: ActivatedRoute){
      this.activatedRoute.queryParams.subscribe(async params => {
         if(params["jwt"]){
            // Login with the jwt
            this.user = new Dav.DavUser();
            if(await this.user.Login(params["jwt"])){
               window.location.href = "/";
            }
         }else{
            this.user = new Dav.DavUser(() => {
               // Check if the user is logged in
               if(this.user.IsLoggedIn){
                  console.log("Logged in");
               }else{
                  console.log("Not logged in");
               }
            });
         }
      });
   }

   ShowLoginPage(){
      Dav.ShowLoginPage(environment.apiKey, environment.baseUrl);
   }
}