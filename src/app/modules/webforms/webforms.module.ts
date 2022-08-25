import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './../../shared/shared.module';
import { WebformCreatorComponent } from './pages/webform-creator/webform-creator.component';
import { AnswerMethodWebformComponent } from './pages/answer-method-webform/answer-method-webform.component';
import { AirtableFieldConnectionComponent } from './pages/airtable-field-connection/airtable-field-connection.component';
import { WebformClientComponent } from './pages/webform-client/webform-client.component';
import { WebformDetailComponent } from './pages/webform-detail/webform-detail.component';
import { TagVisitorsDetailComponent } from './pages/tag-visitors-detail/tag-visitors-detail.component';
import { TagListComponent } from './pages/tag-list/tag-list.component';
import { WebformVisitorsComponent } from './pages/webform-visitors/webform-visitors.component';
import { VisitorDetailComponent } from './pages/visitor-detail/visitor-detail.component';
import { QuestionVisitorsGroupComponent } from './pages/question-visitors-group/question-visitors-group.component';
import { QuestionVisitorsListComponent } from './pages/question-visitors-list/question-visitors-list.component';
import { WebformInputSelectorComponent } from './pages/webform-input-selector/webform-input-selector.component';
import { WebformComponent } from './pages/webform/webform.component';

const routes: Routes = [
  {
    path: '',
    component: WebformCreatorComponent,
  },
  {
    path: 'webform-questions',
    component: AnswerMethodWebformComponent
  },
  {
    path: 'airtable-field-connection/:databaseName',
    component: AirtableFieldConnectionComponent
  },
  {
    path: 'webform-client',
    component: WebformClientComponent
  },
  {
    path: 'webform-detail/:id',
    component: WebformDetailComponent
  },
  {
    path: 'tag-visitors-detail/:id',
    component: TagVisitorsDetailComponent
  },
  {
    path: 'tag-list',
    component: TagListComponent
  },
  {
    path: 'webform-visitors/:id',
    component: WebformVisitorsComponent
  },
  {
    path: 'visitor-detail',
    component: VisitorDetailComponent
  },
  {
    path: 'question-visitors-group/:id',
    component: QuestionVisitorsGroupComponent
  },
  {
    path: 'question-visitors-list',
    component: QuestionVisitorsListComponent
  },
  {
    path: 'input-selector',
    component: WebformInputSelectorComponent
  },
  {
    path: 'webform/:id',
    component: WebformComponent
  }
];

@NgModule({
  declarations: [
    AnswerMethodWebformComponent,
    AirtableFieldConnectionComponent,
    WebformClientComponent,
    WebformCreatorComponent,
    WebformDetailComponent,
    WebformVisitorsComponent,
    TagVisitorsDetailComponent,
    TagListComponent,
    VisitorDetailComponent,
    QuestionVisitorsGroupComponent,
    QuestionVisitorsListComponent,
    WebformInputSelectorComponent,
    WebformComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class WebformsModule { }
