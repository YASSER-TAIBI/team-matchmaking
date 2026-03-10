import { Routes } from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {ConfirmRegisterComponent} from './pages/confirm-register/confirm-register.component';
import {AccessDeniedComponent} from './pages/access-denied/access-denied.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { AvailablePlayersComponent } from './pages/available-players/available-players.component';
import { TeamComponent } from './pages/team/team.component';
import { TeamCreateComponent } from './pages/team-create/team-create.component';
import { TeamConditionsComponent } from './pages/team-conditions/team-conditions.component';
import { TeamInvitationsComponent } from './pages/team-invitations/team-invitations.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'confirm-register',
    component: ConfirmRegisterComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent
  },
  {
    path: 'user',
    component: MainPageComponent,
    children: [
      {
        path: 'dashboard',
        component: UserDashboardComponent
      },
      {
        path: 'available-players',
        component: AvailablePlayersComponent
      },
      {
        path: 'invitations',
        component: TeamInvitationsComponent
      },
      {
        path: 'team',
        component: TeamComponent
      },
      {
        path: 'team/create',
        component: TeamCreateComponent
      },
      {
        path: 'team/conditions',
        component: TeamConditionsComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: "full"
      }
    ]

  }

];
