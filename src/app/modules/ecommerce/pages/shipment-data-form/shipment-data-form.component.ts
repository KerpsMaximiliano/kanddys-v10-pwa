import { Component, OnInit } from '@angular/core';
//import { MultistepFormComponent } from 'src/app/shared/components/multistep-form/multistep-form.component';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { FormStep } from 'src/app/core/types/multistep-form';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { InformationBoxComponent } from 'src/app/shared/components/information-box/information-box.component';
import { MagicLinkDialogComponent } from 'src/app/shared/components/magic-link-dialog/magic-link-dialog.component';

@Component({
  selector: 'app-shipment-data-form',
  templateUrl: './shipment-data-form.component.html',
  styleUrls: ['./shipment-data-form.component.scss'],
})
export class ShipmentDataFormComponent implements OnInit {
  saleflowData: SaleFlow;

  constructor(
    private header: HeaderService,
    private router: Router,
    private dialog: DialogService
  ) {}

  getStoredDeliveryLocation() {
    const saleflowData: SaleFlow =
      this.header.saleflow || JSON.parse(localStorage.getItem('saleflow-data'));
    const orderData = this.header.getOrder(saleflowData._id);
    let deliveryLocation = null;

    if (orderData.products.length > 0 && orderData.products[0].deliveryLocation)
      deliveryLocation = orderData.products[0].deliveryLocation.street;

    return deliveryLocation;
  }

  steps: Array<FormStep> = [
    {
      fieldsList: [
        {
          name: 'street',
          fieldControl: {
            type: 'single',
            control: new FormControl(
              this.getStoredDeliveryLocation() || '',
              Validators.required
            ),
          },
          label: 'Dónde entregaremos?',
          inputType: 'textarea',
          enabledOnInit: !this.header.disableGiftMessageTextarea
            ? 'ENABLED'
            : 'DISABLED',
          placeholder: 'Escriba la calle, número, (nombre del edificio)',
          topLabelAction: {
            text: 'Sin envio, lo pasaré a recoger',
            clickable: true,
            callback: async (params) => {
              // if (this.header.createdOrderWithDelivery === true) {
              //   this.header.orderId = null;
              //   this.header.createdOrderWithDelivery = false;
              // }

              let preOrderID;
              let whatsappLinkQueryParams;

              if (this.saleflowData.module.delivery) {
                this.header.storedDeliveryLocation =
                  this.saleflowData.module.delivery.pickUpLocations[0].nickName;
              }

              const pickupLocation = this.saleflowData.module.delivery
                ? this.saleflowData.module.delivery.pickUpLocations[0].nickName
                : this.header.storedDeliveryLocation;
              const deliveryData = {
                nickName: pickupLocation,
              };
              if (
                this.header.order?.products &&
                this.header.order?.products?.length > 0
              )
                this.header.order.products[0].deliveryLocation = deliveryData;
              this.header.storeLocation(this.saleflowData._id, deliveryData);
              this.header.isComplete.delivery = true;
              this.header.storeOrderProgress(this.saleflowData._id);

              this.header.disableGiftMessageTextarea = false;

              //========================= CÓDIGO PARA CREAR PREORDER =========================
              this.router.navigate([`ecommerce/checkout`]);
              this.header.createdOrderWithoutDelivery = true;
              return { ok: true };
              //========================= CÓDIGO PARA CREAR PREORDER =========================
            },
          },
          styles: {
            containerStyles: {
              marginTop: '30px',
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
              cursor: 'pointer',
              marginBottom: '33px',
            },
            labelStyles: {
              marginTop: '20px',
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
            marginTop: '30px',
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

          if (this.header.createdOrderWithoutDelivery) {
            this.header.createdOrderWithoutDelivery = false;
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
          ) {
            this.header.order.products.forEach((product) => {
              product.deliveryLocation = deliveryData;
            });
          }
          this.header.storeLocation(
            this.header.getSaleflow()._id,
            deliveryData
          );
          this.header.isComplete.delivery = true;
          this.header.storeOrderProgress(
            this.header.saleflow?._id || this.header.getSaleflow()?._id
          );

          //========================= CÓDIGO PARA CREAR PREORDER =========================
          this.router.navigate([`ecommerce/checkout`]);
          return { ok: true };

          //========================= CÓDIGO PARA CREAR PREORDER =========================
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
    this.saleflowData = saleflowData;
    const orderData = this.header.getOrder(saleflowData._id);

    if (!saleflowData) {
      const saleflow = this.header.getSaleflow();
      if (saleflow) {
        this.header.saleflow = saleflow;
        this.header.order = orderData;
        if (!this.header.order) {
          this.router.navigate([`/ecommerce/store/61b8df151e8962cdd6f30feb`]);
          return;
        }
        this.header.getOrderProgress(saleflow._id);
        const items = this.header.getItems(saleflow._id);
        if (items && items.length > 0) this.header.items = items;
        else {
          this.router.navigate([`/ecommerce/store/61b8df151e8962cdd6f30feb`]);
        }
      } else {
        this.router.navigate([`/ecommerce/store/61b8df151e8962cdd6f30feb`]);
      }
    } else {
      this.header.order = orderData;
      if (!this.header.order) {
        this.router.navigate([`/ecommerce/store/61b8df151e8962cdd6f30feb`]);
        return;
      }
      const items = this.header.getItems(saleflowData._id);
      if (items && items.length > 0) this.header.items = items;
      else {
        this.router.navigate([`/ecommerce/store/61b8df151e8962cdd6f30feb`]);
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
