import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemOrder } from 'src/app/core/models/order';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
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

  generalOrders = [];

  progressOrders = [];

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

  deliveryzones = [];

  ordersToConfirm: ItemOrder[] = [];
  ordersByDeliveryStatus: ItemOrder[] = [];

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
    private _DeliveryZonesService: DeliveryZonesService,
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
        this.getDeliveryZones()
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
          },
          true
        );

      this.ordersToConfirm = ordersByMerchant;

      this.generalOrders.push({
        img: './assets/images/noimage.png',
        title: 'Confirma',
        subtitle: 'pagos de facturas',
        amount: this.ordersToConfirm.length,
        notification: this.ordersToConfirm.length > 0 ? true : false,
        bottomText: `${this.ordersToConfirm.length} de transferencias.`,
        callback: () => {
          this.router.navigate([`/admin/order-slides`]);
        }
      });
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
          },
          true
        );

      this.ordersByDeliveryStatus = ordersByMerchant;

      const ordersInPreparation = ordersByMerchant.filter(
        (order) => order.orderStatusDelivery === 'in progress'
      );
      const ordersToBeDelivered = ordersByMerchant.filter(
        (order) => order.orderStatusDelivery === 'pending'
      );
      const ordersDelivered = ordersByMerchant.filter(
        (order) => order.orderStatusDelivery === 'delivered'
      );

      this.progressOrders.push(
        {
          img: './assets/images/noimage.png',
          title: 'En preparación',
          subtitle: '',
          amount: ordersInPreparation.length,
          callback: () => {
            // Aquí va la navegación a ver las facturas de este status
          }
        },
        {
          img: './assets/images/noimage.png',
          title: 'Listo para enviarse',
          subtitle: '',
          amount: ordersToBeDelivered.length,
          callback: () => {
            // Aquí va la navegación a ver las facturas de este status
          }
        },
        {
          img: './assets/images/noimage.png',
          title: 'Entregado',
          subtitle: '',
          amount: ordersDelivered.length,
          callback: () => {
            // Aquí va la navegación a ver las facturas de este status
          }
        },
      );
    } catch (error) {
      console.log(error);
    }
  }

  async getDeliveryZones() {
    const result = await this._DeliveryZonesService.deliveryZones(
      {
        options: {
          limit: -1
        },
        findBy: {
          merchant: this._MerchantsService.merchantData._id
        }
      }
    )

    this.deliveryzones.push(
      {
        img: './assets/images/noimage.png',
        title: 'Coordina',
        subtitle: 'por las zonas de las entregas',
        amount: result.length,
        notification: false,
        callback: () => {
          this.router.navigate([`/admin/delivery-zones`]);
        }
      }
    )

    
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
