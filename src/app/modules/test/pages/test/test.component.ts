import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CustomFieldsComponent } from 'src/app/shared/dialogs/custom-fields/custom-fields.component';
import { MagicLinkDialogComponent } from 'src/app/shared/components/magic-link-dialog/magic-link-dialog.component';
import { CollaborationsComponent } from 'src/app/shared/dialogs/collaborations/collaborations.component';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import {
  ItemDashboardOptionsComponent,
  DashboardOption,
} from 'src/app/shared/dialogs/item-dashboard-options/item-dashboard-options.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { Questions } from '../../../../shared/components/form-questions/form-questions.component';
import { Tag } from '../../../../core/models/tags';
import { StoreShareList } from '../../../../shared/dialogs/store-share/store-share.component';
import { ReloadComponent } from 'src/app/shared/dialogs/reload/reload.component';
import { FormStep, FormField } from 'src/app/core/types/multistep-form';
import { FormControl } from '@angular/forms';
import { SettingsComponent } from 'src/app/shared/dialogs/settings/settings.component';
import { InputTransparentComponent } from 'src/app/shared/dialogs/input-transparent/input-transparent.component';
import { MediaDialogComponent } from 'src/app/shared/dialogs/media-dialog/media-dialog.component';
import { ItemsService } from 'src/app/core/services/items.service';
import { Item, ItemInput } from 'src/app/core/models/item';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { EmbeddedComponent } from 'src/app/core/types/multistep-form';
import { BlankComponent } from 'src/app/shared/dialogs/blank/blank.component';
import { SwiperOptions } from 'swiper';
import { LinkDialogComponent } from 'src/app/shared/dialogs/link-dialog/link-dialog.component';
import { environment } from 'src/environments/environment';
import { Button } from 'src/app/shared/components/general-item/general-item.component';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  @ViewChild('dialogSwiper') dialogSwiper: SwiperComponent;
  env: string = environment.assetsUrl;
  openedDialogFlow: boolean = false;
  swiperConfig: SwiperOptions = null;
  @Input() status: 'OPEN' | 'CLOSE' = 'CLOSE';
  item: Item = null;
  dialogs: Array<EmbeddedComponent> = [
    {
      component: BlankComponent,
      inputs: {
        containerStyles: {
          height: '500px',
        },
      },
      outputs: [
        {
          name: 'threeClicksDetected',
          callback: (timeOfDay) => {
            this.swiperConfig.allowSlideNext = true;
          },
        },
      ],
    },
    {
      component: BlankComponent,
      inputs: {
        containerStyles: {
          height: '200px',
        },
      },
    },
    {
      component: BlankComponent,
      inputs: {
        containerStyles: {
          height: '500px',
        },
      },
    },
    {
      component: BlankComponent,
      inputs: {
        containerStyles: {
          height: '200px',
        },
      },
      outputs: [
        {
          name: 'threeClicksDetected',
          callback: (timeOfDay) => {
            this.openedDialogFlow = false;
          },
        },
      ],
    },
  ];
  optionsButton: Button = {
    clickEvent: (params: Tag) => {
      alert("clicked")
    },
  };

  constructor(
    private dialog: DialogService,
    private itemsService: ItemsService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService
  ) {}

  async ngOnInit() {
    this.item = await this.itemsService.item('63c61f50a6ce9322ca216714');
  }

  openDialog() {
    this.dialog.open(LinkDialogComponent, {
      type: 'flat-action-sheet',
      flags: ['no-header'],
      customClass: 'app-dialog',
    });
  }
}
