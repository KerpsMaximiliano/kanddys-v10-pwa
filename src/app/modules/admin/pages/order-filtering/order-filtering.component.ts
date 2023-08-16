import { Component, OnInit } from '@angular/core';

import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { shortFormatID } from 'src/app/core/helpers/strings.helpers'
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ClassGetter } from '@angular/compiler/src/output/output_ast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-filtering',
  templateUrl: './order-filtering.component.html',
  styleUrls: ['./order-filtering.component.scss'],
})
export class OrderFilteringComponent implements OnInit {

  constructor(
    private merchantsService: MerchantsService,
    private router: Router
  ) {}

  start_date : String = new Date().toDateString()
  end_date : String = new Date().toDateString()
  orders = []
  shortFormatID = shortFormatID
  default_image = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'

  formatDate(date_str) {
    const months = ['ENE','FEB','MAR', 'ABP', 'MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
    const date = new Date(date_str)
    const day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear() - 2000
    const format = `${day} ${month} ${year}`
    return format
  }

  calcTotal(subtotals: any) {
    let sum = 0;

    subtotals.forEach(subtotal => {
        sum += subtotal.amount;
    });

    return sum;
  }

  calcTotalPrice() {
    let totalprice = 0;
    this.orders.forEach(order => {
      totalprice += this.calcTotal(order.subtotals);
    });
    return totalprice;
  }

  toConfirmCount() {
    return this.orders.filter(order => order.orderStatus == 'to confirm').length
  }

  async filterData(dateRangeFilter?: boolean) {
    if (this.start_date == "" || this.end_date == "") {
      console.log("please input search date range")
      return;
    }
    lockUI()
    const {_id} = await this.merchantsService.merchantDefault();
    console.log("merchant _id", _id)
    const pagination: PaginationInput = {
      findBy: {
        orderStatus: ["in progress", "to confirm", "completed"]
      },
      options: {
        limit: 25,
        sortBy: 'createdAt:desc'
      },
    };

    if (dateRangeFilter)
      pagination.options.range = {
        from: this.start_date as any,
        to: this.end_date as any,
      };

    const orders = (
      await this.merchantsService.ordersByMerchant(
        _id,
        pagination
      )
    )?.ordersByMerchant;
    if (orders == undefined) this.orders = []
    else this.orders = orders;
    console.log(this.orders);
    unlockUI()
  }

  change_start_date(type: string, event) {
    this.start_date = event.value;
    console.log("start: ", this.start_date, "\nend: ", this.end_date)
  }

  change_end_date(type: string, event) {
    this.end_date = event.value;
    console.log("start: ", this.start_date, "\nend: ", this.end_date)
    this.filterData(true);
  }

  ngOnInit(): void {
    this.filterData();
  }
  
  goToOrderDetail(orderID: string) {
    return this.router.navigate(
      [
        `/ecommerce/order-detail/${orderID}`
      ],
      {
        queryParams: {
          redirectTo: this.router.url
        }
      }
    );
  }

  back() {
    return this.router.navigate(['/admin/dashboard']);
  }

}
