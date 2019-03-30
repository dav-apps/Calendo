import { Component } from '@angular/core';
import { enUS } from '../../../locales/locales';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data-service';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
   selector: "calendo-user-menu",
   templateUrl: "./user-menu.component.html",
   styleUrls: [
      "./user-menu.component.scss"
   ]
})
export class UserMenuComponent{
   locale = enUS.userMenu;
   faUserCircle = faUserCircle;

   constructor(private activatedRoute: ActivatedRoute,
               public dataService: DataService){

      this.locale = this.dataService.GetLocale().userMenu;

      this.activatedRoute.queryParams.subscribe(async params => {
         if(params["jwt"]){
            // Login with the jwt
            if(await this.dataService.user.Login(params["jwt"])){
               window.location.href = "/";
            }
         }
      });
   }
}