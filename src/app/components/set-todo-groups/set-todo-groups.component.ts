import { Component, Input, Output, EventEmitter } from "@angular/core"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { GetAllTodoGroups } from "src/app/models/Todo"
import { LocalizationService } from "src/app/services/localization-service"

@Component({
	selector: "calendo-set-todo-groups",
	templateUrl: "./set-todo-groups.component.html"
})
export class SetTodoGroupsComponent {
	locale = this.localizationService.locale.setTodoGroups
	faPlus = faPlus
	existingGroups: string[] = []
	todoGroups: string[] = []
	@Input() initialGroups: string[] = []
	@Output() groupsChanged = new EventEmitter<string[]>()
	newGroupName: string = ""
	groupTextFieldStyle = {
		root: {
			width: 250
		}
	}

	constructor(private localizationService: LocalizationService) {
		this.GetAllTodoGroups()
	}

	ngAfterViewInit() {
		GetAllTodoGroups()

		// Add the initial groups to the groups
		this.initialGroups.forEach(group => {
			this.todoGroups.push(group)

			// If existingGroups contains this group, remove it there
			let i = this.existingGroups.indexOf(group)
			if (i != -1) {
				this.existingGroups.splice(i, 1)
			}
		})
	}

	async GetAllTodoGroups() {
		this.existingGroups = []
		var todoGroups = await GetAllTodoGroups()
		todoGroups.forEach(group => {
			// Check if the group is already selected
			if (this.todoGroups.findIndex(g => g == group) == -1) {
				this.existingGroups.push(group)
			}
		})
	}

	AddGroup(name: string) {
		name = name.trim()
		if (name.length > 0 && this.todoGroups.findIndex(g => g == name) == -1) {
			this.todoGroups.push(name)

			// Remove the group from existingGroups
			var index = this.existingGroups.findIndex(g => g == name)

			if (index !== -1) {
				this.existingGroups.splice(index, 1)
			}

			this.TriggerGroupsUpdate(this.todoGroups)
		}
	}

	RemoveGroup(name: string) {
		name = name.trim()
		var index = this.todoGroups.findIndex(g => g == name)

		if (index !== -1) {
			this.todoGroups.splice(index, 1)
			this.GetAllTodoGroups()

			this.TriggerGroupsUpdate(this.todoGroups)
		}
	}

	AddButtonClick() {
		this.AddGroup(this.newGroupName)
		this.newGroupName = ""
	}

	NameChanged() {
		setTimeout(() => {
			// Update the groups in the parent element with the group name in the text field
			if (
				this.newGroupName.trim().length > 0 &&
				this.todoGroups.findIndex(g => g == this.newGroupName) == -1
			) {
				this.TriggerGroupsUpdate([...this.todoGroups, this.newGroupName])
			} else {
				this.TriggerGroupsUpdate(this.todoGroups)
			}
		}, 1)
	}

	TriggerGroupsUpdate(groups: string[]) {
		this.groupsChanged.emit(groups)
	}
}
