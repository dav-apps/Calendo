import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../services/data-service';
import { enUS } from '../../../locales/locales';

@Component({
   selector: "calendo-logout-modal",
   templateUrl: "./logout-modal.component.html"
})
export class LogoutModalComponent{
	locale = enUS.logoutModal;
	@Output() logout = new EventEmitter();
	@ViewChild('logoutModal', { static: true }) logoutModal: ElementRef;

   constructor(private modalService: NgbModal,
      			private dataService: DataService){
      this.locale = this.dataService.GetLocale().logoutModal;
	}
	
	Show(){
		this.modalService.open(this.logoutModal).result.then(() => {
			this.logout.emit();
		}, () => {});
	}
}