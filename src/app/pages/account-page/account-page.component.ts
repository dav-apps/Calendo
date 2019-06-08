import { Component, ViewChild } from "@angular/core";
import { DataService } from '../../services/data-service';
import { enUS } from '../../../locales/locales';
import { environment } from '../../../environments/environment';
import * as Dav from 'dav-npm';
import { LogoutModalComponent } from '../../components/logout-modal/logout-modal.component';
import { faSync, faLock } from '@fortawesome/free-solid-svg-icons';

@Component({
   selector: "calendo-account-page",
   templateUrl: "./account-page.component.html"
})
export class AccountPageComponent{
   locale = enUS.accountPage;
   faSync = faSync;
   faLock = faLock;
	@ViewChild(LogoutModalComponent)
	private logoutModalComponent: LogoutModalComponent;

   constructor(public dataService: DataService){
      this.locale = this.dataService.GetLocale().accountPage;
      this.dataService.HideWindowsBackButton();
	}
   
   ShowLoginPage(){
      Dav.ShowLoginPage(environment.apiKey, environment.baseUrl);
   }

   ShowSignupPage(){
      Dav.ShowSignupPage(environment.baseUrl);
   }

   ShowPlansAccountPage(){
      window.open("https://dav-apps.tech/login?redirect=user%23plans%0A", 'blank');
   }

   ShowLogoutModal(){
		this.logoutModalComponent.Show();
   }

   Logout(){
      this.dataService.user.Logout().then(() => {
         window.location.href = "/account";
      });
	}
	
	bytesToGigabytes(bytes: number, rounding: number) : string{
		if(bytes == 0) return "0";
		return Math.round(bytes / 1000000000).toFixed(rounding);
	}

	getUsedStoragePercentage() : number{
		return (this.dataService.user.UsedStorage / this.dataService.user.TotalStorage) * 100;
	}
}