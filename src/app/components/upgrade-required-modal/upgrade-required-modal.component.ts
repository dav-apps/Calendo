import { Component, Output, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../../services/data-service';
import { enUS } from '../../../locales/locales';

@Component({
	selector: 'calendo-upgrade-required-modal',
	templateUrl: './upgrade-required-modal.component.html'
})
export class UpgradeRequiredModalComponent{
	locale = enUS.upgradeRequiredModal;
	@Output() learnMoreClick = new EventEmitter();
	@ViewChild('upgradeRequiredModal', { static: true }) upgradeRequiredModal: ElementRef;
	requiredPlan: number = 0;		// 0 = Plus, 1 = Pro
	feature: number = 0;				// 0 = Nested todo lists

	constructor(
		private modalService: NgbModal,
		private dataService: DataService
	){
		this.locale = this.dataService.GetLocale().upgradeRequiredModal;
	}

	Show(feature: number = 0, requiredPlan: number = 0){
		this.requiredPlan = requiredPlan;
		this.feature = feature;

		this.modalService.open(this.upgradeRequiredModal).result.then(() => {
			this.learnMoreClick.emit();
		}, () => {});
	}
}