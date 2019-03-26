import { Component } from "@angular/core";
import { DataService } from '../../services/data-service';
import { enUS } from '../../../locales/locales';
import { environment } from '../../../environments/environment';
import * as Dav from 'dav-npm';

@Component({
   selector: "calendo-account-page",
   templateUrl: "./account-page.component.html"
})
export class AccountPageComponent{
   locale = enUS.accountPage;

   constructor(public dataService: DataService){
      this.locale = this.dataService.GetLocale().accountPage;
	}
   
   ShowLoginPage(){
      Dav.ShowLoginPage(environment.apiKey, environment.baseUrl);
   }

   ShowSignupPage(){
      Dav.ShowSignupPage(environment.baseUrl);
   }

   Logout(){
      this.dataService.user.Logout().then(() => {
         window.location.href = "/";
      });
	}
	
	bytesToGigabytes(bytes: number, rounding: number){
		if(bytes == 0) return 0;
		return Math.round(bytes / 1000000000).toFixed(rounding);
	}

	getUsedStoragePercentage(){
		return (this.dataService.user.UsedStorage / this.dataService.user.TotalStorage) * 100;
	}
}