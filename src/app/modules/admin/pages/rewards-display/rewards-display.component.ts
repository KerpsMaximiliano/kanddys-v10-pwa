import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemOrder } from 'src/app/core/models/order';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-rewards-display',
  templateUrl: './rewards-display.component.html',
  styleUrls: ['./rewards-display.component.scss'],
})
export class RewardsDisplayComponent implements OnInit {
  env: string = environment.assetsUrl;

  cards = [
    {
      img: './assets/images/noimage.png',
      title: 'Válida',
      subtitle: 'propuesta de exhibiciones',
      amount: 168,
      notification: true,
      bottomText: '70 KiosKeros te han mandado propuestas',
    },
    {
      img: './assets/images/noimage.png',
      title: 'Confirma',
      subtitle: 'pagos de facturas',
      amount: 168,
      notification: true,
      bottomText: '70 de transferencias. 80 por tarjetas de crédito. 50 fotos.',
    },
    {
      img: './assets/images/noimage.png',
      title: 'Confirma',
      subtitle: 'pagos de facturas',
      amount: 168,
      notification: true,
      bottomText: '70 de transferencias. 80 por tarjetas de crédito. 50 fotos.',
    },
    {
      img: './assets/images/noimage.png',
      title: 'Confirma',
      subtitle: 'pagos de facturas',
      amount: 168,
      notification: false,
      bottomText: '70 de transferencias. 80 por tarjetas de crédito. 50 fotos.',
    },
    {
      img: './assets/images/noimage.png',
      title: 'Confirma',
      subtitle: 'pagos de facturas',
      amount: 168,
      notification: false,
      bottomText: '70 de transferencias. 80 por tarjetas de crédito. 50 fotos.',
    },
    {
      img: './assets/images/noimage.png',
      title: 'Confirma',
      subtitle: 'pagos de facturas',
      amount: 168,
      notification: false,
      bottomText: '70 de transferencias. 80 por tarjetas de crédito. 50 fotos.',
    },
    {
      img: './assets/images/noimage.png',
      title: 'Confirma',
      subtitle: 'pagos de facturas',
      amount: 168,
      notification: false,
      bottomText: '70 de transferencias. 80 por tarjetas de crédito. 50 fotos.',
    },
  ];

  cards2 = [
    {
      img: './assets/images/noimage.png',
      title: 'Válida',
      subtitle: 'propuesta de exhibiciones',
      amount: 168,
    },
    {
      img: './assets/images/noimage.png',
      title: 'Confirma',
      subtitle: 'pagos de facturas',
      amount: 168,
    },
    {
      img: './assets/images/noimage.png',
      title: 'Confirma',
      subtitle: 'pagos de facturas',
      amount: 168,
    },
    {
      img: './assets/images/noimage.png',
      title: 'Confirma',
      subtitle: 'pagos de facturas',
      amount: 168,
    },
    {
      img: './assets/images/noimage.png',
      title: 'Confirma',
      subtitle: 'pagos de facturas',
      amount: 168,
    },
  ];

  ordersToConfirm: ItemOrder[] = [];
  ordersByDeliveryStatus: ItemOrder[] = [];

  ordersInPreparation: ItemOrder[] = [];
  ordersToBeDelivered: ItemOrder[] = [];
  ordersDelivered: ItemOrder[] = [];


  redirectTo: string = null;

  constructor(
    private _MerchantsService: MerchantsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { redirectTo } = queryParams;

      this.redirectTo = redirectTo;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;

      await Promise.all([
        this.getOrdersToConfirm(),
        this.getOrdersByDeliveryStatus()
      ]);
    });

  }

  async getOrdersToConfirm() {
    try {
      const { ordersByMerchant } = await this._MerchantsService.ordersByMerchant(
        this._MerchantsService.merchantData._id,
        {
          options: {
            limit: -1,
            sortBy: 'createdAt:desc'
          },
          findBy: {
            orderStatus: 'to confirm'
          }
        }
      );

      this.ordersToConfirm = ordersByMerchant;


    } catch (error) {
      console.log(error);
    }
  }

  async getOrdersByDeliveryStatus() {
    try {
      const { ordersByMerchant } = await this._MerchantsService.ordersByMerchant(
        this._MerchantsService.merchantData._id,
        {
          options: {
            limit: -1,
            sortBy: 'createdAt:desc'
          },
          findBy: {
            orderStatusDelivery: ['delivered', 'pending', 'in progress']
          }
        }
      );

      this.ordersByDeliveryStatus = ordersByMerchant;

      this.ordersInPreparation = ordersByMerchant.filter(order => order.orderStatusDelivery === 'in progress');
      this.ordersToBeDelivered = ordersByMerchant.filter(order => order.orderStatusDelivery === 'pending');
      this.ordersDelivered = ordersByMerchant.filter(order => order.orderStatusDelivery === 'delivered');
    } catch (error) {
      console.log(error);
    }
  }

  returnEvent() {
    let queryParams = {};
    if (this.redirectTo.includes('?')) {
      const url = this.redirectTo.split('?');
      this.redirectTo = url[0];
      const queryParamList = url[1].split('&');
      for (const param in queryParamList) {
        const keyValue = queryParamList[param].split('=');
        queryParams[keyValue[0]] = keyValue[1];
      }
    }
    this.router.navigate([this.redirectTo], {
      queryParams,
    });
  }
}
