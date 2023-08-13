import { Component, OnInit } from '@angular/core';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { WalletService } from 'src/app/core/services/wallet.service';

@Component({
  selector: 'app-user-stars',
  templateUrl: './user-stars.component.html',
  styleUrls: ['./user-stars.component.scss'],
})
export class UserStarsComponent implements OnInit {
  merchant: any = {};
  currencyId;
  walletCurrencies: any = [];
  merchantFunctionality: any = { reward: {} };
  walletUserStarsList: any = [];
  openNavigation = false;
  totalStars = 0;
  constructor(
    private merchantService: MerchantsService,
    private walletService: WalletService,
    private orderService: OrderService
  ) {}

  async ngOnInit() {
    await this.merchantDefault();
    await this.walletUserStars();
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

  async walletUserStars() {
    let result = await this.walletService.walletsUserStar('buyer', {
      options: {
        sortBy: 'createdAt:desc',
      },
    });
    if (result != undefined) {
      this.walletUserStarsList = result;
      result.forEach((element) => {
        this.totalStars += element.metadata?.usesStars || 0;
      });
      this.walletUserStarsList.forEach(async (element) => {
        console.log(element);
        element.orderIncomes = await this.orderIncomes(element.owner);
      });
    }
  }

  getText(wallet) {
    let value =  wallet.merchantFuncionality?.reward?.buyersLimit -
    wallet.metadata?.usesStars || 0;
    if(value<0) value = 0;
    return (
      (
       value
      ).toString() +
      ' por acomular para el descuento de ' +
      (wallet.merchantFuncionality?.reward?.amountBuyer != undefined
        ? wallet.merchantFuncionality?.reward?.amountBuyer
        : 0)
    );
  }

  getPercentage(wallet) {
    if (
      wallet.metadata == undefined ||
      wallet.metadata == null ||
      Number.isNaN(wallet.metadata.usesStars) ||
      wallet.merchantFuncionality?.reward == null ||
      wallet.merchantFuncionality?.reward == undefined
    )
      return 0;
    let value =
      100 -
      ((wallet.merchantFuncionality?.reward?.buyersLimit -
        wallet.metadata?.usesStars) *
        100) /
        (wallet.merchantFuncionality?.reward?.buyersLimit || 1);
    return value;
  }

  async orderIncomes(userId) {
    let result = await this.orderService.ordersIncomeMerchantByUser(
      userId,
      this.merchant._id
    );
    if (result != undefined && result.length > 0) return result[0];
    return undefined;
  }
}
