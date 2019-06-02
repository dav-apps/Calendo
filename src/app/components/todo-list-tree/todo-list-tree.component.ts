import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject } from 'rxjs';
import { IIconStyles } from 'office-ui-fabric-react';
import { Todo, GetTodo } from '../../models/Todo';
import { TodoList, GetTodoList } from '../../models/TodoList';
import { generateUUID } from 'dav-npm';
import { enUS } from '../../../locales/locales';
import { DataService } from 'src/app/services/data-service';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { DeleteTodoListModalComponent } from '../delete-todo-list-modal/delete-todo-list-modal.component';
import { TodoListModalComponent } from '../todo-list-modal/todo-list-modal.component';

@Component({
	selector: "calendo-todo-list-tree",
	templateUrl: "./todo-list-tree.component.html"
})
export class TodoListTreeComponent{
	locale = enUS.todoListTree;
	faTimes = faTimes;
	dataSource: MatTreeNestedDataSource<TodoNode>;
	treeControl: NestedTreeControl<TodoNode>;
	dataChange: BehaviorSubject<TodoNode[]> = new BehaviorSubject<TodoNode[]>([]);
	@ViewChild('todoListModal') todoListModal: TodoListModalComponent;
   @ViewChild('deleteTodoListModal') deleteTodoListModal: DeleteTodoListModalComponent;
	@Input()
	todoList: TodoList;
	@Input()
   showRoot: boolean = false;
   @Input()
   readonly: boolean = false;
   @Output()
   update = new EventEmitter();
	rootTodoItem: TodoNode = {
		uuid: this.todoList ? this.todoList.uuid : "",
		name: this.todoList ? this.todoList.name : "",
		list: true,
		children: [],
		completed: false,
		completedCount: 0,
		newTodo: false,
		newTodoList: false,
		groups: this.todoList ? this.todoList.groups : []
	}
	todoItems: TodoNode[] = [];
	inputValue: string = "";
	chevronIconStyles: IIconStyles = {
		root: {
			fontSize: 14
		}
	}
	checkIconStyles: IIconStyles = {
		root: {
			fontSize: 15,
			color: "#1da520"
		}
	}

	constructor(public dataService: DataService){
      this.locale = this.dataService.GetLocale().todoListTree;
		this.dataSource = new MatTreeNestedDataSource();
		this.treeControl = new NestedTreeControl<TodoNode>((dataNode: TodoNode) => dataNode.children);

		this.dataChange.subscribe(data => this.dataSource.data = data);
	}

	hasNestedChild = (i: number, nodeData: TodoNode) => { return nodeData.list && !nodeData.newTodoList };

	ngOnInit(){
		this.AddTodoItems(this.todoList, this.todoItems);

		this.rootTodoItem = {
			uuid: this.todoList.uuid,
			name: this.todoList.name,
			list: true,
			children: this.todoItems,
			completed: false,
			completedCount: 0,
			newTodo: false,
			newTodoList: false,
			groups: this.todoList.groups
		}
		
		this.LoadTodoListCompletedCount(this.rootTodoItem);
		this.dataChange.next(this.showRoot ? [this.rootTodoItem] : this.todoItems);
	}

	FindNodeInTree(uuid: string, rootItem: TodoNode) : TodoNode{
		for(let item of rootItem.children){
			if(item.uuid == uuid){
				return item;
			}else if(item.list){
				let foundItem = this.FindNodeInTree(uuid, item);
				if(foundItem){
					return foundItem;
				}
			}
		}

		return null;
	}

	FindParentNodeInTree(uuid: string, rootItem: TodoNode) : TodoNode{
		for(let item of rootItem.children){
			if(item.uuid == uuid){
				return rootItem;
			}else if(item.list){
				let foundItem = this.FindParentNodeInTree(uuid, item);
				if(foundItem){
					return foundItem;
				}
			}
		}

		return null;
	}

	AddTodoItems(todoList: TodoList, todoItems: TodoNode[]){
		// Create a todoNode for each todo and todoList in the TodoList
		todoList.todos.forEach((todo: Todo) => {
			todoItems.push({
				uuid: todo.uuid,
				name: todo.name,
				list: false,
				children: [],
				completed: todo.completed,
				completedCount: 0,
				newTodo: false,
				newTodoList: false,
				groups: []
			});
		});

		todoList.todoLists.forEach((todoList: TodoList) => {
			let newTodoItems: TodoNode[] = [];
			this.AddTodoItems(todoList, newTodoItems);
			
			todoItems.push({
				uuid: todoList.uuid,
				name: todoList.name,
				list: true,
				children: newTodoItems,
				completed: false,
				completedCount: 0,
				newTodo: false,
				newTodoList: false,
				groups: []
			});
		});
	}

	ReloadTree(){
		this.dataChange.next([]);
      this.dataChange.next(this.showRoot ? [this.rootTodoItem] : this.todoItems);
      this.LoadTodoListCompletedCount(this.rootTodoItem);
		this.update.emit();
	}

