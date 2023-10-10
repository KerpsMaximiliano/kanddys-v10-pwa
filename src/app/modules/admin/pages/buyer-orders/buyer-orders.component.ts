import { Component, OnInit } from '@angular/core';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemOrder } from 'src/app/core/models/order';
import { OrderService } from 'src/app/core/services/order.service';

interface ordersByMonth {
  [month: string]: ItemOrder[];
}

@Component({
  selector: 'app-buyer-orders',
  templateUrl: './buyer-orders.component.html',
  styleUrls: ['./buyer-orders.component.scss']
})
export class BuyerOrdersComponent implements OnInit {
  orders: ItemOrder[] = [];
  total: Number;
  months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  
  ordersByMonth = [];

  constructor(private orderService: OrderService,) { }

  ngOnInit(): void {
    this.generate()
  }

  async generate() {
    lockUI()

    this.orders = (
      await this.orderService.ordersByUser({
        options: {
          limit: 50,
          sortBy: 'createdAt:desc'
        },
      })
    )?.ordersByUser;

    this.orders.map((jsonObject) => {
      if (jsonObject.hasOwnProperty("createdAt")) {
        const createdAt = new Date(jsonObject.createdAt);
        const month = createdAt.getMonth();
      
        const existingMonthObject = this.ordersByMonth.find((element) => element.month === this.months[month]);
      
        if (!existingMonthObject) {
          this.ordersByMonth.push({
            'month': this.months[month],
            'orders': [jsonObject]
          });
        } else {
          existingMonthObject.orders.push(jsonObject);
        }
      }
    });

    this.total = (
      await this.orderService.orderIncomeCompletedByUser({})
    )?.orderIncomeCompletedByUser?.total;

    unlockUI()
  }

  calcTotal(subtotals: any) {
    let sum = 0;

    subtotals.forEach(subtotal => {
        sum += subtotal.amount;
    });

    return sum;
  }

}
