import {
	Component,
	ViewChild,
	ElementRef,
	Output,
	EventEmitter
} from "@angular/core"
import { NgbModal } from "@ng-bootstrap/ng-bootstrap"
import { DataService } from "src/app/services/data-service"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "calendo-logout-modal",
	templateUrl: "./logout-modal.component.html"
})
export class LogoutModalComponent {
	locale = this.localizationService.locale.logoutModal
	@Output() logout = new EventEmitter()
	@ViewChild("logoutModal", { static: true }) logoutModal: ElementRef

	constructor(
		private dataService: DataService,
		private localizationService: LocalizationService,
		private modalService: NgbModal
	) {}

	Show() {
		this.modalService.open(this.logoutModal).result.then(
			() => {
				this.logout.emit()
			},
			() => {}
		)
	}
}
