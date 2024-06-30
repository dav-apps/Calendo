import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { OverviewPageComponent } from "./pages/overview-page/overview-page.component"
import { TodosPageComponent } from "./pages/todos-page/todos-page.component"
import { AppointmentsPageComponent } from "./pages/appointments-page/appointments-page.component"
import { UserPageComponent } from "./pages/user-page/user-page.component"
import { SettingsPageComponent } from "./pages/settings-page/settings-page.component"
import { CalendarPageComponent } from "./pages/calendar-page/calendar-page.component"
import { CalendarDayPageComponent } from "./pages/calendar-day-page/calendar-day-page.component"
import { TodoListPageComponent } from "./pages/todo-list-page/todo-list-page.component"

const routes: Routes = [
	{ path: "", component: OverviewPageComponent },
	{ path: "calendar", component: CalendarPageComponent },
	{ path: "calendar/:year/:month", component: CalendarPageComponent },
	{
		path: "calendar/:year/:month/:day",
		component: CalendarDayPageComponent
	},
	{ path: "todos", component: TodosPageComponent },
	{ path: "appointments", component: AppointmentsPageComponent },
	{ path: "todolist/:uuid", component: TodoListPageComponent },
	{ path: "user", component: UserPageComponent },
	{ path: "settings", component: SettingsPageComponent }
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
