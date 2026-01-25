import { Routes } from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {ConfirmRegisterComponent} from './pages/confirm-register/confirm-register.component';
import {AccessDeniedComponent} from './pages/access-denied/access-denied.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';

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
        path: '',
        redirectTo: 'dashboard',
        pathMatch: "full"
      }
    ]

  }

];
