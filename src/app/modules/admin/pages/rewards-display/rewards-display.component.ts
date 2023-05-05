import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemOrder } from 'src/app/core/models/order';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { environment } from 'src/environments/environment';
import Swiper, { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-rewards-display',
  templateUrl: './rewards-display.component.html',
  styleUrls: ['./rewards-display.component.scss'],
})
export class RewardsDisplayComponent implements OnInit {
  env: string = environment.assetsUrl;

  facturas = [
    {
      img: './assets/images/noimage.png',
      title: 'Mira',
      subtitle: 'lo facturado',
      amount: 168,
      notification: true,
      bottomText: '70 de transferencias. 80 por tarjetas de crédito. 50 fotos.',
    },
  ];

  facturas2 = [
    {
      img: './assets/images/noimage.png',
      title: 'ProgresoID',
      subtitle: 'de facturas',
      amount: 168,
    },
    {
      img: './assets/images/noimage.png',
      title: 'ProgresoID',
      subtitle: 'de facturas',
      amount: 168,
    },
    {
      img: './assets/images/noimage.png',
      title: 'ProgresoID',
      subtitle: 'de facturas',
      amount: 168,
    },
    {
      img: './assets/images/noimage.png',
      title: 'ProgresoID',
      subtitle: 'de facturas',
      amount: 168,
    },
  ];

  ingresos = [
    {
      img: './assets/images/noimage.png',
      title: 'Control',
      subtitle: 'y reporte de tus beneficios',
      amount: 168,
      notification: false,
      bottomText: 'Maneja las zonas de las entregas. Salarios. Costos.',
    },
  ];

  ingresos2 = [
    {
      img: './assets/images/noimage.png',
      title: 'Coordina',
      subtitle: 'por las zonas de las entregas',
      amount: 168,
      notification: false,
      bottomText: '7 para zonaID. 8 para zonaID',
    },
  ];

  ordersToConfirm: ItemOrder[] = [];
  ordersByDeliveryStatus: ItemOrder[] = [];

  ordersInPreparation: ItemOrder[] = [];
  ordersToBeDelivered: ItemOrder[] = [];
  ordersDelivered: ItemOrder[] = [];

  redirectTo: string = null;

  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    resistance: false,
    freeMode: false,
    spaceBetween: 5,
  };

  isFacturas: boolean = true;
  isIngresos: boolean = false;

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
        this.getOrdersByDeliveryStatus(),
      ]);
    });
  }

  selectFacturas() {
    this.isFacturas = true;
    this.isIngresos = false;
    console.log('Facturas');
  }

  selectIngresos() {
    this.isFacturas = false;
    this.isIngresos = true;
    console.log('Ingresos');
  }

  async getOrdersToConfirm() {
    try {
      const { ordersByMerchant } =
        await this._MerchantsService.ordersByMerchant(
          this._MerchantsService.merchantData._id,
          {
            options: {
              limit: -1,
              sortBy: 'createdAt:desc',
            },
            findBy: {
              orderStatus: 'to confirm',
            },
          }
        );

      this.ordersToConfirm = ordersByMerchant;
    } catch (error) {
      console.log(error);
    }
  }

  async getOrdersByDeliveryStatus() {
    try {
      const { ordersByMerchant } =
        await this._MerchantsService.ordersByMerchant(
          this._MerchantsService.merchantData._id,
          {
            options: {
              limit: -1,
              sortBy: 'createdAt:desc',
            },
            findBy: {
              orderStatusDelivery: ['delivered', 'pending', 'in progress'],
            },
          }
        );

      this.ordersByDeliveryStatus = ordersByMerchant;

      this.ordersInPreparation = ordersByMerchant.filter(
        (order) => order.orderStatusDelivery === 'in progress'
      );
      this.ordersToBeDelivered = ordersByMerchant.filter(
        (order) => order.orderStatusDelivery === 'pending'
      );
      this.ordersDelivered = ordersByMerchant.filter(
        (order) => order.orderStatusDelivery === 'delivered'
      );
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
