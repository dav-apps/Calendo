import { Component, ViewChild } from '@angular/core';
declare var $: any;
import fontawesome from '@fortawesome/fontawesome';
import solid from '@fortawesome/fontawesome-free-solid';
import { Todo } from '../../models/Todo';
import { DataService } from '../../services/data-service';
import { NewTodoModalComponent } from '../../components/new-todo-modal/new-todo-modal.component';
import { AppointmentModalComponent } from '../../components/appointment-modal/appointment-modal.component';

@Component({
   selector: "calendo-start-page",
   templateUrl: "./start-page.component.html",
   styleUrls: [
      "./start-page.component.scss"
   ]
})
export class StartPageComponent{
	@ViewChild(NewTodoModalComponent)
	private newTodoModalComponent: NewTodoModalComponent;
	@ViewChild(AppointmentModalComponent)
	private newAppointmentModalComponent: AppointmentModalComponent;

	constructor(public dataService: DataService){
		fontawesome.library.add(solid);
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

   ShowModal(index){
		if(index == 0){
			// Show the appointment modal
			this.newAppointmentModalComponent.Show();
		}else{
			// Show the todo modal
			this.newTodoModalComponent.Show();
		}
	}

	CreateTodo(todo){
		this.dataService.AddTodo(todo);
	}

	CreateAppointment(appointment){
		this.dataService.AddAppointment(appointment);
	}

	public async DeleteTodo(todo: Todo){
		this.dataService.RemoveTodo(todo);
	}
}