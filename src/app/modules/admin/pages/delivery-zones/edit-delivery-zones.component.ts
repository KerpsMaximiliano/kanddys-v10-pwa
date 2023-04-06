import { Validators } from "@angular/forms";
import { DeliveryZone, DeliveryZoneInput } from "src/app/core/models/deliveryzone";
import { Merchant } from "src/app/core/models/merchant";
import { Expenditure } from "src/app/core/models/order";
import { DeliveryZonesService } from "src/app/core/services/deliveryzones.service";
import { DialogFlowService } from "src/app/core/services/dialog-flow.service";
import { MerchantsService } from "src/app/core/services/merchants.service";
import { EmbeddedComponentWithId } from "src/app/core/types/multistep-form";
import { DialogService } from "src/app/libs/dialog/services/dialog.service";
import { GeneralDialogComponent } from "src/app/shared/components/general-dialog/general-dialog.component";
import { DialogFormComponent } from "src/app/shared/dialogs/dialog-form/dialog-form.component";

export class EditZoneDialogs {

    dialogsPro: Array<EmbeddedComponentWithId> = [];

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
    deliveryZone: DeliveryZone;
    expenditure: Expenditure;

    constructor(
        private dialogFlowFunctions: Record<string, any>,
        private merchantService: MerchantsService,
        private deliveryzonesService: DeliveryZonesService,
        private dialogFlowService: DialogFlowService,
      ) {}

      endDialog: EmbeddedComponentWithId = {
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

                let canReload = true;

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
                    deliveryZone = await this.deliveryzonesService.update(
                        this.deliveryZone._id,
                      {
                        amount: zone.amount,
                        greaterAmount: zone.greaterAmount,
                        lesserAmount: zone.lesserAmount,
                        greaterAmountLimit: zone.greaterAmountLimit,
                        lesserAmountLimit: zone.lesserAmountLimit,
                        zona: zone.zona,
                      }
                    )
                  } catch (error) {
                    console.log(error);
                    canReload = false;
                  }

