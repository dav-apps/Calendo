import {
	Component,
	Input,
	Output,
	EventEmitter,
	KeyValueDiffer,
	KeyValueDiffers
} from "@angular/core"
import { DateTime } from "luxon"
import {
	TonalPalette,
	argbFromHex,
	hexFromArgb
} from "@material/material-color-utilities"
import { Appointment } from "src/app/models/Appointment"
import { environment } from "src/environments/environment"

@Component({
	selector: "calendo-appointment-item",
	templateUrl: "./appointment-item.component.html",
	styleUrl: "./appointment-item.component.scss",
	standalone: false
})
export class AppointmentItemComponent {
	@Input() appointment: Appointment = new Appointment(
		"",
		"",
		0,
		0,
		false,
		environment.appointmentDefaultColor
	)
	@Input() enableDropdown: boolean = true
	@Input() compact: boolean = false
	@Output() delete = new EventEmitter()
	backgroundColor: string = environment.appointmentDefaultColor
	textColor: string = environment.appointmentDefaultColor
	timeSpan: string = ""
	appointmentDiffer: KeyValueDiffer<string, any>

	constructor(private differs: KeyValueDiffers) {}

	ngOnInit() {
		this.timeSpan = this.getTimeSpan()
		this.appointmentDiffer = this.differs.find(this.appointment).create()

		this.loadColor()
	}

	ngDoCheck() {
		// Check for any changes in the appointment
		const changes = this.appointmentDiffer.diff(this.appointment)

		if (changes != null) {
			changes.forEachChangedItem(change => {
				if (change.key == "color") {
					// Reload the color
					this.loadColor()
				}
			})
		}
	}

	loadColor() {
		if (this.appointment.color != null) {
			let palette = TonalPalette.fromInt(argbFromHex(this.appointment.color))
			this.backgroundColor = hexFromArgb(palette.tone(90))
			this.textColor = hexFromArgb(palette.tone(10))
		}
	}

	getTimeSpan() {
		return `${DateTime.fromSeconds(this.appointment.start).toFormat(
			"H:mm"
		)} - ${DateTime.fromSeconds(this.appointment.end).toFormat("H:mm")}`
	}
}