	LoadTodoListCompletedCount(rootItem: TodoNode){
		let todosCompleted: number = 0;

		rootItem.children.forEach((item: TodoNode) => {
			if(!item.list){
				// Todo
				if(item.completed){
					todosCompleted++;
				}
			}else{
				// Todo list
				this.LoadTodoListCompletedCount(item);
				if(item.completedCount == this.GetNodeChildrenCount(item)){
					todosCompleted++;
				}
			}
		});

		rootItem.completedCount = todosCompleted;
	}

	GetNodeChildrenCount(node: TodoNode){
		let children = 0;
		node.children.forEach(item => !item.newTodo && !item.newTodoList ? children++ : 0 )
		return children;
   }

   RemoveAllInputNodes(){
		this.RemoveInputNodes(this.todoItems);
		
		// Update the UI
		this.inputValue = "";
		this.dataChange.next([]);
      this.dataChange.next(this.showRoot ? [this.rootTodoItem] : this.todoItems);
   }

   RemoveInputNodes(todoNodes: TodoNode[]){
      let removeNodes: TodoNode[] = [];

      for(let node of todoNodes){
         if(node.newTodo || node.newTodoList){
            // Remove the node
            removeNodes.push(node);
         }else if(node.list){
            this.RemoveInputNodes(node.children);
         }
		}
		
		for(let node of removeNodes){
			let index = todoNodes.indexOf(node);
			if(index != -1){
				todoNodes.splice(index, 1);
			}
		}
   }

	AddInputToTodoList(todo: TodoNode, list: boolean = false){
		// Remove all input nodes
		this.RemoveAllInputNodes();

		// Insert the input node
		let newTodoNode = {
			uuid: generateUUID(),
			name: "",
			list,
			children: [],
			completed: false,
			completedCount: 0,
			newTodo: !list,
			newTodoList: list,
			groups: []
		}

		if(list){
			// Add the node at the end of the children
			todo.children.push(newTodoNode);
		}else{
			// Add the node at the end of the todos
			let index = todo.children.findIndex(item => item.list);
			if(index == -1){
				todo.children.push(newTodoNode);
			}else{
				todo.children.splice(index, 0, newTodoNode);
			}
		}

		// Update the UI
		this.dataChange.next([]);
      this.dataChange.next(this.showRoot ? [this.rootTodoItem] : this.todoItems);
      this.treeControl.expand(todo);
	}

	async ChangeInputToNode(node: TodoNode, list: boolean = false){
		if(list){
			node.name = this.inputValue;
			node.list = true;
			node.newTodo = false;
			node.newTodoList = false;

			// Create the todo list
			let parentNode = this.FindParentNodeInTree(node.uuid, this.rootTodoItem);

			if(parentNode){
				let todoList = await TodoList.Create(node.name, this.todoList.time, [], [], [], parentNode.uuid, node.uuid);

				// Update the parent todo list
				let parentTodoList = await GetTodoList(parentNode.uuid);
				if(parentTodoList){
					await parentTodoList.AddTodoList(todoList);
				}
			}
		}else{
			node.name = this.inputValue;
			node.list = false;
			node.newTodo = false;
			node.newTodoList = false;

			// Create the todo
			let parentNode = this.FindParentNodeInTree(node.uuid, this.rootTodoItem);
			
			if(parentNode){
				let todo = await Todo.Create(node.name, false, this.todoList.time, [], parentNode.uuid, null, node.uuid);

				// Update the todo list
				let parentTodoList = await GetTodoList(parentNode.uuid);
				if(parentTodoList){
					await parentTodoList.AddTodo(todo);
				}
			}
		}

		// Update the count of the completed children in the parent
		this.LoadTodoListCompletedCount(this.rootTodoItem);

		// Update the UI
		this.inputValue = "";
		this.ReloadTree();
	}

	//#region Event handlers
	async ToggleTodoCheckbox(uuid: string){
		// Find the todo in the tree and change the completed value
		let item = this.FindNodeInTree(uuid, this.rootTodoItem);

		if(item){
			item.completed = !item.completed;
			this.LoadTodoListCompletedCount(this.rootTodoItem);

			// Update the todo
			let todo = await GetTodo(uuid);

			if(todo){
            await todo.SetCompleted(item.completed);
				this.update.emit();
			}
		}
	}

	async DeleteTodo(uuid: string){
		// Get the todo and delete it
		let todo = await GetTodo(uuid);
		await todo.Delete();

		// Remove the todo from the todo list
		let todoList = await GetTodoList(this.todoList.uuid);
		if(todoList){
			await todoList.RemoveTodo(uuid);
		}

		// Remove the todo from the tree
		let node = this.FindParentNodeInTree(uuid, this.rootTodoItem);
		if(node){
			let index = node.children.findIndex(child => child.uuid == uuid);
			if(index !== -1){
				node.children.splice(index, 1);
				this.ReloadTree();
			}
		}
	}

	ShowEditTodoListModal(node: TodoNode){
		
	}

	UpdateTodoList(todoList: TodoList){

	}

	ShowDeleteTodoListModal(node: TodoNode){

	}

	DeleteTodoList(todoList: TodoList){

	}
	//#endregion
}

interface TodoNode{
	uuid: string;
	name: string;
	list: boolean;
	children: TodoNode[];
	completed: boolean;
	completedCount: number;
	newTodo: boolean;
	newTodoList: boolean;
	groups: string[];
}