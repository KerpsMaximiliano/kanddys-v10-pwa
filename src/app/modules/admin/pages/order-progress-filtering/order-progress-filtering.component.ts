import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  orders: ItemOrder[] = [];
  filteredOrders: ItemOrder[] = [];

  merchantFilters: Array<{
    merchant: Merchant;
    selected: boolean;
  }> = [];

  quotationID: string;

  formatID = formatID;

  constructor(
    private ordersService: OrderService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.activatedRoute.queryParams.subscribe(async (params) => {
      this.quotationID = params.quotationID;
      await this.getOrders();
      this.getMerchantsWithoutRepeat();
      console.log(this.merchantFilters);
    });
  }

  selectMerchantFilter(merchantFilter) {
    merchantFilter.selected = !merchantFilter.selected;
    this.filterOrdersBySelectedMerchantFilters();
  }

  // TODO - Refactor this method
  private filterOrdersBySelectedMerchantFilters() {
    console.log(this.merchantFilters);
    let filteredOrders = [];
    if (this.merchantFilters.some((merchantFilter) => merchantFilter.selected)) {
      this.merchantFilters.forEach((merchantFilter) => {
        if (merchantFilter.selected) {
          const orders = this.filteredOrders.filter((order) => order.items[0].saleflow.merchant._id === merchantFilter.merchant._id);
          console.log(orders);
          orders.forEach((order) => {
            filteredOrders.push(order);
          });
        }
      });
      this.filteredOrders = filteredOrders;
    } else {
      this.filteredOrders = this.orders;
    }

    console.log(this.filteredOrders);
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
      this.filteredOrders = result.ordersByUser;
    } catch (error) {
      console.log()
    }
  }

  getMerchantsWithoutRepeat() {
    this.orders.forEach((order) => {
      if (this.merchantFilters.length == 0) {
        this.merchantFilters.push({
          merchant: order.items[0].saleflow.merchant,
          selected: false
        });
      } else {
        const merchant = this.merchantFilters.find((merchantFilter) => merchantFilter.merchant._id == order.items[0].saleflow.merchant._id);
        if (!merchant) {
          this.merchantFilters.push({
            merchant: order.items[0].saleflow.merchant,
            selected: false
          });
        }
      }
    });
  }

  getOrderTotal(order: ItemOrder) {
    return order.subtotals.reduce(
      (a, b) => a + b.amount,
      0
    );
  }

  goToOrderDetail(order: ItemOrder) {
    this.router.navigate(
      [
      `/ecommerce/order-detail/${order._id}`
      ],
      {
        queryParams: {
          redirectTo: this.router.url
        }
      }
    );
  }

  goBack() {
    this.router.navigate([`/admin/quotations`]);
  }

}
