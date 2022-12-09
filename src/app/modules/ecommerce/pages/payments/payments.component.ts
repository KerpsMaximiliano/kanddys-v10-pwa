import { LocationStrategy } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { Post } from 'src/app/core/models/post';
import { User } from 'src/app/core/models/user';
import { Bank } from 'src/app/core/models/wallet';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ConfirmActionDialogComponent } from 'src/app/shared/dialogs/confirm-action-dialog/confirm-action-dialog.component';
import { environment } from 'src/environments/environment';

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
  post: Post;
  currentUser: User;

  constructor(
    private walletService: WalletService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private postsService: PostsService,
    private merchantService: MerchantsService,
    private headerService: HeaderService,
    private location: LocationStrategy,
    private dialogService: DialogService
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
      if (this.order.items[0].post) {
        this.post = (
          await this.postsService.getPost(this.order.items[0].post._id)
        ).post;
      }
    }
    this.banks = (
      await this.walletService.exchangeData(
        this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id
      )
    )?.ExchangeData?.bank;
    const registeredUser = JSON.parse(
      localStorage.getItem('registered-user')
    ) as User;
    this.currentUser =
      this.order?.user || this.headerService.user || registeredUser;
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
      queryParams: { notify: 'true' },
    });
  }

  async submitPayment() {
    this.disableButton = true;
    lockUI();
    if (this.order) {
      if (this.order.orderStatus === 'draft') {
        const user = JSON.parse(
          localStorage.getItem('registered-user')
        ) as User;
        if (user) {
          this.order = (
            await this.orderService.authOrder(this.order._id, user._id)
          ).authOrder;
          localStorage.removeItem('registered-user');
        } else {
          unlockUI();
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
      this.orderCompleted();
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

  onBackClick() {
    this.dialogService.open(ConfirmActionDialogComponent, {
      type: 'fullscreen-translucent',
      props: {
        topText:
          'Si tocas en cta[0] empezarás una nueva factura.',
        topButtonText: 'Seguir en el pago de mi factura actual',
        cta: [
          {
            text: "\"Cancelar mi factura\"",
            styles: {
              color: '#FFF'
            },
            callback: () => {
              this.router.navigate([
                `/ecommerce/store/${this.headerService.saleflow._id}`,
              ]);
            }
          }
        ],
        topBtnCallback: () => {},
        bottomButtonText: 'Cancelar mi factura',
        bottomBtnCallback: () => {
          this.router.navigate([
            `/ecommerce/store/${this.headerService.saleflow._id}`,
          ]);
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }
}