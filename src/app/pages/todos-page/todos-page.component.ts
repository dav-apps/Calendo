import { Component } from '@angular/core';
import { Todo } from '../../models/Todo';
import { DataService } from '../../services/data-service';

@Component({
   selector: "calendo-todos-page",
   templateUrl: "./todos-page.component.html",
   styleUrls: [
      "./todos-page.component.scss"
   ]
})
export class TodosPageComponent{

	constructor(public dataService: DataService){}

	ngOnInit(){}

	async DeleteTodo(todo: Todo){
		await todo.Delete();

		// Find the todo in one of the arrays
		var index = this.dataService.todoDaysWithoutDate.todos.findIndex(t => t.uuid == todo.uuid);

		if(index !== -1){
			this.dataService.todoDaysWithoutDate.todos.splice(index, 1);
		}else{
			this.dataService.todoDays.forEach(todoDay => {
				index = todoDay["todos"].findIndex(t => t.uuid == todo.uuid);

				if(index !== -1){
					todoDay["todos"].splice(index, 1);
				}
			});
		}
	}
}