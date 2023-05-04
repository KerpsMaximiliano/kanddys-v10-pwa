import { Component, OnInit } from '@angular/core';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reportings',
  templateUrl: './reportings.component.html',
  styleUrls: ['./reportings.component.scss'],
})
export class ReportingsComponent implements OnInit {
  env: string = environment.assetsUrl;
  expenditures:any = []
  constructor(
    private deliveryZoneService: DeliveryZonesService,
    private orderService: OrderService,
    private merchantsService: MerchantsService
  ) {}

  ngOnInit(): void {
    this.getDeliveryZones();
    this.getExpenditures();
    this.getExpendituresTotal();
    this.getIncomes();
    this.expenditureTypesCustom();
  }

  async getDeliveryZones() {
    let result = await this.deliveryZoneService.deliveryZones();
    console.log(result)
  }

  async getExpenditures() {
    console.log(this.merchantsService.merchantData)
    const merchantId = JSON.parse(localStorage.getItem('saleflow-data'))?._id;
    let result = await this.orderService.expenditures({
      findBy: {
        merchant: "63209c58d09b8976076bf209"
      },
      options: {
        sortBy: 'createdAt:desc',
      },
    });
    console.log(result);
    this.expenditures = result;
  }

  async getExpendituresTotal(){
 const result = await this.orderService.expendituresTotal("delivery-zone","63209c58d09b8976076bf209");
console.log(result);  
}

async getIncomes(){
  let result = await this.orderService.incomes({
    findBy: {
      merchant: "622662a1b510731e1329a1ad"
    },
    options: {
      sortBy: 'createdAt:desc',
    },
  });
  console.log(result);
}

async expenditureTypesCustom(){
  let result = await this.orderService.expenditureTypesCustom("63209c58d09b8976076bf209");
  console.log(result);
}
}
