import { BrowserModule } from "@angular/platform-browser"
import { FormsModule } from "@angular/forms"
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core"
import { RouterModule } from "@angular/router"
import { NgbModule } from "@ng-bootstrap/ng-bootstrap"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { ServiceWorkerModule } from "@angular/service-worker"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { MatButtonModule } from "@angular/material/button"
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { MatTreeModule } from "@angular/material/tree"
import { DragulaModule } from "ng2-dragula"
import { Environment } from "dav-js"
import { environment } from "src/environments/environment"

// Pages
import { OverviewPageComponent } from "./pages/overview-page/overview-page.component"
import { TodosPageComponent } from "./pages/todos-page/todos-page.component"
import { AppointmentsPageComponent } from "./pages/appointments-page/appointments-page.component"
import { UserPageComponent } from "./pages/user-page/user-page.component"
import { SettingsPageComponent } from "./pages/settings-page/settings-page.component"
import { CalendarPageComponent } from "./pages/calendar-page/calendar-page.component"
import { CalendarDayPageComponent } from "./pages/calendar-day-page/calendar-day-page.component"
import { TodoListPageComponent } from "./pages/todo-list-page/todo-list-page.component"

// Components
import { AppComponent } from "./app.component"
import { TodoListItemComponent } from "./components/todo-list-item/todo-list-item.component"
import { SmallTodoListItemComponent } from "./components/small-todo-list-item/small-todo-list-item.component"
import { TodoItemComponent } from "./components/todo-item/todo-item.component"
import { SmallTodoItemComponent } from "./components/small-todo-item/small-todo-item.component"
import { AppointmentItemComponent } from "./components/appointment-item/appointment-item.component"
import { SmallAppointmentItemComponent } from "./components/small-appointment-item/small-appointment-item.component"
import { NewTodoModalComponent } from "./components/new-todo-modal/new-todo-modal.component"
import { AppointmentModalComponent } from "./components/appointment-modal/appointment-modal.component"
import { TodoListModalComponent } from "./components/todo-list-modal/todo-list-modal.component"
import { DeleteTodoListModalComponent } from "./components/delete-todo-list-modal/delete-todo-list-modal.component"
import { TodoGroupBadgeComponent } from "./components/todo-group-badge/todo-group-badge.component"
import { SetTodoGroupsComponent } from "./components/set-todo-groups/set-todo-groups.component"
import { SetNameComponent } from "./components/set-name/set-name.component"
import { TodoListTreeComponent } from "./components/todo-list-tree/todo-list-tree.component"

// Dialogs
import { CreateAppointmentDialogComponent } from "./dialogs/create-appointment-dialog/create-appointment-dialog.component"
import { CreateTodoDialogComponent } from "./dialogs/create-todo-dialog/create-todo-dialog.component"
import { DeleteAppointmentDialogComponent } from "./dialogs/delete-appointment-dialog/delete-appointment-dialog.component"
import { LogoutDialogComponent } from "./dialogs/logout-dialog/logout-dialog.component"

// Services
import { DataService } from "./services/data-service"
import { LocalizationService } from "./services/localization-service"
import { SettingsService } from "./services/settings-service"

@NgModule({
	declarations: [
		// Pages
		OverviewPageComponent,
		TodosPageComponent,
		AppointmentsPageComponent,
		UserPageComponent,
		SettingsPageComponent,
		CalendarPageComponent,
		CalendarDayPageComponent,
		TodoListPageComponent,
		// Components
		AppComponent,
		TodoListItemComponent,
		SmallTodoListItemComponent,
		TodoItemComponent,
		SmallTodoItemComponent,
		AppointmentItemComponent,
		SmallAppointmentItemComponent,
		NewTodoModalComponent,
		AppointmentModalComponent,
		TodoListModalComponent,
		DeleteTodoListModalComponent,
		TodoGroupBadgeComponent,
		SetTodoGroupsComponent,
		SetNameComponent,
		TodoListTreeComponent,
		// Dialogs
		CreateAppointmentDialogComponent,
		CreateTodoDialogComponent,
		DeleteAppointmentDialogComponent,
		LogoutDialogComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		RouterModule.forRoot([
			{ path: "", component: OverviewPageComponent },
			{ path: "calendar", component: CalendarPageComponent },
			{
				path: "calendar/:year/:month/:day",
				component: CalendarDayPageComponent
			},
			{ path: "todos", component: TodosPageComponent },
			{ path: "appointments", component: AppointmentsPageComponent },
			{ path: "todolist/:uuid", component: TodoListPageComponent },
			{ path: "user", component: UserPageComponent },
			{ path: "settings", component: SettingsPageComponent }
		]),
		NgbModule,
		FontAwesomeModule,
		ServiceWorkerModule.register("sw.js", {
			enabled:
				environment.environment == Environment.Staging ||
				environment.environment == Environment.Production
		}),
		BrowserAnimationsModule,
		MatButtonModule,
		MatSnackBarModule,
		MatTreeModule,
		DragulaModule.forRoot()
	],
	providers: [DataService, LocalizationService, SettingsService],
	bootstrap: [AppComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
