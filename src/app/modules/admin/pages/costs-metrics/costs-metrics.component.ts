import { Component, OnInit } from '@angular/core';

import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

@Component({
  selector: 'app-costs-metrics',
  templateUrl: './costs-metrics.component.html',
  styleUrls: ['./costs-metrics.component.scss']
})
export class CostsMetricsComponent implements OnInit {

  merchant: any = null;
  only_day : any = {total: 0, count: 0};
  recurrent : any = {total: 0, count: 0};
  delivery_zone : any = {total: 0, count: 0};
  others : any = {total: 0, count: 0};
  taxes : any = null;
  incomeMerchant = 0

  ordersTotal : any = {total: 0, items: 0, length: 0};
  incomeTotal : any = {total: 0, count: 0}

  viewIndex = 2

  constructor(
    private merchantService: MerchantsService,
    private orderService: OrderService,
    private deliveryZonesService: DeliveryZonesService
  ) { }

  async ngOnInit(): Promise<void> {
    lockUI()
    const merchant = await this.merchantService.merchantDefault();
    this.merchant = merchant

    const only_day = await this.orderService.expendituresTotalById("only-day", this.merchant._id,);
    this.only_day = only_day.expendituresTotalById
    console.log("only_day", only_day)

    const recurrent = await this.orderService.expendituresTotalById("recurrent", this.merchant._id,)
    this.recurrent = recurrent.expendituresTotalById
    console.log("recurrent", recurrent)

    const delivery_zone = await this.orderService.expendituresTotalById("delivery-zone", this.merchant._id,)
    this.delivery_zone = delivery_zone.expendituresTotalById
    console.log("delivery_zone", delivery_zone)

    const others = await this.orderService.expendituresTotalById("others", this.merchant._id,)
    this.others = others.expendituresTotalById
    console.log("others", others)

    const ordersTotal = await this.orderService.ordersTotal(
      ['completed', 'to confirm'],
      this.merchant._id,
    );
    this.ordersTotal = ordersTotal
    console.log("ordersTotal", ordersTotal)

    const incomeTotal = await this.deliveryZonesService.incomeTotalDeliveryZoneByMerchant( this.merchant._id );
    this.incomeTotal = incomeTotal
    console.log("incomeTotal", incomeTotal)

    const taxes = await this.merchantService.taxesByMerchant({
      findBy: {
        merchant: this.merchant._id
      }
    })
    this.taxes = taxes.taxesByMerchant
    console.log("taxes", taxes)

    const incomeMerchant = await this.merchantService.incomeMerchant({
      findBy: {
        merchant: merchant._id,
      },
    });
    this.incomeMerchant = incomeMerchant

    unlockUI()
  }

  amountFormat(amount) {
    const formattedAmount = Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedAmount;
  }

}
