import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IIconStyles } from 'office-ui-fabric-react';
import { Todo, GetTodo } from '../../models/Todo';
import { TodoList, GetTodoList } from '../../models/TodoList';
import { generateUUID } from 'dav-npm';
import { enUS } from '../../../locales/locales';
import { DataService } from 'src/app/services/data-service';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { DeleteTodoListModalComponent } from '../delete-todo-list-modal/delete-todo-list-modal.component';
import { UpgradeRequiredModalComponent } from '../upgrade-required-modal/upgrade-required-modal.component';
import { DragulaService } from 'ng2-dragula';
declare var $: any;

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
	subs = new Subscription();    // Holds all subscriptions
	@ViewChild('deleteTodoListModal', { static: true }) deleteTodoListModal: DeleteTodoListModalComponent;
   @ViewChild('upgradeRequiredModal', { static: true }) upgradeRequiredModal: UpgradeRequiredModalComponent;
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
		editTodoList: false,
		groups: this.todoList ? this.todoList.groups : [],
		item: this.todoList
	}
	todoItems: TodoNode[] = [];
	inputValue: string = "";
	dropEventFired: boolean = false;
	chevronIconStyles: IIconStyles = {
		root: {
         fontSize: 14,
         marginBottom: 20
		}
	}
	checkIconStyles: IIconStyles = {
		root: {
			fontSize: 15,
			color: "#1da520"
		}
	}

	constructor(
      public dataService: DataService,
		public router: Router,
		private dragula: DragulaService
   ){
      this.locale = this.dataService.GetLocale().todoListTree;
		this.dataSource = new MatTreeNestedDataSource();
		this.treeControl = new NestedTreeControl<TodoNode>((dataNode: TodoNode) => dataNode.children);
	}

	hasNestedChild = (i: number, nodeData: TodoNode) => { return nodeData.list && !nodeData.newTodoList };

	ngOnInit(){
		this.subs.add(this.dataChange.subscribe(data => this.dataSource.data = data));
		this.subs.add(this.dragula.drop().subscribe(async value => await this.HandleDrop(value)));

		this.Init();
	}

	async HandleDrop(value: {name: string, el: Element, target: Element, source: Element, sibling: Element}){
		if(this.dropEventFired) return;
		this.dropEventFired = true;

		if(value.source == value.target){
			// The item was moved within the list; update the parent element
			let parentUuid: string;
			let parentElement = value.el.parentElement;
			if(parentElement.tagName == "DIV"){
				parentUuid = parentElement.parentElement.id;
			}else if(parentElement.tagName == "MAT-TREE"){
				parentUuid = this.rootTodoItem.uuid;
			}else{
				parentUuid = parentElement.id;
			}

			let parentNode = this.FindNodeInTree(parentUuid, this.rootTodoItem);
			let newOrderItems: TodoNode[] = [];

			let children = value.el.parentElement.children;
			for(let i = 0; i < children.length; i++){
				let child = children.item(i);
				let uuid = child.id;
				
				// Find the node in the parent node children and add it to the new order array
				let item = parentNode.children.find(node => node.uuid == uuid)
				if(item) newOrderItems.push(item);
			}

			// Set the parent node children to the new order items
			parentNode.children = newOrderItems;
			
			if(parentNode == this.rootTodoItem){
				this.todoItems = newOrderItems;
			}

			// Update the todo list
			await this.UpdateTodoListOrder(parentNode);
		}else{
			// The item was moved into another list; update the order of the two parent elements
			// TODO
		}

		this.dropEventFired = false;
	}

	public Init(){
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
			editTodoList: false,
			groups: this.todoList.groups,
			item: this.todoList
		}
		
		this.LoadTodoListCompletedCount(this.rootTodoItem);
		this.dataChange.next(this.showRoot ? [this.rootTodoItem] : this.todoItems);
	}

	ngOnDestroy(){
		this.subs.unsubscribe();
	}

	async UpdateTodoListOrder(node: TodoNode){
		if(!node.list || !(node.item instanceof TodoList)) return;

		let items: (Todo | TodoList)[] = [];
		node.children.forEach((child: TodoNode) => items.push(child.item));

		await node.item.SetItems(items);
	}

	/**
	 * Finds the node with the given uuid and returns it
	 * @param uuid The uuid of the node to search for
	 * @param rootItem The parent in which the node should be searched for
	 */
	FindNodeInTree(uuid: string, rootItem: TodoNode) : TodoNode{
		if(rootItem.uuid == uuid) return rootItem;

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

	/**
	 * Finds the parent of the node with the given uuid and returns it
	 * @param uuid The uuid of the node of which the parent is searched for
	 * @param rootItem The parent in which the node should be searched for
	 */
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
		todoList.items.forEach((item: Todo | TodoList) => {
			if(item instanceof Todo){
				todoItems.push({
					uuid: item.uuid,
					name: item.name,
					list: false,
					children: [],
					completed: item.completed,
					completedCount: 0,
					newTodo: false,
					newTodoList: false,
					editTodoList: false,
					groups: [],
					item: item
				});
			}else{
				let newTodoItems: TodoNode[] = [];
				this.AddTodoItems(item, newTodoItems);

				todoItems.push({
					uuid: item.uuid,
					name: item.name,
					list: true,
					children: newTodoItems,
					completed: false,
					completedCount: 0,
					newTodo: false,
					newTodoList: false,
					editTodoList: false,
					groups: [],
					item
				});
			}
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
		// Check if user is on dav Plus to create nested todo lists
      if(list && (!this.dataService.user.IsLoggedIn || this.dataService.user.Plan == 0)){
			this.upgradeRequiredModal.Show(0, 0);
			return;
		}

		// Remove all input nodes
		this.RemoveAllInputNodes();

		// Insert the input node
		let newTodoNode: TodoNode = {
			uuid: generateUUID(),
			name: "",
			list,
			children: [],
			completed: false,
			completedCount: 0,
			newTodo: !list,
			newTodoList: list,
			editTodoList: false,
			groups: [],
			item: null
		}
		
		// Add the node at the end of the children
		todo.children.push(newTodoNode);

		// Update the UI
		this.dataChange.next([]);
      this.dataChange.next(this.showRoot ? [this.rootTodoItem] : this.todoItems);
      this.treeControl.expand(todo);

		// Set focus on the text field
		setTimeout(() => $(".ms-TextField-field, .field-65").focus(), 1);
	}

	async ChangeInputToNode(node: TodoNode, list: boolean = false){
		if(this.inputValue.length < 2) return;

		if(list){
			node.name = this.inputValue;
			node.list = true;
			node.newTodo = false;
			node.newTodoList = false;

			// Create the todo list
			let parentNode = this.FindParentNodeInTree(node.uuid, this.rootTodoItem);

			if(parentNode){
				let todoList = await TodoList.Create(node.name, this.todoList.time, [], [], parentNode.uuid, node.uuid);
				node.item = todoList;

				await this.UpdateTodoListOrder(parentNode);
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
				node.item = todo;

				await this.UpdateTodoListOrder(parentNode);
			}
		}

		// Update the count of the completed children in the parent
		this.LoadTodoListCompletedCount(this.rootTodoItem);

		// Update the UI
		this.inputValue = "";
		this.ReloadTree();
	}

	RemoveNode(uuid: string){
		let node = this.FindParentNodeInTree(uuid, this.rootTodoItem);
		if(node){
			let index = node.children.findIndex(child => child.uuid == uuid);
			if(index !== -1){
				node.children.splice(index, 1);
				this.ReloadTree();
			}
		}
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
		let parentNode = this.FindParentNodeInTree(uuid, this.rootTodoItem);

		// Remove the todo from the tree
		this.RemoveNode(uuid);

		if(parentNode){
			await this.UpdateTodoListOrder(parentNode);
		}
	}

	EditTodoList(node: TodoNode){
		// Change the node to input
		node.editTodoList = true;
		this.ReloadTree();
	}

	async UpdateTodoList(node: TodoNode){
		// Save the new name of the todo list
		let list = await GetTodoList(node.uuid);
		await list.SetName(node.name);

		// Remove the input
		node.editTodoList = false;
		this.ReloadTree();
	}

	async ShowDeleteTodoListModal(node: TodoNode){
		// Get the todo list
		let todoList = await GetTodoList(node.uuid);
		if(todoList){
			this.deleteTodoListModal.Show(todoList);
		}
	}

	async RemoveTodoList(todoList: TodoList){
		// Remove the todo list from the parent todo list
		let parentNode = this.FindParentNodeInTree(todoList.uuid, this.rootTodoItem);

		// Remove the todo list from the tree
		this.RemoveNode(todoList.uuid);

		if(parentNode){
			await this.UpdateTodoListOrder(parentNode);
		}
   }
   
   LearnMoreClicked(){
      // Navigate to the Account page
      this.router.navigate(['account']);
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
	editTodoList: boolean;
	groups: string[];
	item: Todo | TodoList;
}