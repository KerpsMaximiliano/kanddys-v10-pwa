import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { Bank } from 'src/app/core/models/wallet';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { environment } from 'src/environments/environment';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit {
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  environment = environment;
  env: string = environment.assetsUrl;
  selectedBank: Bank;
  selectedOption: number;
  image: File;
  paymentAmount: number;
  banks: Bank[];
  order: ItemOrder;
  merchant: Merchant;
  whatsappLink: string;
  disableButton: boolean;
  depositAmount: number;

  constructor(
    private walletService: WalletService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private merchantService: MerchantsService,
    private headerService: HeaderService,
    private dialogService: DialogService,
    private location: LocationStrategy
  ) {
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
  }

  async ngOnInit(): Promise<void> {
    this.status = 'loading';
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) {
      const saleflowId = this.route.snapshot.paramMap.get('saleflowId');
      if (!saleflowId) {
        this.router.navigate([`/home`]);
        return;
      }
      await this.headerService.fetchSaleflow(saleflowId);
    } else {
      const { orderStatus } = await this.orderService.getOrderStatus(orderId);
      if (orderStatus === 'draft')
        this.order = (await this.orderService.preOrder(orderId)).order;
      else if (orderStatus === 'in progress')
        this.order = (await this.orderService.order(orderId)).order;
      else {
        this.orderCompleted(orderId);
        return;
      }
      if (!this.headerService.saleflow)
        this.headerService.saleflow = this.headerService.getSaleflow();
      if (
        !this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id
      ) {
        this.orderCompleted();
        return;
      }
      this.paymentAmount = this.order.subtotals.reduce(
        (a, b) => a + b.amount,
        0
      );
      if (this.order.items[0].customizer)
        this.paymentAmount = this.paymentAmount * 1.18;
      this.merchant = await this.merchantService.merchant(
        this.order.merchants?.[0]?._id
      );
      if (!this.headerService.saleflow)
        this.headerService.saleflow = this.headerService.getSaleflow();
      if (
        !this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id
      ) {
        this.orderCompleted();
        return;
      }
    }
    this.banks = (
      await this.walletService.exchangeData(
        this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id
      )
    )?.ExchangeData?.bank;
    this.status = 'complete';
  }

  onFileInput(file: File | { image: File; index: number }) {
    if (!('index' in file)) this.image = file;
  }

  selectBank(value: number) {
    this.selectedOption = value;
    this.selectedBank = this.banks[value];
  }

  removeBank() {
    this.selectedOption = null;
    this.selectedBank = null;
    this.image = null;
  }

  orderCompleted(id?: string) {
    this.router.navigate([`ecommerce/order-info/${id || this.order._id}`], {
      replaceUrl: true,
      queryParams: {notify: 'true'}
    });
  }

  async submitPayment() {
    this.disableButton = true;
    lockUI();
    if (this.order) {
      if (this.order.orderStatus === 'draft') {
        this.router.navigate([`/auth/login`], {
          queryParams: {
            orderId: this.order._id,
            auth: 'payment',
          },
          state: {
            image: this.image,
          },
        });
        return;
      }
      await this.orderService.payOrder(
        {
          image: this.image,
          platform: 'bank-transfer',
          transactionCode: '',
        },
        this.order.user._id,
        'bank-transfer',
        this.order._id
      );
      unlockUI();
      this.singleAction();
      return;
    }
    const payment = await this.orderService.createPartialOCR(
      this.depositAmount,
      this.headerService.saleflow.merchant._id,
      this.image,
      this.headerService.user?._id
    );
    this.orderCompleted();
    
  }

  async authOrder() {
    return (
      await this.orderService.authOrder(
        this.headerService.orderId,
        this.headerService.user._id
      )
    ).authOrder;
  }

  singleAction() {
     this.orderCompleted();
  }
}
