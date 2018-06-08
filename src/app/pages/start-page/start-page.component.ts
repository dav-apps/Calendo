import { Component } from '@angular/core';
import * as moment from 'moment';
declare var $: any;
import fontawesome from '@fortawesome/fontawesome'
import solid from '@fortawesome/fontawesome-free-solid'
import * as Dav from 'dav-npm';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';

@Component({
   selector: "calendo-start-page",
   templateUrl: "./start-page.component.html",
   styleUrls: [
      "./start-page.component.scss"
   ]
})
export class StartPageComponent{
   user: Dav.DavUser;

   constructor(private router: Router,
               private activatedRoute: ActivatedRoute){
      fontawesome.library.add(solid);

      this.activatedRoute.queryParams.subscribe(async params => {
         if(params["jwt"]){
            // Login with the jwt
            this.user = new Dav.DavUser();
            await this.user.Login(params["jwt"]);
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

   ngOnInit(){
      setTimeout(() => {
         $('.todo-checkbox').iCheck({
            checkboxClass: 'icheckbox_square-blue',
            radioClass: 'iradio_square',
            increaseArea: '10%'
         });
      }, 10);
   }

   GetWeekDay(index: number): string{
      moment.locale('en');
      return moment().add(index, 'days').format('dddd');
   }

   GetDate(index: number): string{
      moment.locale('en');
      return moment().add(index, 'days').format('D. MMMM YYYY');
   }

   ShowOrHideAppointmentsOfDay(day: number){
      var elementId = "#appointments-day-" + day;
      if($(elementId).is(":visible")){
         $(elementId).hide();
      }else{
         $(elementId).show();
      }
   }

   ShowOrHideTodosOfDay(day: number){
      var elementId = "#todos-day-" + day;
      if($(elementId).is(":visible")){
         $(elementId).hide();
      }else{
         $(elementId).show();
      }
   }
}