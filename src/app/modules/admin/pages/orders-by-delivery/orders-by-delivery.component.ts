import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DeliveryZone } from 'src/app/core/models/deliveryzone';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-orders-by-delivery',
  templateUrl: './orders-by-delivery.component.html',
  styleUrls: ['./orders-by-delivery.component.scss']
})
export class OrdersByDeliveryComponent implements OnInit {

  routeParamsSubscription: Subscription;
  merchant: Merchant;
  orders: ItemOrder[] = [];
  facturasDisplayArray: Array<{
    image: string
    username: string,
    total: number,
    date: Date
  }> = [];
  totalIncome: number = 0;
  deliveryZone: DeliveryZone;

  env: string = environment.assetsUrl;

  constructor(
    private route: ActivatedRoute,
    private merchantsService: MerchantsService,
    private deliveryzonesService: DeliveryZonesService,
  ) { }

  async ngOnInit() {
    await this.getMerchant();
    this.routeParamsSubscription = this.route.params.subscribe(
      async (routeParams) => {
        const { deliveryId } = routeParams;
        await Promise.all([
          this.getDeliveryZone(deliveryId),
          this.getOrders(deliveryId)
        ]);
      }
    );
  }

  async getMerchant() {
    try {
      const result = await this.merchantsService.merchantDefault()
      this.merchant = result;
    } catch (error) {
      console.log(error)
    }
  }

  async getDeliveryZone(deliveryId: string) {
    try {
      const result = await this.deliveryzonesService.deliveryZone(
        deliveryId
      );

      this.deliveryZone = result;
    } catch (error) {
      console.log(error);
    }
  }

  async getOrders(deliveryId: string) {
    try {
      const result = await this.merchantsService.ordersByMerchant(
        this.merchant._id,
        {
          options: {
            limit: -1,
            sortBy: "createdAt:desc",
          },
          findBy: {
            deliveryZone: deliveryId,
            orderStatus: ["to confirm", "paid", "completed"]
          }
        }
      );

      this.orders = result.ordersByMerchant;

      this.facturasDisplayArray = this.orders.map(order => {
        return {
          image: order.user.image ? order.user.image : 'https://www.gravatar.com/avatar/0?s=250&d=mp',
          username: order.user.name,
          total: order.subtotals.reduce((subtotalAccumulator, subtotal) => {
            return subtotalAccumulator + subtotal.amount;
          }, 0),
          date: new Date(order.createdAt)
        }
      });

      this.totalIncome = this.calculateIncomeByDelivery(this.orders);
      
    } catch (error) {
      console.log(error);
    }
  }

  calculateIncomeByDelivery(orders: ItemOrder[]) {
    const totalAmount = orders.reduce((accumulator, order) => {
      const subtotalAmount = order.subtotals.reduce((subtotalAccumulator, subtotal) => {
        return subtotalAccumulator + subtotal.amount;
      }, 0);
      return accumulator + subtotalAmount;
    }, 0);

    return totalAmount;
  }

}
