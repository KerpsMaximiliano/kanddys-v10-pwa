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
@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit {
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  environment = environment;
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
    private headerService: HeaderService
  ) {}

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
      this.order = (await this.orderService.order(orderId)).order;
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
      const fullLink = `${environment.uri}/ecommerce/order-info/${this.order._id}`;
      this.whatsappLink = `https://wa.me/${this.merchant.owner.phone}?text=${(
        this.order.user.name || this.merchant.name
      )
        .replace('&', 'and')
        .replace(
          /[^\w\s]/gi,
          ''
        )}: TAP en el link para que visualices mi pago.%0a${fullLink}`;
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

  async submitPayment() {
    this.disableButton = true;
    lockUI();
    if (this.order) {
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
      this.router.navigate([`ecommerce/order-info/${this.order._id}`]);
      return;
    }
    const payment = await this.orderService.createPartialOCR(
      this.depositAmount,
      this.headerService.saleflow.merchant._id,
      this.image,
      this.headerService.user?._id
    );
    const message = `${this.headerService.saleflow.merchant.name
      .replace('&', 'and')
      .replace(
        /[^\w\s]/gi,
        ''
      )}: Acabo de hacer un pago de *$${this.depositAmount.toLocaleString(
      'es-MX'
    )}*.\n\nEl link de la referencia es: ${payment.image}`;
    this.whatsappLink = `https://wa.me/${
      this.headerService.saleflow.merchant.owner.phone
    }?text=${encodeURIComponent(message)}`;
    window.location.href = this.whatsappLink;
  }

  onAmountChange(value: number) {
    this.depositAmount = value;
  }
}
