import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-delivery-orders',
  templateUrl: './delivery-orders.component.html',
  styleUrls: ['./delivery-orders.component.scss']
})
export class DeliveryOrdersComponent implements OnInit {

  env: string = environment.assetsUrl;

  merchant: Merchant;
  orders: ItemOrder[] = [];
  facturasDisplayArray: Array<{
    image: string,
    username: string,
    total: number,
    date: Date
  }>;

  totalIncome: number;

  constructor(
    private merchantsService: MerchantsService,
    public router: Router
  ) { }

  async ngOnInit() {
    await this.getMerchant();
    await this.getOrders(this.merchant._id);
    this.getTotalIncome(this.orders);
  }

  async getMerchant() {
    try {
      const result = await this.merchantsService.merchantDefault();
      this.merchant = result;
    } catch (error) {
      console.log(error);
    }
  }

  async getOrders(merchantId: string) {
    try {
      const result = await this.merchantsService.ordersByMerchant(
        merchantId,
        {
          options: {
            limit: -1,
            sortBy: 'createdAt:desc',
          },
          findBy: {
            orderStatusDelivery: [ 'in progress', 'pending'],
          }
        }
      );

      this.orders = result.ordersByMerchant;

      this.facturasDisplayArray = this.orders.map(order => {
        return {
          image: order?.user?.image ? order.user?.image : 'https://www.gravatar.com/avatar/0?s=250&d=mp',
          username: order?.user ? order?.user?.name : 'Usuario eliminado',
          total: order.subtotals.reduce((subtotalAccumulator, subtotal) => {
            return subtotalAccumulator + subtotal.amount;
          }, 0),
          date: new Date(order.createdAt)
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  getTotalIncome(orders: ItemOrder[]) {
    this.totalIncome = orders.reduce((accumulator, order) => {
      return accumulator + order.subtotals.reduce((subtotalAccumulator, subtotal) => {
        return subtotalAccumulator + subtotal.amount;
      }, 0);
    }, 0);
  }

  share() {
    console.log('share');
  }

  settings() {
    console.log('settings');
  }

}
