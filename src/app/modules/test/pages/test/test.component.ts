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
import { FormStep, FormField, EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
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
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { DescriptionDialogComponent } from 'src/app/shared/dialogs/description-dialog/description-dialog.component';
import { DialogFormComponent } from 'src/app/shared/dialogs/dialog-form/dialog-form.component';

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
      alert('clicked');
    },
  };

  firstIndex: number = 0;

  dialogsPro: Array<EmbeddedComponentWithId> = [];
  dialogFlowFunctions: Record<string, any> = {};

  constructor(
    private dialog: DialogService,
    private itemsService: ItemsService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService,
    private _bottomSheet: MatBottomSheet
  ) {}

  async ngOnInit() {
    console.log(this.firstIndex);
    this.item = await this.itemsService.item('63d7ebf3bbd3bc32bcc2ec0b');
    this.inject();
    this.dialogFlowFunctions.moveToDialogByIndex(
      this.dialogs.length - 1
    );
  }

  openDialog() {
    this.dialog.open(LinkDialogComponent, {
      type: 'flat-action-sheet',
      flags: ['no-header'],
      customClass: 'app-dialog',
    });
  }
  openBottomSheet(): void {
    this._bottomSheet.open(LinksDialogComponent);
  }

  openDescriptionDialog() {
    this.dialog.open(DescriptionDialogComponent, {
      type: 'centralized-fullscreen',
      flags: ['no-header'],
      customClass: 'app-dialog',
    });
  }

  start() {
    
  }

  close() {

  }

  inject() {
    this.dialogsPro = [
      {
        component: DialogFormComponent,
        componentId: 'dialog',
        inputs: {
          title: {
            text: "Zona de Entrega #1"
          },
          fields: {
            inputs: [
              {
                label: "$ de la factura menor a:",
                formControl: "input-1",
                row: 0,
                column: 0,
                isFlex: true,
                type: "text"
              },
              {
                label: "$ de la factura mayor a:",
                formControl: "input-2",
                row: 0,
                column: 1,
                isFlex: true,
                type: "text"
              },
              {
                label: "$ recibes del comprador",
                formControl: "input-3",
                row: 1,
                column: 0,
                isFlex: false,
                type: "text"
              },
              {
                label: "$ que te cuesta (egreso)",
                formControl: "input-4",
                row: 1,
                column: 1,
                isFlex: true,
                type: "text"
              },
              {
                label: "Nombre de la zona",
                formControl: "input-5",
                row: 2,
                column: 0,
                isFlex: true,
                type: "text"
              },
            ]
          }
        },
        outputs: [
          {
            name: 'formSubmit',
            callback: (params) => {
              console.log(params);
            },
          },
        ],
      }
    ]

    return this.dialogsPro;
  }
}
