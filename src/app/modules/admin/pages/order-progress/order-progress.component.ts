import { Component, OnInit } from '@angular/core';

import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { shortFormatID } from 'src/app/core/helpers/strings.helpers'
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

@Component({
  selector: 'app-order-progress',
  templateUrl: './order-progress.component.html',
  styleUrls: ['./order-progress.component.scss']
})
export class OrderProgressComponent implements OnInit {

  progress = [
    { id: 1, name: 'in progress', selected: true },
    { id: 2, name: 'pickup', selected: false },
    { id: 3, name: 'pending', selected: false },
    { id: 4, name: 'shipped', selected: false },
    { id: 5, name: 'delivered', selected: false },
  ];
  constructor(
    private merchantsService: MerchantsService,
    private orderService: OrderService,
  ) {}

  orders = []
  shortFormatID = shortFormatID
  default_image = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  orderDeliveryStatus(status) {
    return this.orderService.orderDeliveryStatus(status);
  }
  ngOnInit(): void {
    this.generate()
  }

  select(id) {
    this.progress.forEach((e) => {
      if (e.id == id) {
        e.selected = !e.selected;
      }
    });
    lockUI()
    setTimeout(() => {
      unlockUI()
    }, 500);
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
    this.filterData().forEach(order => {
      totalprice += this.calcTotal(order.subtotals);
    });
    return totalprice;
  }

  orderDeliveryLength(status){
    return this.orders.filter(order => order.orderStatusDelivery == status).length
  }

  filterData() {
    const selectedProgress = this.progress.map(p => {
      if (p.selected) return p.name
    })
    return this.orders.filter(order => selectedProgress.indexOf(order.orderStatusDelivery) >=0 )
  }

  async generate() {

    lockUI()

    const {_id} = await this.merchantsService.merchantDefault();
    console.log("merchant _id", _id)
    
    const pagination: PaginationInput = {
      findBy: {
        orderStatus: "in progress",
        // orderStatusDelivery: this.progress.map(progress => { 
        //   if (progress.selected) return progress.name
        // })
      },
      options: {
        limit: -1,
        sortBy: 'createdAt:desc'
      },
    };
    const orders = (
      await this.merchantsService.ordersByMerchant(
        _id,
        pagination
      )
    )?.ordersByMerchant;
    this.orders = orders != undefined ? orders : []
    console.log(orders);

    unlockUI()
  }

}
