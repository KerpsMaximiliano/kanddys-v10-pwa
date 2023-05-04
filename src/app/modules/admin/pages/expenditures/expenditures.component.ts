import { Component, OnInit } from '@angular/core';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-expenditures',
  templateUrl: './expenditures.component.html',
  styleUrls: ['./expenditures.component.scss'],
})
export class ExpendituresComponent implements OnInit {
  env: string = environment.assetsUrl;
  expenditures: any = [];
  merchant:any = {}
  total = 0;

  constructor(private orderService: OrderService, private merchantService:MerchantsService,private webformService:WebformsService) {}

  async ngOnInit() {
    await this.getMerchant();
    this.getExpenditures();
    this.getWebForm();
  }

  async getExpenditures() {
    let result = await this.orderService.expenditures({
      findBy: {
        merchant: this.merchant._id,
      },
      options: {
        sortBy: 'createdAt:desc',
      },
    });
    this.expenditures = result;
    this.total = this.expenditures.reduce((sum, obj) => sum + obj.amount, 0);
  }

  async getMerchant(){
   this.merchant = await this.merchantService.merchantDefault();
  }

async getWebForm(){
  const result = await this.webformService.webformsByMerchant(this.merchant._id);
  console.log(result);
}

async removeItem(id){
  const result = await this.orderService.itemRemoveExpenditure(id,'');
  console.log(result);
}
}
