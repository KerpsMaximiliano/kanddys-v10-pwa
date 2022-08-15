import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { Authentication } from './pages/authentication/authentication.component';
import { UserCreatorComponent } from './pages/user-creator/user-creator.component';
import { LoginComponent } from './pages/login-screen/login.component';

const routes: Routes = [
  {
    path: 'authentication',
    component: Authentication,
  },
  {
    path: 'authentication/:itemId',
    component: Authentication,
  },
  {
    path: 'user-creator',
    component: UserCreatorComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
];

@NgModule({
  declarations: [Authentication, UserCreatorComponent, LoginComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class AuthModule {}
