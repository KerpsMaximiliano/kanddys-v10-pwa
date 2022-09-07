import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AirtableFieldConnectionComponent } from './pages/airtable-field-connection/airtable-field-connection.component';
import { AnswerMethodWebformComponent } from './pages/answer-method-webform/answer-method-webform.component';
import { QuestionVisitorsGroupComponent } from './pages/question-visitors-group/question-visitors-group.component';
import { QuestionVisitorsListComponent } from './pages/question-visitors-list/question-visitors-list.component';
import { TagVisitorsDetailComponent } from './pages/tag-visitors-detail/tag-visitors-detail.component';
import { VisitorDetailComponent } from './pages/visitor-detail/visitor-detail.component';
import { WebformAnswersComponent } from './pages/webform-answers/webform-answers.component';
import { WebformCreatorComponent } from './pages/webform-creator/webform-creator.component';
import { WebformDetailComponent } from './pages/webform-detail/webform-detail.component';
import { WebformInputSelectorComponent } from './pages/webform-input-selector/webform-input-selector.component';
import { WebformVisitorsComponent } from './pages/webform-visitors/webform-visitors.component';
import { WebformsAdminComponent } from './webforms-admin/webforms-admin.component';

const routes: Routes = [
  {
    path: ':webformId',
    component: WebformsAdminComponent,
    children: [
      {
        path: 'webform-questions',
        component: AnswerMethodWebformComponent,
      },
      {
        path: 'airtable-field-connection/:databaseName',
        component: AirtableFieldConnectionComponent,
      },
      {
        path: 'webform-detail',
        component: WebformDetailComponent,
      },
      {
        path: 'tag-visitors-detail',
        component: TagVisitorsDetailComponent,
      },
      {
        path: 'webform-visitors',
        component: WebformVisitorsComponent,
      },
      {
        path: 'visitor-detail',
        component: VisitorDetailComponent,
      },
      {
        path: 'question-visitors-group',
        component: QuestionVisitorsGroupComponent,
      },
      {
        path: 'question-visitors-list',
        component: QuestionVisitorsListComponent,
      },
      {
        path: 'webform-answers',
        component: WebformAnswersComponent,
      },
      {
        path: 'input-selector',
        component: WebformInputSelectorComponent,
      },
    ],
  },
  {
    path: 'create',
    component: WebformCreatorComponent,
  },
];

@NgModule({
  declarations: [
    WebformsAdminComponent,
    WebformCreatorComponent,
    AnswerMethodWebformComponent,
    AirtableFieldConnectionComponent,
    WebformDetailComponent,
    WebformVisitorsComponent,
    TagVisitorsDetailComponent,
    VisitorDetailComponent,
    QuestionVisitorsGroupComponent,
    QuestionVisitorsListComponent,
    WebformAnswersComponent,
    WebformInputSelectorComponent,
  ],
  imports: [CommonModule, SharedModule, RouterModule.forChild(routes)],
})
export class AdminModule {}
