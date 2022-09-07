import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WebformsClientComponent } from './webforms-client/webforms-client.component';
import { TagListComponent } from './pages/tag-list/tag-list.component';
import { WebformComponent } from './pages/webform/webform.component';
import { WebformClientComponent } from './pages/webform-client/webform-client.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  {
    path: ':webformId',
    component: WebformsClientComponent,
    children: [
      {
        path: 'tag-list',
        component: TagListComponent,
      },
      {
        path: 'webform-client',
        component: WebformClientComponent,
      },
      {
        path: '',
        component: WebformComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    WebformsClientComponent,
    TagListComponent,
    WebformClientComponent,
    WebformComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class ClientModule {}
