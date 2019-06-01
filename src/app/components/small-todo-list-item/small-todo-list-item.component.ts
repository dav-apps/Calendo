import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data-service';
import { IIconStyles } from 'office-ui-fabric-react';
import { TodoList } from 'src/app/models/TodoList';

@Component({
	selector: "calendo-small-todo-list-item",
	templateUrl: "./small-todo-list-item.component.html"
})
export class SmallTodoListItemComponent{
	@Input()
	todoList: TodoList = new TodoList(null, "");
	totalTodos: number = 0;
	completedTodos: number = 0;
	todoTreeCopy: TodoElement;
	iconStyles: IIconStyles = {
		root: {
			fontSize: 15,
			color: "#1da520"
		}
	}

	constructor(
		public dataService: DataService,
		private router: Router
   ){}
   
   ngOnInit(){
		this.LoadTree();
   }

	LoadTree(){
		// Create a copy of the tree of todoList
		this.todoTreeCopy = {
			uuid: this.todoList.uuid,
			list: true,
			children: [],
			completed: false,
			completedCount: 0
		}

		this.LoadTreeElement(this.todoTreeCopy, this.todoList);
		this.LoadTreeElementCount(this.todoTreeCopy);
		this.totalTodos = this.todoTreeCopy.children.length;
		this.completedTodos = this.todoTreeCopy.completedCount;
	}

	LoadTreeElement(element: TodoElement, todoList: TodoList){
		todoList.todos.forEach(todo => {
			element.children.push({
				uuid: todo.uuid,
				list: false,
				children: [],
				completed: todo.completed,
				completedCount: 0
			});
		});

		todoList.todoLists.forEach(todoList => {
			let newElement: TodoElement = {
				uuid: todoList.uuid,
				list: true,
				children: [],
				completed: false,
				completedCount: 0
			}

			this.LoadTreeElement(newElement, todoList);
			element.children.push(newElement);
		});
	}

	LoadTreeElementCount(rootItem: TodoElement){
		let todosCompleted: number = 0;

		rootItem.children.forEach(item => {
			if(!item.list){
				// Todo
				if(item.completed){
					todosCompleted++;
				}
			}else{
				// Todo list
				this.LoadTreeElementCount(item);
				if(item.completedCount == item.children.length){
					todosCompleted++;
				}
			}
		});
		
		rootItem.completedCount = todosCompleted;
	}

   ShowDetails(){
		this.router.navigate(['todolist', this.todoList.uuid]);
   }
}

interface TodoElement{
	uuid: string;
	list: boolean;
	children: TodoElement[];
	completed: boolean;
	completedCount: number;
}