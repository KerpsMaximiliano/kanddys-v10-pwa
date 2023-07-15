import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-order-progress-filtering',
  templateUrl: './order-progress-filtering.component.html',
  styleUrls: ['./order-progress-filtering.component.scss']
})
export class OrderProgressFilteringComponent implements OnInit {

  progress = [
    { id: 1, name: 'progressId(23)', selected: true },
    { id: 2, name: 'progressId(12)', selected: false },
    { id: 3, name: 'progressId(53)', selected: false },
    { id: 4, name: 'progressId(76)', selected: false },
  ];

  orders: ItemOrder[] = [];
  merchantFilters: Merchant[] = [];

  formatID = formatID;

  constructor(
    private ordersService: OrderService,
    private location: Location
  ) {}

  async ngOnInit() {
    await this.getOrders();
    this.getMerchantsWithoutRepeat();
    console.log(this.merchantFilters);
  }

  select(id) {
    this.progress.forEach((e) => {
      if (e.id == id) {
        e.selected = !e.selected;
      }
    });
  }

  async getOrders() {
    try {
      const result = await this.ordersService.ordersByUser(
        {
          findBy: {
            orderType: "supplier"
          },
          options: {
            limit: -1,
            sortBy: "createdAt:desc",
          }
        }
      )
      this.orders = result.ordersByUser;
    } catch (error) {
      console.log()
    }
  }

  getMerchantsWithoutRepeat() {
    this.orders.forEach((order) => {
      if (this.merchantFilters.length == 0) {
        this.merchantFilters.push(order.items[0].saleflow.merchant);
      } else {
        const merchant = this.merchantFilters.find((merchant) => merchant._id == order.items[0].saleflow.merchant._id);
        if (!merchant) {
          this.merchantFilters.push(order.items[0].saleflow.merchant);
        }
      }
    });
  }

  goBack() {
    this.location.back();
  }

}
