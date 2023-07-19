import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { shortFormatID, truncateString } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { PaginationInput } from 'src/app/core/models/saleflow';
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

  shortFormatID = shortFormatID;
  truncateString = truncateString;

  @ViewChild('picker') datePicker: MatDatepicker<Date>;

  range = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });

  constructor(
    private ordersService: OrderService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.activatedRoute.queryParams.subscribe(async (params) => {
      this.quotationID = params.quotationID;
      await this.getOrders();
    });
  }

  selectMerchantFilter(merchantFilter) {
    merchantFilter.selected = !merchantFilter.selected;
    this.filterOrders();
  }

  private filterOrders() {
    const selectedFilters = this.merchantFilters.filter(filter => filter.selected);
    this.filteredOrders = this.orders.filter(order =>
      selectedFilters.some(filter => filter.merchant._id === order.items[0].saleflow.merchant._id)
    );
  }

  async getOrders(rangeFilters: boolean = false) {

    let paginator: PaginationInput = {
      findBy: {
        orderType: "supplier"
      },
      options: {
        limit: -1,
        sortBy: "createdAt:desc"
      }
    };

    if (rangeFilters) {
      paginator.options.range = {
        from: this.range.get('start').value,
        to: this.range.get('end').value,
      }
    }

    try {
      const result = await this.ordersService.ordersByUser(paginator)
      this.orders = result.ordersByUser;
      this.filteredOrders = result.ordersByUser;
      this.getMerchants();
    } catch (error) {
      console.log()
    }
  }

  getMerchants() {
    this.orders.forEach((order) => {
      if (this.merchantFilters.length == 0) {
        this.merchantFilters.push({
          merchant: order.items[0].saleflow.merchant,
          selected: true
        });
      } else {
        const merchant = this.merchantFilters.find((merchantFilter) => merchantFilter.merchant._id == order.items[0].saleflow.merchant._id);
        if (!merchant) {
          this.merchantFilters.push({
            merchant: order.items[0].saleflow.merchant,
            selected: true
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

  async onDateChange() {
    if (this.range.get('start').value && this.range.get('end').value) {
      lockUI();
      await this.getOrders(true);
      unlockUI();
    }
  }

  openDatePicker() {
    this.datePicker.open();
  }

  goBack() {
    this.router.navigate([`/admin/quotations`]);
  }

}
