import { Component, OnInit } from '@angular/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { Router } from '@angular/router';
import { SaleFlow } from '../../../core/models/saleflow';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-magic-link-dialog',
  templateUrl: './magic-link-dialog.component.html',
  styleUrls: ['./magic-link-dialog.component.scss'],
})
export class MagicLinkDialogComponent implements OnInit {
  whatsappLink: string;
  saleflowData: SaleFlow;

  constructor(
    private order: OrderService,
    private ref: DialogRef,
    private router: Router,
    private customizerValueService: CustomizerValueService,
    private header: HeaderService
  ) {}

  ngOnInit(): void {}

  async createPreOrder() {
    const saleflow =
      this.header.saleflow || JSON.parse(localStorage.getItem('saleflow-data'));
    this.saleflowData = saleflow;

    this.header.order = this.header.getOrder(saleflow._id);

    this.header.order.products.forEach((product) => {
      delete product.isScenario;
      delete product.limitScenario;
      delete product.name;
    });

    return new Promise(async (resolve, reject) => {
      let customizer = this.header.customizer;

      if (!this.header.customizer) {
        const saleflowData = JSON.parse(localStorage.getItem('saleflow-data'));
        const customizerPreview = JSON.parse(
          localStorage.getItem('customizerFile')
        );

        let saleflow = JSON.parse(localStorage.getItem(saleflowData._id));

        if ('customizer' in saleflow) {
          customizer = saleflow.customizer;

          const res: Response = await fetch(customizerPreview.base64);
          const blob: Blob = await res.blob();

          customizer.preview = new File([blob], customizerPreview.fileName, {
            type: customizerPreview.type,
          });
        }
      }

      if (customizer) {
        const customizerId =
          await this.customizerValueService.createCustomizerValue(customizer);

        this.header.order.products[0].customizer = customizerId;
        this.header.customizer = null;
        this.header.customizerData = null;
      }

      if (saleflow.module.post) {
        console.log('1');
        // if (!this.comesFromMagicLink) this.header.emptyPost(saleflow._id);
        if (saleflow.canBuyMultipleItems)
          this.header.order.products.forEach((product) => {
            const createdPostId = localStorage.getItem('createdPostId');

            product.deliveryLocation =
              this.header.order.products[0].deliveryLocation;
            product.post = createdPostId;
          });

        try {
          const { createPreOrder } = await this.order.createPreOrder(
            this.header.order
          );

          this.header.deleteSaleflowOrder(saleflow._id);
          this.header.resetIsComplete();
          this.header.orderId = createPreOrder._id;
          this.header.currentMessageOption = undefined;
          this.header.post = undefined;
          this.header.locationData = undefined;
          // this.app.events.emit({ type: 'order-done', data: true });
          resolve(createPreOrder._id);
        } catch (error) {
          console.log(error);
          reject('Error creando la orden');
        }
      } else {
        try {
          console.log('2');
          const { createPreOrder } = await this.order.createPreOrder(
            this.header.order
          );

          this.header.deleteSaleflowOrder(saleflow._id);
          this.header.resetIsComplete();
          this.header.orderId = createPreOrder._id;
          // this.app.events.emit({ type: 'order-done', data: true });
          resolve(createPreOrder._id);
        } catch (error) {
          console.log(error);
          reject('Error creando la orden');
        }
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  async storeRouteState() {
    const createdPreOrderId = await this.createPreOrder();
    console.log(createdPreOrderId);

    this.whatsappLink = `https://wa.me/19295263397?text=Keyword-Order%20 ${createdPreOrderId}`;
    const currentRoute = this.router.url;

    localStorage.setItem('currentRoute', JSON.stringify(currentRoute));

    let linkRef = document.querySelector(`#sendWS`) as HTMLAnchorElement;
    linkRef.href = this.whatsappLink;
    // linkRef.click();

    // this.close();
  }

  close() {
    this.ref.close();
  }
}
