import { BrowserModule } from "@angular/platform-browser"
import { FormsModule } from "@angular/forms"
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core"
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome"
import { ServiceWorkerModule } from "@angular/service-worker"
import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import { DragulaModule } from "ng2-dragula"
import { Environment } from "dav-js"
import { environment } from "src/environments/environment"

// Local modules
import { AppRoutingModule } from "./app-routing.module"

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
import { TodoItemComponent } from "./components/todo-item/todo-item.component"
import { AppointmentItemComponent } from "./components/appointment-item/appointment-item.component"
import { TodoListTreeComponent } from "./components/todo-list-tree/todo-list-tree.component"
import { TodoListTreeItemComponent } from "./components/todo-list-tree-item/todo-list-tree-item.component"

// Dialogs
import { AppointmentDialogComponent } from "./dialogs/appointment-dialog/appointment-dialog.component"
import { DeleteAppointmentDialogComponent } from "./dialogs/delete-appointment-dialog/delete-appointment-dialog.component"
import { TodoDialogComponent } from "./dialogs/todo-dialog/todo-dialog.component"
import { TodoListSubItemDialogComponent } from "./dialogs/todo-list-sub-item-dialog/todo-list-sub-item-dialog.component"
import { DeleteTodoListDialogComponent } from "./dialogs/delete-todo-list-dialog/delete-todo-list-dialog.component"
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
		TodoItemComponent,
		AppointmentItemComponent,
		TodoListTreeComponent,
		TodoListTreeItemComponent,
		// Dialogs
		AppointmentDialogComponent,
		DeleteAppointmentDialogComponent,
		TodoDialogComponent,
		TodoListSubItemDialogComponent,
		DeleteTodoListDialogComponent,
		LogoutDialogComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		AppRoutingModule,
		FontAwesomeModule,
		ServiceWorkerModule.register("sw.js", {
			enabled:
				environment.environment == Environment.Staging ||
				environment.environment == Environment.Production
		}),
		BrowserAnimationsModule,
		DragulaModule.forRoot()
	],
	providers: [DataService, LocalizationService, SettingsService],
	bootstrap: [AppComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
