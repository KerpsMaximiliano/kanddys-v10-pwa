import { Component, OnInit } from '@angular/core';

import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {

  constructor(
    private merchantsService: MerchantsService,
    private orderService: OrderService,
  ) { }

  orders = []
  findString = ""
  default_image = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  searchType = "name";

  calcTotal(subtotals: any) {
    let sum = 0;

    subtotals.forEach(subtotal => {
        sum += subtotal.amount;
    });

    return sum;
  }

  filterOrder() {
    if (this.searchType == "name") return this.orders.filter(order => order?.items[0]?.saleflow?.merchant?.name.toLowerCase().indexOf(this.findString.toLowerCase()) >= 0)
    else if (this.findString.length) return this.orders.filter(order => order?.items[0].saleflow.merchant.owner.phone == this.findString)
    else return this.orders;
  }

  async generate() {
    lockUI()

    const {_id} = await this.merchantsService.merchantDefault();
    console.log("merchant _id", _id)
    this.orders = (
      await this.orderService.ordersByUser({
        options: {
          limit: -1,
          range: {
            from: "2023-04-01",
            to: "2023-07-01"
          }
        },
      })
    )?.ordersByUser;
    console.log(this.orders)
    unlockUI()
  }

  ngOnInit(): void {
    this.generate()
  }

}
