import { Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
declare var $: any;
import { Appointment, CreateAppointment, GetAppointment, UpdateAppointment } from '../../models/Appointment';
import { en } from '../../../locales/locales';
import { DataService } from '../../services/data-service';

@Component({
   selector: "calendo-appointment-modal",
	templateUrl: "./appointment-modal.component.html",
	styleUrls: [
		"./appointment-modal.component.scss"
	]
})
export class AppointmentModalComponent{
	locale = en.appointmentModal;
	@Output() save = new EventEmitter();
   @ViewChild('appointmentModal') appointmentModal: ElementRef;
   appointmentDate: NgbDateStruct;
   appointmentName: string;
   appointmentAllDayCheckboxChecked: boolean;
   appointmentStartTime;
   appointmentEndTime;
	new: boolean = true;
	appointmentUuid: string;
	availableColors: string[] = ["D32F2F", "d67724", "FFD600", "388E3C", "43A047", "00B0FF", "1565C0", "283593", "7B1FA2", "757575", "000000"];
	selectedColor: number = 6;

	constructor(private modalService: NgbModal,
					private dataService: DataService){
		this.locale = this.dataService.GetLocale().appointmentModal;
	}

   Show(appointment?: Appointment, date?: number){
      if(appointment){
			// Update appointment
			// Add the values of the appointment to the local variables
			this.new = false;
			this.appointmentUuid = appointment.uuid;

         var startDate = new Date(appointment.start*1000);
			var endDate = new Date(appointment.end*1000);

         this.appointmentDate = { year: startDate.getFullYear(), month: startDate.getMonth() + 1, day: startDate.getDate() };
         this.appointmentName = appointment.name;
         this.appointmentAllDayCheckboxChecked = appointment.allday;
         this.appointmentStartTime = { hour: startDate.getHours(), minute: startDate.getMinutes() };
			this.appointmentEndTime = { hour: endDate.getHours(), minute: endDate.getMinutes() };
			if(appointment.color){
				let colorIndex = this.availableColors.findIndex(c => c == appointment.color);
				if(colorIndex !== -1){
					this.selectedColor = colorIndex;
				}
			}
      }else{
         // New appointment
         this.ResetNewObjects(date);
      }

      this.modalService.open(this.appointmentModal).result.then(async () => {
			// Save the new appointment
			// Calculate the unix timestamp of start and end
			var start = new Date(this.appointmentDate.year, this.appointmentDate.month - 1, 
										this.appointmentDate.day, this.appointmentStartTime.hour, 
										this.appointmentStartTime.minute, 0, 0);
			var startUnix = Math.floor(start.getTime() / 1000);

			var end = new Date(this.appointmentDate.year, this.appointmentDate.month - 1,
									this.appointmentDate.day, this.appointmentEndTime.hour, 
									this.appointmentEndTime.minute, 0, 0);
			var endUnix = Math.floor(end.getTime() / 1000);

			var color = this.availableColors[this.selectedColor];

			if(this.new){
				// Create the new appointment
				var appointment = new Appointment("", this.appointmentName, startUnix, endUnix, this.appointmentAllDayCheckboxChecked, color);
				appointment.uuid = await CreateAppointment(appointment);

				this.save.emit(appointment);
			}else{
				var appointment = await GetAppointment(this.appointmentUuid);

				appointment.name = this.appointmentName;
				appointment.start = startUnix;
				appointment.end = endUnix;
				appointment.allday = this.appointmentAllDayCheckboxChecked;
				appointment.color = color;
				UpdateAppointment(appointment);

				this.save.emit(appointment);
			}
      }, () => {});

      $('#appointment-all-day-checkbox').iCheck({
         checkboxClass: 'icheckbox_square-blue',
         radioClass: 'iradio_square'
      });

		if(this.appointmentAllDayCheckboxChecked){
			$('#appointment-all-day-checkbox').iCheck('check');
		}
      $('#appointment-all-day-checkbox').on('ifChecked', (event) => this.appointmentAllDayCheckboxChecked = true);
      $('#appointment-all-day-checkbox').on('ifUnchecked', (event) => this.appointmentAllDayCheckboxChecked = false);
   }

   ResetNewObjects(date?: number){
		let d = new Date();
		if(date){
			d = new Date(date * 1000);
		}
		
      this.appointmentDate = {year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate()};
      this.appointmentName = "";
      this.appointmentAllDayCheckboxChecked = true;
      this.appointmentStartTime = { hour: 15, minute: 0 };
      this.appointmentEndTime = { hour: 16, minute: 0 };
   }

   SetAppointmentSaveButtonDisabled(): boolean{
      // Check if the start time is after the end time
      var timeOkay = this.appointmentAllDayCheckboxChecked;

      if(!this.appointmentAllDayCheckboxChecked){
         if(this.appointmentStartTime.hour > this.appointmentEndTime.hour){
            timeOkay = false;
         }else if(this.appointmentStartTime.hour == this.appointmentEndTime.hour){
            if(this.appointmentStartTime.minute > this.appointmentEndTime.minute){
               timeOkay = false;
            }else{
               timeOkay = true;
            }
         }else{
            timeOkay = true;
         }
      }
      
		return !(this.appointmentName.length > 1 && timeOkay);
	}
}