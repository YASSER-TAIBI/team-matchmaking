import { Routes } from '@angular/router';
import {LoginComponent} from './pages/login/login.component';
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
    path: 'confirm-register',
    component: ConfirmRegisterComponent
  },
  {
    path: 'access-denied',
    component: AccessDeniedComponent
  }
];
