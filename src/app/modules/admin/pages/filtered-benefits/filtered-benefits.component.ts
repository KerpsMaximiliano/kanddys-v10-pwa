import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemOrder } from 'src/app/core/models/order';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { ExpenditureList } from 'src/app/shared/components/order-expenses-list/order-expenses-list.component';
import { environment } from 'src/environments/environment';

interface extendedItemOrder extends ItemOrder {
  expenditureList?: ExpenditureList[];
  benefits?: number;
  less?: number;
  percentageBenefits?: number;
  percentageLess?: number;
}

@Component({
  selector: 'app-filtered-benefits',
  templateUrl: './filtered-benefits.component.html',
  styleUrls: ['./filtered-benefits.component.scss'],
})
export class FilteredBenefitsComponent implements OnInit {
  env: string = environment.assetsUrl;
  orders: extendedItemOrder[] = [];
  month: string;
  year: number;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private merchantsService: MerchantsService,
    private orderService: OrderService
  ) {}

  async ngOnInit(): Promise<void> {
    const monthNumber = +this.route.snapshot.queryParamMap.get('month');
    this.year = +this.route.snapshot.queryParamMap.get('year');
    const date = new Date(this.year, monthNumber, 0);
    const month = date.toLocaleString('en-US', { month: 'short' });
    const day = date.getDate();
    this.month = date.toLocaleString('es-MX', { month: 'long' });
    this.orders = (
      await this.merchantsService.ordersByMerchant(
        this.merchantsService.merchantData._id,
        {
          options: {
            range: {
              from: `01 ${month} ${this.year} 00:00:00 GMT`,
              to: `${day} ${month} ${this.year} 23:59:59 GMT`,
            },
            limit: -1,
          },
        }
      )
    )?.ordersByMerchant;
    const expendituresIds = [];
    this.orders.forEach((itemOrder) => {
      itemOrder.expenditures.forEach((value) => {
        if (!expendituresIds.includes(value)) expendituresIds.push(value);
      });
    });
    const expenditures = await this.orderService.expenditures({
      findBy: {
        merchant: this.merchantsService.merchantData._id,
        _id: {
          __in: expendituresIds,
        },
      },
    });
    this.orders.forEach((itemOrder) => {
      const subtotals = itemOrder.subtotals.reduce((a, b) => a + b.amount, 0);
      itemOrder.expenditureList = [
        {
          name: 'Monto facturado',
          type: 'ingreso',
          amount: subtotals,
        },
      ];
      itemOrder.benefits = subtotals;
      itemOrder.less = 0;
      if (itemOrder.expenditures.length) {
        const expenditureList: ExpenditureList[] = expenditures
          .filter((expenditure) =>
            itemOrder.expenditures.includes(expenditure._id)
          )
          .map((expenditure) => {
            itemOrder.less += expenditure.amount;
            return {
              name: expenditure.name,
              type: 'egreso',
              amount: expenditure.amount,
            };
          });
        itemOrder.expenditureList.push(...expenditureList);
      }
      itemOrder.percentageLess =
        Math.round((itemOrder.less / itemOrder.benefits) * 100) / 100;
      itemOrder.percentageBenefits =
        Math.round((1 - itemOrder.percentageLess) * 100) / 100;
    });
  }
}
