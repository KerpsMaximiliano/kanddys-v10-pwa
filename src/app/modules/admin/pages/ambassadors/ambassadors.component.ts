import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-ambassadors',
  templateUrl: './ambassadors.component.html',
  styleUrls: ['./ambassadors.component.scss']
})
export class AmbassadorsComponent implements OnInit {
  walletsByCurrency: Array<any> = [];
  ambassadorOrders: Object = {};
  total: number = 5000;

  constructor(
    private merchantsService: MerchantsService,
    private authService: AuthService,
  ) {}

  getPorcentage(portion: number, total: number): number {
    return Math.floor((portion / total) * 100);
  }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.me();
    if (user && user?._id) {
      try {
        const merchant = await this.merchantsService.merchantDefault(user._id);
        if (merchant && merchant?._id) {
          const currencyStartByMerchant = await this.merchantsService.currencyStartByMerchant(merchant._id);

          if (currencyStartByMerchant && currencyStartByMerchant?.affiliate) {
            this.walletsByCurrency = await this.merchantsService.walletsByCurrency({
              findBy: {
                currency: currencyStartByMerchant?.affiliate._id,
                metadata: {
                  isRedeemable: false
                }
              },
            });

            if (this.walletsByCurrency.length) {
              let ambassadorOrders = [];
              for (const wallet of this.walletsByCurrency) {
                ambassadorOrders = await this.merchantsService.ordersCommissionableItemsCount(wallet.owner._id, merchant._id);
                if (ambassadorOrders.length) this.ambassadorOrders[wallet.owner._id] = ambassadorOrders[0];
              }
            }
          }
        }

      } catch (error) {
        console.error(error);
      }
    }
  }

}
