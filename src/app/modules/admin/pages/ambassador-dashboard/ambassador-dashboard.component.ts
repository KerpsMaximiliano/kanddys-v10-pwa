import { Component } from '@angular/core';
import { Merchant } from 'src/app/core/models/merchant';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-ambassador-dashboard',
  templateUrl: './ambassador-dashboard.component.html',
  styleUrls: ['./ambassador-dashboard.component.scss'],
})
export class AmbassadorDashboardComponent {
  heartIcon = '../../../../../assets/';
  heartIconFilled = '../../../../../assets/';
  isHeartIconClicked = false;
  dashboardData = [];
  headerData;
  totalRecords:string;

  constructor(private merchant: MerchantsService) {}

  async ngOnInit() {
    await this.getMerchantDefault();
  }

  async getMerchantDefault(){
    const merchantDefault:Merchant = await this.merchant.merchantDefault();
    await this.getmerchantGroupFiltersQuantity(merchantDefault._id);
    await this.getmerchantGroupByType(merchantDefault._id);
  }

  async getmerchantGroupFiltersQuantity(merchant:string){
    const quantity = await this.merchant.merchantGroupFiltersQuantity(merchant, "item");
    this.headerData = quantity;
  }

  async getMerchants(merchantIds){
    const paginationInput: PaginationInput = {
      findBy: {
        _id: merchantIds
      }
  }
    const merchants:Merchant[] = await this.merchant.merchants(paginationInput);
    const users =  Object.keys(merchants).map(key => {
      return merchants[key]
    });
    return users;
  }

  async getmerchantGroupByType(merchant){
    let merchantsGroup = [];
    const paginationInput: PaginationInput = {
        findBy: {
          merchant: merchant,
          type: "item"
        }
    }
    const merchantsByType = await this.merchant.merchantGroupByType(paginationInput);
    this.totalRecords = merchantsByType.totalResults;
    const merchantsByTypeData =  Object.keys(merchantsByType).map(key => {
      return merchantsByType[key]
    });
    const merchantsInfo = merchantsByTypeData[0]
    const merchantIds = merchantsInfo.map((data:any)=>{
      return data.reference.merchant
    })
    const merchants = await this.getMerchants(merchantIds);
    merchantsInfo.forEach((data:any)=>{
      merchantsGroup.push({
        name: data.reference.name,
        description: data.reference.description,
        pricing: data.reference.pricing,
        status: data.status,
        merchant: merchants.filter(merchants => merchants._id === data.reference.merchant)[0],
        image: data.reference.images
      });
    });
    this.dashboardData = merchantsGroup;
  }

  setHeartIcon(): string {
    return '';
  }


}
