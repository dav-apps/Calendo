import { Component } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject } from 'rxjs';
import { IIconStyles } from 'office-ui-fabric-react';

@Component({
	selector: "calendo-todo-list-tree",
	templateUrl: "./todo-list-tree.component.html"
})
export class TodoListTreeComponent{
	dataSource: MatTreeNestedDataSource<TodoNode>;
	treeControl: NestedTreeControl<TodoNode>;
	dataChange: BehaviorSubject<TodoNode[]> = new BehaviorSubject<TodoNode[]>([]);
	todoItems: TodoNode[] = [
		{name: "TodoItem 1", children: []},
		{name: "Second Todo item", children: [
			{name: "First nested todo item", children: [
            {name: "Second nested todo item", children: [
               {name: "Third nested todo item", children: []}
            ]}
         ]}
		]}
	]
	iconStyles: IIconStyles = {
		root: {
			fontSize: 14
		}
	}

	constructor(){
		this.dataSource = new MatTreeNestedDataSource();
		this.treeControl = new NestedTreeControl<TodoNode>((dataNode: TodoNode) => dataNode.children);

		this.dataChange.subscribe(data => this.dataSource.data = data);

		this.dataChange.next(this.todoItems);
	}

	hasNestedChild = (i: number, nodeData: TodoNode) => { return nodeData.children.length > 0 };
}

interface TodoNode{
	children: TodoNode[];
	name: string;
}