                  if (deliveryZone && zone.cost) {
                    try {
                      const expenditure = await this.deliveryzonesService.updateExpenditure(
                        {
                          amount: zone.cost,
                        },
                        this.expenditure._id
                      );
                    } catch (error) {
                      console.log(error);
                      canReload = false;
                    }
                  }
                });

                setTimeout(() => {
                  window.location.reload(); 
                }, 2000);
              }
            }
          }
        ]
      }

    inject() {
        this.deliveryZone = this.deliveryzonesService.deliveryZoneData;
        this.expenditure = this.deliveryzonesService.expenditureData;
        const expenditure = this.deliveryzonesService.expenditureData?.amount ? this.deliveryzonesService.expenditureData?.amount : 0;

        switch (this.deliveryZone.type) {
            case 'zone':

                const yesDependDeliveryDialogs: EmbeddedComponentWithId = {
                    component: DialogFormComponent,
                    componentId: 'yes-depend-deliveryzone-1',
                    inputs: {
                    dialogId: 'yes-depend-deliveryzone-1',
                    containerStyles: {},
                    title: {
                        text: this.deliveryZone.zona
                    },
                    fields: {
                        inputs: [
                        {
                            label: "$ recibes del comprador:",
                            formControl: "input-1",
                            value: this.deliveryZone.amount as number,
                            index: 0,
                            row: 0,
                            column: 0,
                            isFlex: true,
                            type: "number",
                            required: true
                        },
                        {
                            label: "$ que te cuesta (egreso)",
                            formControl: "input-2",
                            value: expenditure as number,
                            index: 1,
                            row: 0,
                            column: 1,
                            isFlex: true,
                            type: "number",
                            required: false
                        },
                        {
                            label: "Nombre de la zona",
                            formControl: "input-3",
                            value: this.deliveryZone.zona as string,
                            index: 2,
                            row: 1,
                            column: 0,
                            isFlex: false,
                            halfWidth: false,
                            type: "text",
                            required: true
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
        
                        const zone = this.deliveryData.find((item) => item.id === 'yes-depend-deliveryzone-1');
                        if (zone.amount === 0 || zone.zona === '') {
                            console.log("Step inválido");
                            this.dialogFlowService.swiperConfig.allowSlideNext = false;
                        } else {
                            this.dialogFlowService.swiperConfig.allowSlideNext = true;
                        }
                        
                        if (!(this.dialogsPro[this.dialogsPro.length - 1].componentId === 'end')) this.dialogsPro.push(this.endDialog);
                        },
                    },
                    ],
                };
                this.dialogsPro.push(yesDependDeliveryDialogs);
                break;
            case 'lesser':
                const yesDependAmountDialogs: EmbeddedComponentWithId = {
                    component: DialogFormComponent,
                    componentId: 'yes-depend-amount-1',
                    inputs: {
                      dialogId: 'yes-depend-amount-1',
                      containerStyles: {},
                      title: {
                        text: this.deliveryZone.zona
                      },
                      fields: {
                        inputs: [
                          {
                            label: "$ de la factura menor a:",
                            formControl: "input-1",
                            value: this.deliveryZone.lesserAmount as number,
                            index: 0,
                            row: 0,
                            column: 0,
                            isFlex: true,
                            type: "number"
                          },
                          {
                            label: "$ de la factura mayor a:",
                            formControl: "input-2",
                            value: this.deliveryZone.greaterAmount as number,
                            index: 1,
                            row: 0,
                            column: 1,
                            isFlex: true,
                            type: "number"
                          },
                          {
                            label: "$ recibes del comprador",
                            formControl: "input-3",
                            value: this.deliveryZone.amount as number,
                            index: 2,
                            row: 1,
                            column: 0,
                            isFlex: true,
                            type: "number"
                          },
                          {
                            label: "$ que te cuesta (egreso)",
                            formControl: "input-4",
                            value: expenditure as number,
                            index: 3,
                            row: 1,
                            column: 1,
                            isFlex: true,
                            type: "number"
                          },
                          {
                            label: "Nombre de la zona",
                            formControl: "input-5",
                            value: this.deliveryZone.zona as string,
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
                            greaterAmount: (greaterAmount && greaterAmount > 0) ? Number(greaterAmount) : null,
                            greaterAmountLimit: (greaterAmount && greaterAmount > 0) ? Number(greaterAmount) : null,
                            lesserAmountLimit: Number(lesserAmount),
                            type: 'lesser',
                            id: "yes-depend-amount-1"
                          });
              
                          console.log(this.deliveryData);
          
                          const zone = this.deliveryData.find((item) => item.id === 'yes-depend-amount-1');
                          if (
                            zone.lesserAmount === 0 ||
                            zone.lesserAmountLimit === 0 ||
                            zone.amount === 0 ||
                            zone.zona === ''
                          ) {
                            console.log("Step inválido");
                            this.dialogFlowService.swiperConfig.allowSlideNext = false;
                          } else {
                            this.dialogFlowService.swiperConfig.allowSlideNext = true;
                          }
          
                          if (!(this.dialogsPro[this.dialogsPro.length - 1].componentId === 'end')) this.dialogsPro.push(this.endDialog);
                        },
                      },
                    ],
                };
                this.dialogsPro.push(yesDependAmountDialogs);
                break;
            case 'free':
                const noDependDialogs = {
                    component: DialogFormComponent,
                    componentId: 'no-deliveryzone-1',
                    inputs: {
                      dialogId: 'no-deliveryzone-1',
                      containerStyles: {},
                      title: {
                        text: this.deliveryZone.zona
                      },
                      fields: {
                        inputs: [
                          {
                            label: "$ que te cuesta (egreso)",
                            formControl: "input-1",
                            value: expenditure as number,
                            index: 0,
                            row: 0,
                            column: 0,
                            isFlex: true,
                            type: "number"
                          },
                          {
                            label: "Nombre de la zona:",
                            formControl: "input-2",
                            value: this.deliveryZone.zona as string,
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
          
                          const zone = this.deliveryData.find((item) => item.id === 'no-deliveryzone-1');
                          if (zone.zona === '') {
                            console.log("Step inválido");
                            this.dialogFlowService.swiperConfig.allowSlideNext = false;
                          } else {
                            this.dialogFlowService.swiperConfig.allowSlideNext = true;
                          }
          
                          if (!(this.dialogsPro[this.dialogsPro.length - 1].componentId === 'end')) this.dialogsPro.push(this.endDialog);
                        },
                      },
                    ],
                };
                this.dialogsPro.push(noDependDialogs);
                break;
        }

        return this.dialogsPro;
    }
}