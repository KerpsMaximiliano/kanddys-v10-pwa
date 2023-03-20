import { Component, OnInit } from '@angular/core';
import { Benefits, ItemOrder } from 'src/app/core/models/order';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-benefits',
  templateUrl: './benefits.component.html',
  styleUrls: ['./benefits.component.scss'],
})
export class BenefitsComponent implements OnInit {
  env: string = environment.assetsUrl;
  order: ItemOrder;
  benefits: Benefits;
  benefitsByMonth: {
    month: string;
    monthNumber: number;
    year: number;
    benefits: Benefits;
  }[] = [];

  constructor(
    private orderService: OrderService,
    private merchantsService: MerchantsService
  ) {}

  async ngOnInit(): Promise<void> {
    const dates = [
      {
        monthNumber: 3,
        year: 2023,
      },
      {
        monthNumber: 2,
        year: 2023,
      },
      {
        monthNumber: 1,
        year: 2023,
      },
      {
        monthNumber: 12,
        year: 2022,
      },
      {
        monthNumber: 11,
        year: 2022,
      },
      {
        monthNumber: 10,
        year: 2022,
      },
      {
        monthNumber: 9,
        year: 2022,
      },
      {
        monthNumber: 8,
        year: 2022,
      },
      {
        monthNumber: 7,
        year: 2022,
      },
      {
        monthNumber: 6,
        year: 2022,
      },
      {
        monthNumber: 5,
        year: 2022,
      },
      {
        monthNumber: 4,
        year: 2022,
      },
      {
        monthNumber: 3,
        year: 2022,
      },
    ];
    for (const index in dates) {
      const { monthNumber, year } = dates[index];
      const date = new Date(year, monthNumber, 0);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      const benefits = await this.orderService.orderBenefitsByMerchant({
        findBy: {
          merchant: this.merchantsService.merchantData._id,
        },
        options: {
          range: {
            from: `01 ${month} ${year} 00:00:00 GMT`,
            to: `${day} ${month} ${year} 23:59:59 GMT`,
          },
          limit: -1,
        },
      });
      this.benefitsByMonth.push({
        month: date.toLocaleString('es-MX', { month: 'long' }),
        monthNumber,
        year,
        benefits,
      });
    }
    this.benefits = await this.orderService.orderBenefitsByMerchant({
      findBy: {
        merchant: this.merchantsService.merchantData._id,
      },
      options: {
        limit: -1,
      },
    });
  }
}
