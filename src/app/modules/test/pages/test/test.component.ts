import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CustomFieldsComponent } from 'src/app/shared/dialogs/custom-fields/custom-fields.component';
import { MagicLinkDialogComponent } from 'src/app/shared/components/magic-link-dialog/magic-link-dialog.component';
import { CollaborationsComponent } from 'src/app/shared/dialogs/collaborations/collaborations.component';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import { ItemDashboardOptionsComponent, DashboardOption } from 'src/app/shared/dialogs/item-dashboard-options/item-dashboard-options.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { Questions } from '../../../../shared/components/form-questions/form-questions.component';
import { Tag } from '../../../../core/models/tags';
import { OptionAnswerSelector } from 'src/app/shared/components/answer-selector/answer-selector.component';
import { SetConfigComponent } from 'src/app/shared/dialogs/set-config/set-config.component';
import { StoreShareList } from '../../../../shared/dialogs/store-share/store-share.component';
import { ItemSettingsComponent } from 'src/app/shared/dialogs/item-settings/item-settings.component';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  hourRangeInDays = {
    'MONDAY': [
      {from: 9, to: 11},
      {from: 14, to: 18}
    ],
    'TUESDAY': [
      {from: 9, to: 11},
      {from: 14, to: 18}
    ],
    'WEDNESDAY': [
      {from: 9, to: 11},
      {from: 14, to: 18}
    ],
    'THURSDAY': [
      {from: 9, to: 11},
      {from: 14, to: 18}
    ],
    'FRIDAY': [
      {from: 9, to: 11},
      {from: 14, to: 18}
    ],
    'SATURDAY': [
      {from: 9, to: 11},
      {from: 14, to: 15}
    ],
  };
  
  constructor(private dialog: DialogService) { }

  ngOnInit(): void { 
    console.log(this.hourRangeInDays);
  }
}

