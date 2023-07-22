import { Component, OnInit } from '@angular/core';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-stars-metrics',
  templateUrl: './stars-metrics.component.html',
  styleUrls: ['./stars-metrics.component.scss'],
})
export class StarsMetricsComponent implements OnInit {
  merchant: any = {};
  currencyId;
  walletCurrencies: any = [];
  merchantFunctionality: any = { reward: {} };
  constructor(
    private merchantService: MerchantsService,
    private walletService: WalletService,
    private orderService: OrderService
  ) {}

  async ngOnInit() {
    await this.merchantDefault();
    await this.currencyStartByMerchant();
    await this.walletsByCurrency();
    await this.getMerchantFunctionality();
  }

  async merchantDefault() {
    const merchant = await this.merchantService.merchantDefault();
    console.log(merchant);
    this.merchant = merchant;
  }

  async currencyStartByMerchant() {
    let result = await this.merchantService.currencyStartByMerchant(
      this.merchant._id
    );
    if (result != undefined) this.currencyId = result.buyer?._id;
  }

  async walletsByCurrency() {
    const paginate: PaginationInput = {
      options: {
        limit: -1,
        sortBy: 'createdAt:desc',
      },
      findBy: {
        currency: this.currencyId,
      },
    };
    let result = await this.walletService.walletsByCurrency(paginate);
    if (result != undefined) {
      this.walletCurrencies = result;
      this.walletCurrencies.forEach(async element => {
       element.orderIncomes =  await this.orderIncomes(element.owner._id);
      });
      console.log(this.walletCurrencies)
    }
  }

  async getMerchantFunctionality() {
    let result = await this.merchantService.merchantFuncionality(
      this.merchant._id
    );
    if (result != undefined) this.merchantFunctionality = result;
    console.log(this.merchantFunctionality);
  }

  async orderIncomes(userId){
    let result = await this.orderService.ordersIncomeMerchantByUser(userId,this.merchant._id);
    if(result != undefined && result.length>0) return result[0];
    return undefined;
  }

  getText(wallet) {
    return (
      '$' +
      (
        this.merchantFunctionality?.reward?.buyersLimit -
        wallet.metadata?.usesStars
      ).toString() +
      ' por facturar para ganarse el descuento de ' +
      this.merchantFunctionality?.reward?.buyersLimit
    );
  }

  getPercentage(wallet){
   return 100 - ((this.merchantFunctionality?.reward?.buyersLimit -
    wallet.metadata?.usesStars) || 0)*100/ (this.merchantFunctionality?.reward?.buyersLimit || 1)
  }
}
