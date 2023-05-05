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
  merchant:any = []
  constructor(
    private deliveryZoneService: DeliveryZonesService,
    private orderService: OrderService,
    private merchantsService: MerchantsService
  ) {}

  async ngOnInit() {
     await this.getMerchant();
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
    let result = await this.orderService.expenditures({
      findBy: {
        merchant: this.merchant._id
      },
      options: {
        sortBy: 'createdAt:desc',
      },
    });
    console.log(result);
    this.expenditures = result;
  }

  async getExpendituresTotal(){
 const result = await this.orderService.expendituresTotal("delivery-zone",this.merchant._id);
console.log(result);  
}

async getIncomes(){
  let result = await this.orderService.incomes({
    findBy: {
      merchant: this.merchant._id
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

async getMerchant(){
  this.merchant = await this.merchantsService.merchantDefault();
 }
}
