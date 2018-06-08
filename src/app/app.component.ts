import { Component } from '@angular/core';

@Component({
  	selector: 'app-root',
  	templateUrl: './app.component.html'
})
export class AppComponent {
	isCollapsed = false;
	isWindowSmall = false;

	ngOnInit(){
		this.isWindowSmall = (window.innerWidth < 576);
	}

	onResize(event: any) {
		this.isWindowSmall = (window.innerWidth < 576);
	}
}