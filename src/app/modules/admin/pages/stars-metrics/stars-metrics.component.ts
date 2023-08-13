import { Component, OnInit } from '@angular/core';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { UsersService } from 'src/app/core/services/users.service';
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
  userIds = [];
  openNavigation = false;
  constructor(
    private merchantService: MerchantsService,
    private walletService: WalletService,
    private orderService: OrderService,
    private usersService: UsersService
  ) {}

  async ngOnInit() {
    await this.merchantDefault();
    await this.currencyStartByMerchant();
    await this.walletsByCurrency();
    await this.getMerchantFunctionality();
    await this.getUsers();
  }

  async merchantDefault() {
    const merchant = await this.merchantService.merchantDefault();
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
      this.walletCurrencies.forEach(async (element) => {
        element.orderIncomes = await this.orderIncomes(element.owner._id);
      });
      this.userIds = this.walletCurrencies.map((e) => e.owner?._id);
    }
  }

  async getMerchantFunctionality() {
    let result = await this.merchantService.merchantFuncionality(
      this.merchant._id
    );
    if (result != undefined) this.merchantFunctionality = result;
  }

  async orderIncomes(userId) {
    let result = await this.orderService.ordersIncomeMerchantByUser(
      userId,
      this.merchant._id
    );
    if (result != undefined && result.length > 0) return result[0];
    return undefined;
  }

  getText(wallet) {
    let value =
      this.merchantFunctionality?.reward?.buyersLimit -
      (wallet.metadata?.usesStars || 0);
    if (value < 0) value = 0;
    return (
      '$' +
      value.toString() +
      ' por facturar para ganarse el descuento de $' +
      this.merchantFunctionality?.reward?.amountBuyer
    );
  }

  getPercentage(wallet) {
    if (
      wallet.metadata == undefined ||
      wallet.metadata == null ||
      Number.isNaN(wallet.metadata.usesStars)
    )
      return 0;
    let value =
      100 -
      ((this.merchantFunctionality?.reward?.buyersLimit -
        wallet.metadata?.usesStars) *
        100) /
        (this.merchantFunctionality?.reward?.buyersLimit || 1);
    return value;
  }

  async getUsers() {
    let result = await this.usersService.paginateUsers({
      options: {
        limit: 500,
      },
      findBy: {
        _id: {
          __in: this.userIds,
        },
      },
    });

    if (result != undefined) {
      this.walletCurrencies.forEach((element) => {
        let val = result.find((e: any) => e._id == element.owner._id);
        if (val != undefined) element.owner = val;
      });
    }
  }
}
