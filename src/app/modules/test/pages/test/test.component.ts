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
import { type } from 'os';

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

  deliveryData: Array<{
    id: string;
    type?: 'zone' | 'free' | 'greater' | 'lesser';
    amount?: number;
    zona?: string;
    greaterAmount?: number;
    lesserAmount?: number;
    cost?: number;
    lesserAmountLimit?: number;
    greaterAmountLimit?: number;
  }> = [];
  deliveryZones: DeliveryZoneInput[] = [];

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
    console.log(this.merchant);
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

  yesDependDialog: EmbeddedComponentWithId = {
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
      isMultiple: false,
    },
    outputs: [
      {
        name: 'data',
        callback: (params) => {
          console.log(params);
          const { value } = params;
          const { depend } = value;

          if (!(depend.length === 0)) {
            this.depend = depend[0] === 'Del monto de la factura' ? 'amount' : 'zone';
            // TODO validate if deliveryZones length is 0

            if (this.depend === 'amount') {

              if (!(this.dialogsPro[2].componentId === 'yes-depend-amount-1')) {
                // Deleting any other dialog except for the last one
                console.log(this.dialogsPro.length);
                if (this.dialogsPro.length > 3) {
                  this.dialogsPro.splice(
                    2,
                    2
                  )
                  if (this.deliveryData.length > 0) this.deliveryData.splice(0, this.deliveryData.length);
                }
                
                this.dialogsPro.splice(
                  2,
                  0,
                  this.yesDependAmountDialogs[0]
                );
  
                this.dialogsPro.splice(
                  3,
                  0,
                  this.yesDependAmountDialogs[1]
                );
              }
              setTimeout(() => {
                this.dialogFlowFunctions.moveToDialogByIndex(2);
              }, 500);
            } else if (this.depend === 'zone') {
              if (!(this.dialogsPro[2].componentId === 'yes-depend-deliveryzone-1')) {
                // Deleting any other dialog except for the last one
                console.log(this.dialogsPro.length);
                if (this.dialogsPro.length > 3) {
                  this.dialogsPro.splice(
                    2,
                    2
                  )
                  if (this.deliveryData.length > 0) this.deliveryData.splice(0, this.deliveryData.length);
                }

                this.dialogsPro.splice(
                  2,
                  0,
                  this.yesDependDeliveryDialogs[0]
                );
  
                this.dialogsPro.splice(
                  3,
                  0,
                  this.yesDependDeliveryDialogs[1]
                );
              }
              setTimeout(() => {
                this.dialogFlowFunctions.moveToDialogByIndex(2);
              }, 500);
            }
          }
        }
      }
    ]
  }

  yesDependDeliveryDialogs: Array<EmbeddedComponentWithId> = [
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
              index: 0,
              row: 0,
              column: 0,
              isFlex: true,
              type: "number"
            },
            {
              label: "$ que te cuesta (egreso)",
              formControl: "input-2",
              index: 1,
              row: 0,
              column: 1,
              isFlex: true,
              type: "number"
            },
            {
              label: "Nombre de la zona",
              formControl: "input-3",
              index: 2,
              row: 1,
              column: 0,
              isFlex: false,
              halfWidth: false,
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
            const incomeByBuyer = params[0].value ? params[0].value : 0;
            const cost = params[1].value ? params[1].value : 0;
            const zoneName = params[2].value ? params[2].value : '';

            if (
              this.deliveryData.length > 0 &&
              this.deliveryData.find((item) => item.id === 'yes-depend-deliveryzone-1')
            ) {
              const index = this.deliveryData.findIndex(
                (item) => item.id === 'yes-depend-deliveryzone-1'
              );
              this.deliveryData.splice(index, 1);
            }

            this.deliveryData.push({
              zona: zoneName,
              amount: Number(incomeByBuyer),
              cost: Number(cost), 
              type: 'zone',
              id: "yes-depend-deliveryzone-1"
            });

            console.log(this.deliveryData);
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
              index: 0,
              row: 0,
              column: 0,
              isFlex: true,
              type: "number"
            },
            {
              label: "$ que te cuesta (egreso)",
              formControl: "input-2",
              index: 1,
              row: 0,
              column: 1,
              isFlex: true,
              type: "number"
            },
            {
              label: "Nombre de la zona",
              formControl: "input-3",
              index: 2,
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
            const incomeByBuyer = params[0].value ? params[0].value : 0;
            const cost = params[1].value ? params[1].value : 0;
            const zoneName = params[2].value ? params[2].value : '';

            if (
              this.deliveryData.length > 0 &&
              this.deliveryData.find((item) => item.id === 'yes-depend-deliveryzone-2')
            ) {
              const index = this.deliveryData.findIndex(
                (item) => item.id === 'yes-depend-deliveryzone-2'
              );
              this.deliveryData.splice(index, 1);
            }

            this.deliveryData.push({
              zona: zoneName,
              amount: Number(incomeByBuyer),
              cost: Number(cost), 
              type: 'zone',
              id: "yes-depend-deliveryzone-2"
            });

            console.log(this.deliveryData);
          },
        },
      ],
    }
  ];

  yesDependAmountDialogs: Array<EmbeddedComponentWithId> = [
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
              index: 0,
              row: 0,
              column: 0,
              isFlex: true,
              type: "number"
            },
            {
              label: "$ de la factura mayor a:",
              formControl: "input-2",
              index: 1,
              row: 0,
              column: 1,
              isFlex: true,
              type: "number"
            },
            {
              label: "$ recibes del comprador",
              formControl: "input-3",
              index: 2,
              row: 1,
              column: 0,
              isFlex: true,
              type: "number"
            },
            {
              label: "$ que te cuesta (egreso)",
              formControl: "input-4",
              index: 3,
              row: 1,
              column: 1,
              isFlex: true,
              type: "number"
            },
            {
              label: "Nombre de la zona",
              formControl: "input-5",
              index: 4,
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
            const lesserAmount = params[0].value ? params[0].value : 0;
            const greaterAmount = params[1].value ? params[1].value : 0;
            const incomeByBuyer = params[2].value ? params[2].value : 0;
            const cost = params[3].value ? params[3].value : 0;
            const zoneName = params[4].value ? params[4].value : '';
            
            if (
              this.deliveryData.length > 0 &&
              this.deliveryData.find((item) => item.id === 'yes-depend-amount-1')
            ) {
              const index = this.deliveryData.findIndex(
                (item) => item.id === 'yes-depend-amount-1'
              );
              this.deliveryData.splice(index, 1);
            }

            this.deliveryData.push({
              zona: zoneName,
              amount: Number(incomeByBuyer),
              cost: Number(cost),
              lesserAmount: Number(lesserAmount),
              greaterAmount: Number(greaterAmount),
              greaterAmountLimit: Number(greaterAmount),
              lesserAmountLimit: Number(lesserAmount),
              type: 'lesser',
              id: "yes-depend-amount-1"
            });

            console.log(this.deliveryData);
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
              index: 0,
              row: 0,
              column: 0,
              isFlex: true,
              type: "number"
            },
            {
              label: "Mayor a:",
              formControl: "input-2",
              index: 1,
              row: 0,
              column: 1,
              isFlex: true,
              type: "number"
            },
            {
              label: "Monto que te pagan por el delivery:",
              formControl: "input-3",
              index: 2,
              row: 1,
              column: 0,
              isFlex: false,
              type: "number"
            },
            {
              label: "Nombre de la zona",
              formControl: "input-4",
              index: 3,
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
            const lesserAmount = params[0].value ? params[0].value : 0;
            const greaterAmount = params[1].value ? params[1].value : 0;
            const incomeByBuyer = params[2].value ? params[2].value : 0;
            const zoneName = params[3].value ? params[3].value : '';

            if (
              this.deliveryData.length > 0 &&
              this.deliveryData.find((item) => item.id === 'yes-depend-amount-2')
            ) {
              const index = this.deliveryData.findIndex(
                (item) => item.id === 'yes-depend-amount-2'
              );
              this.deliveryData.splice(index, 1);
            }

            this.deliveryData.push({
              zona: zoneName,
              amount: Number(incomeByBuyer),
              // cost: cost,
              lesserAmount : Number(lesserAmount),
              greaterAmount : Number(greaterAmount),
              greaterAmountLimit: Number(greaterAmount),
              lesserAmountLimit: Number(lesserAmount),
              type: 'lesser',
              id: "yes-depend-amount-2"
            });

            console.log(this.deliveryData);
          },
        },
      ],
    }
  ];

  noDependDialogs = [
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
              index: 0,
              row: 0,
              column: 0,
              isFlex: true,
              type: "number"
            },
            {
              label: "Nombre de la zona:",
              formControl: "input-2",
              index: 1,
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
            const cost = params[0].value ? params[0].value : 0;
            const zoneName = params[1].value ? params[1].value : '';

            if (
              this.deliveryData.length > 0 &&
              this.deliveryData.find((item) => item.id === 'no-deliveryzone-1')
            ) {
              const index = this.deliveryData.findIndex(
                (item) => item.id === 'no-deliveryzone-1'
              );
              this.deliveryData.splice(index, 1);
            }

            this.deliveryData.push({
              zona: zoneName,
              cost: Number(cost),
              type: 'free',
              id: "no-deliveryzone-1"
            });

            console.log(this.deliveryData);
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
              index: 0,
              row: 0,
              column: 0,
              isFlex: true,
              type: "number"
            },
            {
              label: "Nombre de la zona:",
              formControl: "input-2",
              index: 1,
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
            const cost = params[0].value ? params[0].value : 0;
            const zoneName = params[1].value ? params[1].value : '';

            if (
              this.deliveryData.length > 0 &&
              this.deliveryData.find((item) => item.id === 'no-deliveryzone-2')
            ) {
              const index = this.deliveryData.findIndex(
                (item) => item.id === 'no-deliveryzone-2'
              );
              this.deliveryData.splice(index, 1);
            }

            this.deliveryData.push({
              zona: zoneName,
              cost: Number(cost),
              type: 'free',
              id: "no-deliveryzone-2"
            });
            console.log(this.deliveryData);
          },
        },
      ],
    }
  ];

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
          isMultiple: false,
        },
        outputs: [
          {
            name: 'data',
            callback: (params) => {
              console.log(params);
              const { value } = params;
              const { deliveryType } = value;

              if (!(deliveryType.length === 0)) {
                this.deliveryType = 
                  deliveryType[0] === 'Sí' ? 'yes'
                  : deliveryType[0] === 'No' ? 'no' 
                  : deliveryType[0] === 'Depende' ? 'depend' 
                  : 'no-delivery';

                if (this.deliveryType === 'yes' || this.deliveryType === 'depend') {
                  console.log("yes or depend");

                  if (!(this.dialogsPro[1].componentId === 'yes-depend')) {
                    // Deleting any other dialog except for the last one
                    if (this.dialogsPro.length > 2) {
                      this.dialogsPro.splice(
                        1,
                        this.dialogsPro.length === 3
                          ? 1 :
                          this.dialogsPro.length === 4
                          ? 2 :
                          3
                      )
                      
                      console.log(this.deliveryData);
                      if (this.deliveryData.length > 0) this.deliveryData.splice(0, this.deliveryData.length);
                      console.log(this.deliveryData);
                    }

                    // Adding dialog yesDepend to the array
                    this.dialogsPro.splice(
                      1,
                      0,
                      this.yesDependDialog
                    )
                  }

                  setTimeout(() => {
                    this.dialogFlowFunctions.moveToDialogByIndex(1);
                  }, 500);
                  
                } else if (this.deliveryType === 'no' || this.deliveryType === 'no-delivery') {
                  console.log("no or no-delivery");

                  if (!(this.dialogsPro[1].componentId === 'no-deliveryzone-1')) {
                    // Deleting any other dialog except for the last one
                    if (this.dialogsPro.length > 2) {
                      this.dialogsPro.splice(
                        1,
                        this.dialogsPro.length === 3
                          ? 1 :
                          this.dialogsPro.length === 4
                          ? 2 :
                          3
                      )
                      console.log(this.deliveryData);
                      if (this.deliveryData.length > 0) this.deliveryData.splice(0, this.deliveryData.length);
                      console.log(this.deliveryData);
                    }
                    
                    this.dialogsPro.splice(
                      1,
                      0,
                      this.noDependDialogs[0]
                    );
                    this.dialogsPro.splice(
                      2,
                      0,
                      this.noDependDialogs[1]
                    );
                  }

                  setTimeout(() => {
                    this.dialogFlowFunctions.moveToDialogByIndex(1);
                  }, 500);
                }
              }
            }
          }
        ]
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
          isMultiple: false,
        },
        outputs: [
          {
            name: 'data',
            callback: async (params) => {
              console.log(params);
              const { confirm } = params.value;
              
              if (confirm[0]) {
                console.log(this.deliveryData);
                this.deliveryZones = this.deliveryData.map((item) => {
                  return {
                    name: item.zona as string,
                    type: item.type,
                    cost: Number(item.cost),
                    amount: Number(item.amount),
                    // cost: cost,
                    lesserAmount : Number(item.lesserAmount),
                    greaterAmount : Number(item.greaterAmount),
                    greaterAmountLimit: Number(item.greaterAmountLimit) || Number(item.greaterAmount),
                    lesserAmountLimit: Number(item.lesserAmountLimit) || Number(item.lesserAmount),
                  };
                });

                console.log(this.deliveryZones);

                this.deliveryData.forEach(async zone => {
                  let deliveryZone;
                  try {
                    deliveryZone = await this.deliveryzonesService.create(
                      this.merchant._id,
                      {
                        amount: zone.amount,
                        greaterAmount: zone.greaterAmount,
                        lesserAmount: zone.lesserAmount,
                        greaterAmountLimit: zone.greaterAmountLimit,
                        lesserAmountLimit: zone.lesserAmountLimit,
                        zona: zone.zona,
                        type: zone.type
                      }
                    )
                  } catch (error) {
                    console.log(error);
                  }

                  if (deliveryZone && zone.cost) {
                    try {
                      const expenditure = await this.deliveryzonesService.createExpenditure(
                        this.merchant._id,
                        {
                          type: "delivery-zone",
                          amount: zone.cost
                        }
                      );
                      await this.deliveryzonesService.addExpenditure(expenditure._id, deliveryZone._id);
                    } catch (error) {
                      console.log(error);
                    }
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
