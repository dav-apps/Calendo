import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
   selector: "calendo-todo-group-badge",
   templateUrl: "./todo-group-badge.component.html"
})
export class TodoGroupBadgeComponent{
   @Input() groupName: string = "";
   @Input() canRemove: boolean = false;
   @Output() remove = new EventEmitter();
   badgeColor: string = "#4285F4";     // Bootstrap primary color
   badgeTextColor: string = "#FFFFFF";    // Either black or white

   constructor(){}

   ngOnInit(){
      this.ColorizeBadge();
   }

   ColorizeBadge(){
      this.badgeColor = this.stringToColour(this.groupName);
      this.badgeTextColor = this.generateTextColor(this.badgeColor);
   }

   Remove(){
      if(this.canRemove){
         this.remove.emit(this.groupName);
      }
   }

   // https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
   stringToColour(str){
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      var colour = '#';
      for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
      }
      return colour;
   }

   // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
   hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
         r: parseInt(result[1], 16),
         g: parseInt(result[2], 16),
         b: parseInt(result[3], 16)
      } : null;
   }

   generateTextColor(colorCode: string){
      var rgb = this.hexToRgb(colorCode);

      var c = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

      for(var i = 0; i < c.length; i++){
         if(c[i] <= 0.03928){
            c[i] = c[i] / 12.92;
         }else{
            c[i] = Math.pow((c[i] + 0.055) / 1.055, 2.4);
         }
      }

      var l = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

      if(l > 0.179){
         // Black text color
         return "#000000";
      }else{
         // White text color
         return "#FFFFFF";
      }
   }
}