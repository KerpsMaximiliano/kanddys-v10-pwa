import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  type;
  typeRequest;
  title: string;

  constructor(private orderService: OrderService, private merchantService:MerchantsService,private activatedRoute:ActivatedRoute) {}

  async ngOnInit() {
    await this.getMerchant();
    this.activatedRoute.params.subscribe(params => {
      this.type = params['type'];
      this.setValues();
    });
    this.getExpenditures();
  
  }

  async getExpenditures() {
    let result = await this.orderService.expenditures({
      findBy: {
        merchant: this.merchant._id,
        type: this.typeRequest,
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: -1
      },
    });
    this.expenditures = result;
    this.calculateTotal();
  }

  async getMerchant(){
   this.merchant = await this.merchantService.merchantDefault();
  }

async removeItem(id){
  const result = await this.orderService.deleteExpenditure(id);
  if(result?.deleteExpenditure){
    this.expenditures = this.expenditures.filter(e=>e._id!=id);
    this.calculateTotal();
  }
}

calculateTotal(){
  this.total = this.expenditures.reduce((sum, obj) => sum + obj.amount, 0);
}

setValues() {
  if(this.type=='day'){
    this.title = "Egresos especificos en día"; 
    this.typeRequest = 'only-day';
  }else if(this.type=='month'){
    this.title = "Egreso especifico de un mes";
    this.typeRequest = 'only-month';
  }else if (this.type=='recurrent') {
    this.title ="Egresos mensuales y recurrentes";
    this.typeRequest = 'recurrent';
  } else {
    this.title = "Egresos de selección de zonas de entrega";
    this.typeRequest = 'delivery-zone';
  }
}


}
