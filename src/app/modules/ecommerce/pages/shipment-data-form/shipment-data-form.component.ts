import {
  Component,
  OnInit,
  Input,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
//import { MultistepFormComponent } from 'src/app/shared/components/multistep-form/multistep-form.component';
import { Observable, Subscription } from 'rxjs';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { InformationBoxComponent } from 'src/app/shared/components/information-box/information-box.component';
import { MagicLinkDialogComponent } from 'src/app/shared/components/magic-link-dialog/magic-link-dialog.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { HeaderService } from 'src/app/core/services/header.service';

interface FieldStyles {
  fieldStyles?: any;
  containerStyles?: any;
  topLabelActionStyles?: any;
  labelStyles?: any;
  bottomLabelStyles?: any;
  customClassName?: string; //you must use ::ng-deep in the scss of the parent component
}

interface FormField {
  name: string;
  styles?: FieldStyles;
  fieldControl: FormControl | FormArray;
  changeCallbackFunction?(...params): any;
  changeFunctionSubscription?: Subscription;
  selectionOptions?: Array<string>;
  validators?: Array<any>;
  description?: string;
  topLabelAction?: {
    text: string;
    clickable?: boolean;
    callback?: (...params) => any;
  };
  label: string;
  bottomLabel?: {
    text: string;
    clickable?: boolean;
    callback?: (...params) => any;
  };
  placeholder?: string;
  inputType?: string;
  showImageBottomLabel?: string;
  multiple?: boolean;
}

interface EmbeddedComponentOutput {
  name: string;
  callback(params: any): any;
}

interface EmbeddedComponent {
  component: Type<any>;
  inputs: Record<string, any>;
  outputs?: Array<EmbeddedComponentOutput>;
  containerStyles?: any;
  afterIndex: number;
}

interface PromiseFunction {
  type: 'promise';
  function(params): Promise<any>;
}

interface ObservableFunction {
  type: 'observable';
  function(params): Observable<any>;
}

type AsyncFunction = PromiseFunction | ObservableFunction;

interface FormStep {
  fieldsList: Array<FormField>;
  headerText: string;
  embeddedComponents?: Array<EmbeddedComponent>;
  accessCondition?(...params): boolean;
  stepButtonValidText: string;
  stepButtonInvalidText: string;
  asyncStepProcessingFunction?: AsyncFunction;
  stepProcessingFunction?(...params): any;
  customScrollToStep?(...params): any;
  customScrollToStepBackwards?(...params): any;
  bottomLeftAction?: BottomLeftAction;
  optionalLinksTo?: OptionalLinks;
  stepResult?: any;
}

interface BottomLeftAction {
  text: string;
  execute(params): any;
}

interface OptionalLinks {
  styles?: FieldStyles;
  links: Array<OptionalLink>;
}

interface OptionalLink {
  text: string;
  action(params): any;
}

@Component({
  selector: 'app-shipment-data-form',
  templateUrl: './shipment-data-form.component.html',
  styleUrls: ['./shipment-data-form.component.scss'],
})
export class ShipmentDataFormComponent implements OnInit {
  createdOrderWithDelivery = false;
  createdOrderWithoutDelivery = false;

  constructor(
    private header: HeaderService,
    private router: Router,
    private dialog: DialogService
  ) {}

  steps: Array<FormStep> = [
    {
      fieldsList: [
        {
          name: 'street',
          fieldControl: new FormControl('', Validators.required),
          label: 'Dónde entregaremos?',
          inputType: 'textarea',
          placeholder: 'Escriba la calle, número, (nombre del edificio)',
          topLabelAction: {
            text: 'Sin envio, lo pasaré a recoger',
            clickable: true,
            callback: async (params) => {
              if (this.createdOrderWithDelivery === true) {
                this.header.orderId = null;
                this.createdOrderWithDelivery = false;
              }

              let preOrderID;
              let whatsappLinkQueryParams;
              const pickupLocation =
                this.header.saleflow.module.delivery.pickUpLocations[0]
                  .nickName;
              const deliveryData = {
                nickName: pickupLocation,
              };
              if (
                this.header.order?.products &&
                this.header.order?.products?.length > 0
              )
                this.header.order.products[0].deliveryLocation = deliveryData;
              this.header.storeLocation(this.header.saleflow._id, deliveryData);
              this.header.isComplete.delivery = true;
              this.header.storeOrderProgress(this.header.saleflow._id);

              if (!this.header.orderId) {
                lockUI();

                preOrderID = await this.header.createPreOrder();
                this.header.orderId = preOrderID;

                whatsappLinkQueryParams = {
                  'Keyword-Order': preOrderID as string,
                };

                unlockUI();
                this.openDialog(whatsappLinkQueryParams);
                this.createdOrderWithoutDelivery = true;
              } else {
                this.openDialog({
                  'Keyword-Order': this.header.orderId as string,
                });
              }
            },
          },
          styles: {
            containerStyles: {
              marginTop: '60px',
            },
            fieldStyles: {
              backgroundColor: 'white',
              height: '180px',
              borderRadius: '10px',
            },
            topLabelActionStyles: {
              color: '#27A2FF',
              fontFamily: 'Roboto',
              fontSize: '17px',
              fontStyle: 'italic',
            },
            labelStyles: {
              marginTop: '34px',
              fontWeight: '600',
            },
          },
        },
      ],
      embeddedComponents: [
        {
          component: InformationBoxComponent,
          inputs: {
            text: 'Los envios son exclusivamente en Santo Domingo, República Dominicana.',
          },
          afterIndex: 0,
          containerStyles: {
            marginTop: '129px',
          },
        },
      ],
      customScrollToStepBackwards: (params) => {
        if (params.scrollableForm) {
          params.unblockScrollPastCurrentStep();
          params.unblockScrollBeforeCurrentStep();
        }

        this.router.navigate(['ecommerce/create-giftcard']);
      },
      asyncStepProcessingFunction: {
        type: 'promise',
        function: async (params) => {
          let preOrderID;
          let whatsappLinkQueryParams;

          if(this.createdOrderWithoutDelivery) {
            this.createdOrderWithoutDelivery = false;
            this.header.orderId = null;
          }

          const deliveryData = {
            street: params.dataModel.value['1'].street,
            note: params.dataModel.value['1'].note,
            city: 'Santo Domingo',
          };
          if (
            this.header.order?.products &&
            this.header.order?.products?.length > 0
          )
            this.header.order.products[0].deliveryLocation = deliveryData;
          this.header.storeLocation(
            this.header.getSaleflow()._id,
            deliveryData
          );
          this.header.isComplete.delivery = true;
          this.header.storeOrderProgress(this.header.saleflow._id);

          if (!this.header.orderId && !this.createdOrderWithDelivery) {
            lockUI();

            preOrderID = await this.header.createPreOrder();
            this.header.orderId = preOrderID;

            whatsappLinkQueryParams = {
              'Keyword-Order': preOrderID as string,
            };

            unlockUI();
            this.openDialog(whatsappLinkQueryParams);
            this.createdOrderWithDelivery = true;
          } else {
            this.openDialog({
              'Keyword-Order': this.header.orderId as string,
            });
          }
          // this.router.navigate([`ecommerce/flow-completion`]);
          return { ok: true };
        },
      },
      headerText: 'INFORMACION DE LA ENTREGA',
      stepButtonInvalidText: 'ADICIONA DIRECCIÓN DEL ENVIO',
      stepButtonValidText: 'CONTINUAR',
    },
  ];

  ngOnInit(): void {
    this.header.flowRoute = 'shipment-data-form';
    localStorage.setItem('flowRoute', 'shipment-data-form');
    const saleflowData =
      this.header.saleflow || JSON.parse(localStorage.getItem('saleflow-data'));
    const orderData = this.header.getOrder(saleflowData._id);

    if (!saleflowData) {
      const saleflow = this.header.getSaleflow();
      if (saleflow) {
        this.header.saleflow = saleflow;
        this.header.order = orderData;
        if (!this.header.order) {
          this.router.navigate([
            `/ecommerce/megaphone-v3/61b8df151e8962cdd6f30feb`,
          ]);
          return;
        }
        this.header.getOrderProgress(saleflow._id);
        const items = this.header.getItems(saleflow._id);
        if (items && items.length > 0) this.header.items = items;
        else {
          this.router.navigate([
            `/ecommerce/megaphone-v3/61b8df151e8962cdd6f30feb`,
          ]);
        }
      } else {
        this.router.navigate([
          `/ecommerce/megaphone-v3/61b8df151e8962cdd6f30feb`,
        ]);
      }
    } else {
      this.header.order = orderData;

      console.log(orderData);
      if (!this.header.order) {
        this.router.navigate([
          `/ecommerce/megaphone-v3/61b8df151e8962cdd6f30feb`,
        ]);
        return;
      }
      const items = this.header.getItems(this.header.saleflow._id);
      if (items && items.length > 0) this.header.items = items;
      else {
        console.log(5);
        this.router.navigate([
          `/ecommerce/megaphone-v3/61b8df151e8962cdd6f30feb`,
        ]);
      }
    }
  }

  openDialog(whatsappLinkQueryParams: Record<string, string>) {
    this.dialog.open(MagicLinkDialogComponent, {
      type: 'flat-action-sheet',
      props: {
        ids: whatsappLinkQueryParams,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }
}
