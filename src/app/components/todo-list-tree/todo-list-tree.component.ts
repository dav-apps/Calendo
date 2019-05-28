import { Component, Input } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject } from 'rxjs';
import { IIconStyles } from 'office-ui-fabric-react';
import { Todo } from '../../models/Todo';
import { TodoList } from '../../models/TodoList';

@Component({
	selector: "calendo-todo-list-tree",
	templateUrl: "./todo-list-tree.component.html"
})
export class TodoListTreeComponent{
	dataSource: MatTreeNestedDataSource<TodoNode>;
	treeControl: NestedTreeControl<TodoNode>;
	dataChange: BehaviorSubject<TodoNode[]> = new BehaviorSubject<TodoNode[]>([]);
	rootTodoItem: TodoNode;
	todoItems: TodoNode[] = [];
	iconStyles: IIconStyles = {
		root: {
			fontSize: 14
		}
	}

	todoList: TodoList = new TodoList(
		"1234567",
		"First todo list",
		0,
		[
			new Todo("123456", "Todo 1", false, 0, [], null),
      	new Todo("234567", "Todo 2", false, 0, [], null),
      	new Todo("345678", "Todo 3", false, 0, [], null),
      	new Todo("456789", "Todo 4", false, 0, [], null),
		],
		[
			new TodoList("23456789", "Hello World 1", 0, [
				new Todo("9289585", "Hello World Todo 1", true, 0, [], null),
			], [
				new TodoList("213123", "Nested TodoList", 0, [
					new Todo("8792", "Nested Todo 1", false, 0, [], null),
					new Todo("03420234", "Nested Todo 2", true, 0, [], null)
				], [], [])
			], [])
		]
	)

	constructor(){
		this.dataSource = new MatTreeNestedDataSource();
		this.treeControl = new NestedTreeControl<TodoNode>((dataNode: TodoNode) => dataNode.children);

		this.dataChange.subscribe(data => this.dataSource.data = data);

		this.dataChange.next(this.todoItems);
	}

	hasNestedChild = (i: number, nodeData: TodoNode) => { return nodeData.children.length > 0 };

	ngOnInit(){
		this.AddTodoItems(this.todoList, this.todoItems);
		this.dataChange.next(this.todoItems);

		this.rootTodoItem = {
			uuid: this.todoList.uuid,
			name: this.todoList.name,
			children: this.todoItems,
			completed: false,
			completedCount: 0,
			newTodo: false,
			newTodoList: false
		}
		
		this.LoadTodoListCompletedCount(this.rootTodoItem);
	}

	ToggleTodoCheckbox(uuid: string){
		// Find the todo in the tree and change the completed value
		let item = this.FindTodoInTree(uuid, this.rootTodoItem);
		item.completed = !item.completed;
		this.LoadTodoListCompletedCount(this.rootTodoItem);
	}

	FindTodoInTree(uuid: string, rootItem: TodoNode) : TodoNode{
		for(let item of rootItem.children){
			if(item.children.length == 0 && item.uuid == uuid){
				return item;
			}else if(item.children.length > 0){
				let foundItem = this.FindTodoInTree(uuid, item);
				if(foundItem){
					return foundItem;
				}
			}
		}

		return null;
	}

	AddTodoItems(todoList: TodoList, todoItems: TodoNode[]){
		todoList.todos.forEach((todo: Todo) => {
			todoItems.push({
				uuid: todo.uuid,
				name: todo.name,
				children: [],
				completed: todo.completed,
				completedCount: 0,
				newTodo: false,
				newTodoList: false
			});
		});

		todoList.todoLists.forEach((todoList: TodoList) => {
			let newTodoItems: TodoNode[] = [];
			this.AddTodoItems(todoList, newTodoItems);
			
			todoItems.push({
				uuid: todoList.uuid,
				name: todoList.name,
				children: newTodoItems,
				completed: false,
				completedCount: 0,
				newTodo: false,
				newTodoList: false
			});
		});
	}

	LoadTodoListCompletedCount(rootItem: TodoNode){
		let todosCompleted: number = 0;

		rootItem.children.forEach((item: TodoNode) => {
			if(item.children.length == 0){
				// Todo
				if(item.completed){
					todosCompleted++;
				}
			}else{
				// Todo list
				this.LoadTodoListCompletedCount(item);
				if(item.completedCount == item.children.length){
					todosCompleted++;
				}
			}
		});

		rootItem.completedCount = todosCompleted;
	}
}

interface TodoNode{
	uuid: string;
	name: string;
	children: TodoNode[];
	completed: boolean;
	completedCount: number;
	newTodo: boolean;
	newTodoList: boolean;
}