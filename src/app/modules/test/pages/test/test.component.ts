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
import { FormControl, Validators } from '@angular/forms';
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
import { GeneralDialogComponent } from 'src/app/shared/components/general-dialog/general-dialog.component';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { DeliveryZoneInput } from 'src/app/core/models/deliveryzone';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { HeaderService } from 'src/app/core/services/header.service';

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


  // Variables for dialogProFlow

  dialogsPro: Array<EmbeddedComponentWithId> = [];
  dialogFlowFunctions: Record<string, any> = {};

  deliveryType: 'yes' | 'no' | 'depend' | 'no-delivery';
  depend: 'amount' | 'zone';

  deliveryZones: DeliveryZoneInput[];
  merchant: Merchant;

  constructor(
    private dialog: DialogService,
    private itemsService: ItemsService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService,
    private _bottomSheet: MatBottomSheet,
    private dialogFlowService: DialogFlowService,
    private deliveryzonesService: DeliveryZonesService,
    private headerService: HeaderService
  ) {}

  async ngOnInit() {
    console.log(this.firstIndex);
    this.inject();
    // this.dialogFlowFunctions.moveToDialogByIndex(
    //   this.dialogs.length - 1
    // );

    this.merchant = await this.merchantService.merchantDefault();
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
        component: GeneralDialogComponent,
        componentId: 'start',
        inputs: {
          dialogId: 'start',
          omitTabFocus: false,
          containerStyles: {
            background: 'rgb(255, 255, 255)',
            borderRadius: '12px',
            opacity: '1',
            padding: '37px 36.6px 18.9px 31px',
          },
          header: {
            styles: {
              fontSize: '21px',
              fontFamily: 'SfProBold',
              marginBottom: '21.2px',
              marginTop: '0',
              color: '#4F4F4F',
            },
            text: '¿Cobras aparte por el delivery?',
          },
          title: {
            styles: {
              fontSize: '15px',
              color: '#7B7B7B',
              fontStyle: 'italic',
              margin: '0',
            },
            text: '',
          },
          fields: {
            list: [
              {
                name: 'deliveryType',
                value: '',
                validators: [Validators.required],
                type: 'selection',
                selection: {
                  styles: {
                    display: 'block',
                    fontFamily: '"SfProBold"',
                    fontSize: '17px',
                    color: '#272727',
                    marginLeft: '19.5px',
                  },
                  list: [
                    {
                      text: 'Sí',
                    },
                    {
                      text: 'No',
                    },
                    {
                      text: 'Depende',
                    },
                    {
                      text: 'Mi producto no se entrega físicamente',
                    }
                  ],
                },
                // styles: {},
                prop: 'text',
              },
            ],
          },
          isMultiple: true,
        },
        outputs: [
          {
            name: 'data',
            callback: (params) => {
              console.log(params);
              const { value } = params;
              const { deliveryType } = value;
              this.deliveryType = 
              deliveryType[0] === 'Sí' ? 'yes'
               : deliveryType[0] === 'No' ? 'no' 
               : deliveryType[0] === 'Depende' ? 'depend' 
               : 'no-delivery';

              if (this.deliveryType === 'yes' || this.deliveryType === 'depend') {
                console.log("yes or depend");
                setTimeout(() => {
                  this.dialogFlowFunctions.moveToDialogByIndex(1);
                }, 500);
                
              } else if (this.deliveryType === 'no' || this.deliveryType === 'no-delivery') {
                console.log("no or no-delivery");
                setTimeout(() => {
                  this.dialogFlowFunctions.moveToDialogByIndex(6);
                }, 500);
              }
            }
          }
        ]
      },
      {
        component: GeneralDialogComponent,
        componentId: 'yes-depend',
        inputs: {
          dialogId: 'yes-depend',
          containerStyles: {
            background: 'rgb(255, 255, 255)',
            borderRadius: '12px',
            opacity: '1',
            padding: '37px 36.6px 18.9px 31px',
          },
          header: {
            styles: {
              fontSize: '21px',
              fontFamily: 'SfProBold',
              marginBottom: '21.2px',
              marginTop: '0',
              color: '#4F4F4F',
            },
            text: '¿De qué depende?',
          },
          title: {
            styles: {
              fontSize: '15px',
              color: '#7B7B7B',
              fontStyle: 'italic',
              margin: '0',
            },
            text: '',
          },
          fields: {
            list: [
              {
                name: 'depend',
                value: '',
                validators: [Validators.required],
                type: 'selection',
                selection: {
                  styles: {
                    display: 'block',
                    fontFamily: '"SfProBold"',
                    fontSize: '17px',
                    color: '#272727',
                    marginLeft: '19.5px',
                  },
                  list: [
                    {
                      text: 'Del monto de la factura',
                    },
                    {
                      text: 'De la zona de entrega',
                    }
                  ],
                },
                // styles: {},
                prop: 'text',
              },
            ],
          },
          isMultiple: true,
        },
        outputs: [
          {
            name: 'data',
            callback: (params) => {
              console.log(params);
              const { value } = params;
              const { depend } = value;
              this.depend = depend[0] === 'Del monto de la factura' ? 'amount' : 'zone';
              // TODO validate if deliveryZones length is 0

              if (this.depend === 'amount') {
                setTimeout(() => {
                  this.dialogFlowFunctions.moveToDialogByIndex(4);
                }, 500);
              } else if (this.depend === 'zone') {
                setTimeout(() => {
                  this.dialogFlowFunctions.moveToDialogByIndex(2);
                }, 500);
              }
            }
          }
        ]
      },
      {
        component: DialogFormComponent,
        componentId: 'yes-depend-deliveryzone-1',
        inputs: {
          dialogId: 'yes-depend-deliveryzone-1',
          containerStyles: {},
          title: {
            text: "Zona de Entrega #1"
          },
          fields: {
            inputs: [
              {
                label: "$ recibes del comprador:",
                formControl: "input-1",
                row: 0,
                column: 0,
                isFlex: true,
                type: "text"
              },
              {
                label: "$ que te cuesta (egreso)",
                formControl: "input-2",
                row: 0,
                column: 1,
                isFlex: true,
                type: "text"
              },
              {
                label: "Nombre de la zona",
                formControl: "input-3",
                row: 1,
                column: 0,
                isFlex: false,
                type: "text"
              }
            ]
          }
        },
        outputs: [
          {
            name: 'formSubmit',
            callback: (params) => {
              console.log(params);
              const incomeByBuyer = params.value[0].value
              const cost = params.value[1].value;
              const zoneName = params.value[2].value;

              this.deliveryZones.push({
                zona: zoneName,
                amount: incomeByBuyer as number,
                cost: cost as number, 
                type: 'zone'
              });
            },
          },
        ],
      },
      {
        component: DialogFormComponent,
        componentId: 'yes-depend-deliveryzone-2',
        inputs: {
          dialogId: 'yes-depend-deliveryzone-2',
          containerStyles: {},
          title: {
            text: "Zona de Entrega #2"
          },
          fields: {
            inputs: [
              {
                label: "$ recibes del comprador:",
                formControl: "input-1",
                row: 0,
                column: 0,
                isFlex: true,
                type: "text"
              },
              {
                label: "$ que te cuesta (egreso)",
                formControl: "input-2",
                row: 0,
                column: 1,
                isFlex: true,
                type: "text"
              },
              {
                label: "Nombre de la zona",
                formControl: "input-3",
                row: 1,
                column: 0,
                isFlex: false,
                type: "text"
              }
            ]
          }
        },
        outputs: [
          {
            name: 'formSubmit',
            callback: (params) => {
              console.log(params);
              const incomeByBuyer = params.value[0].value
              const cost = params.value[1].value;
              const zoneName = params.value[2].value;

              this.deliveryZones.push({
                zona: zoneName,
                amount: incomeByBuyer as number,
                cost: cost as number, 
                type: 'zone'
              });
            },
          },
        ],
      },
      {
        component: DialogFormComponent,
        componentId: 'yes-depend-amount-1',
        inputs: {
          dialogId: 'yes-depend-amount-1',
          containerStyles: {},
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
                isFlex: false,
                type: "text"
              },
              {
                label: "Nombre de la zona",
                formControl: "input-5",
                row: 2,
                column: 0,
                isFlex: false,
                type: "text"
              }
            ]
          }
        },
        outputs: [
          {
            name: 'formSubmit',
            callback: (params) => {
              console.log(params);
              const lesserAmount = params.value[0].value
              const greaterAmount = params.value[1].value;
              const incomeByBuyer = params.value[2].value
              const cost = params.value[3].value;
              const zoneName = params.value[4].value;

              this.deliveryZones.push({
                zona: zoneName,
                amount: incomeByBuyer as number,
                cost: cost as number,
                lesserAmount: lesserAmount as number,
                greaterAmount: greaterAmount as number,
                type: 'lesser'
              });
            },
          },
        ],
      },
      {
        component: DialogFormComponent,
        componentId: 'yes-depend-amount-2',
        inputs: {
          dialogId: 'yes-depend-amount-2',
          containerStyles: {},
          title: {
            text: "Zona de Entrega #2"
          },
          fields: {
            inputs: [
              {
                label: "Menor a:",
                formControl: "input-1",
                row: 0,
                column: 0,
                isFlex: true,
                type: "text"
              },
              {
                label: "Mayor a:",
                formControl: "input-2",
                row: 0,
                column: 1,
                isFlex: true,
                type: "text"
              },
              {
                label: "Monto que te pagan por el delivery:",
                formControl: "input-3",
                row: 1,
                column: 0,
                isFlex: false,
                type: "text"
              },
              {
                label: "Nombre de la zona",
                formControl: "input-4",
                row: 2,
                column: 0,
                isFlex: false,
                type: "text"
              }
            ]
          }
        },
        outputs: [
          {
            name: 'formSubmit',
            callback: (params) => {
              console.log(params);
              const lesserAmount = params.value[0].value
              const greaterAmount = params.value[1].value;
              const incomeByBuyer = params.value[2].value
              const zoneName = params.value[3].value;

              this.deliveryZones.push({
                zona: zoneName,
                amount: incomeByBuyer as number,
                // cost: cost,
                lesserAmount : lesserAmount as number,
                greaterAmount : greaterAmount as number,
                type: 'lesser'
              });
            },
          },
        ],
      },
      {
        component: DialogFormComponent,
        componentId: 'no-deliveryzone-1',
        inputs: {
          dialogId: 'no-deliveryzone-1',
          containerStyles: {},
          title: {
            text: "Zona de Entrega #1"
          },
          fields: {
            inputs: [
              {
                label: "$ que te cuesta (egreso)",
                formControl: "input-1",
                row: 0,
                column: 0,
                isFlex: true,
                type: "text"
              },
              {
                label: "Nombre de la zona:",
                formControl: "input-2",
                row: 1,
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
              const cost = params.value[0].value;
              const zoneName = params.value[1].value;

              this.deliveryZones.push({
                zona: zoneName,
                cost: cost as number,
                type: 'free'
              });
            },
          },
        ],
      },
      {
        component: DialogFormComponent,
        componentId: 'no-deliveryzone-2',
        inputs: {
          dialogId: 'no-deliveryzone-2',
          containerStyles: {},
          title: {
            text: "Zona de Entrega #2"
          },
          fields: {
            inputs: [
              {
                label: "$ que te cuesta (egreso)",
                formControl: "input-1",
                row: 0,
                column: 0,
                isFlex: true,
                type: "text"
              },
              {
                label: "Nombre de la zona:",
                formControl: "input-2",
                row: 1,
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
              const cost = params.value[0].value;
              const zoneName = params.value[1].value;

              this.deliveryZones.push({
                zona: zoneName,
                cost: cost as number,
                type: 'free'
              });
            },
          },
        ],
      },
      {
        component: GeneralDialogComponent,
        componentId: 'end',
        inputs: {
          dialogId: 'end',
          containerStyles: {
            background: 'rgb(255, 255, 255)',
            borderRadius: '12px',
            opacity: '1',
            padding: '37px 36.6px 18.9px 31px',
          },
          header: {
            styles: {
              fontSize: '21px',
              fontFamily: 'SfProBold',
              marginBottom: '21.2px',
              marginTop: '0',
              color: '#4F4F4F',
            },
            text: '¿Desea guardar los datos?',
          },
          title: {
            styles: {
              fontSize: '15px',
              color: '#7B7B7B',
              fontStyle: 'italic',
              margin: '0',
            },
            text: '',
          },
          fields: {
            list: [
              {
                name: 'confirm',
                value: '',
                validators: [Validators.required],
                type: 'selection',
                selection: {
                  styles: {
                    display: 'block',
                    fontFamily: '"SfProBold"',
                    fontSize: '17px',
                    color: '#272727',
                    marginLeft: '19.5px',
                  },
                  list: [
                    {
                      text: 'Sí',
                    }
                  ],
                },
                // styles: {},
                prop: 'text',
              },
            ],
          },
          isMultiple: true,
        },
        outputs: [
          {
            name: 'data',
            callback: async (params) => {
              console.log(params);
              const { confirm } = params.value;
              
              if (confirm[0]) {
                console.log(this.deliveryZones);
                this.deliveryZones.forEach(async zone => {
                  const deliveryZone = await this.deliveryzonesService.create(
                    this.merchant._id,
                    zone
                  )
                  if (zone.cost) {
                    const expenditure = await this.deliveryzonesService.createExpenditure(
                      this.merchant._id,
                      {
                        type: "delivery-zone",
                        amount: zone.cost
                      }
                    );

                    await this.deliveryzonesService.addExpenditure(expenditure._id, deliveryZone._id);
                  }
                });
              }
            }
          }
        ]
      },
    ]

    return this.dialogsPro;
  }
}
