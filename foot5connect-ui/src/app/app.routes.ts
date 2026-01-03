import { Routes } from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
import {RegisterComponent} from './pages/register/register.component';
import {ConfirmRegisterComponent} from './pages/confirm-register/confirm-register.component';
import {AccessDeniedComponent} from './pages/access-denied/access-denied.component';

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
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'confirm-register',
    component: ConfirmRegisterComponent
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent
  }
];
