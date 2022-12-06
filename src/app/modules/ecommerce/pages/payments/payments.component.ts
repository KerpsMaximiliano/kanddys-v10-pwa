import { LocationStrategy } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { formatID } from 'src/app/core/helpers/strings.helpers';
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
import {
  OptionAnswerSelector,
  WebformAnswerLayoutOption,
  webformAnswerLayoutOptionDefaultStyles,
} from 'src/app/core/types/answer-selector';
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
  acceptedRefundPolicies: boolean = false;
  onlinePaymentsOptions: WebformAnswerLayoutOption[] = [
    /*   {
      type: 'WEBFORM-ANSWER',
      optionStyles: webformAnswerLayoutOptionDefaultStyles,
      selected: false,
      optionIcon: 'stripe',
      callback: () => this.selectOnlinePayment(0),
      texts: {
        topRight: {
          text: '',
          styles: {
            color: '#7B7B7B',
            display: 'none',
          },
        },
        topLeft: {
          text: 'Stripe',
          styles: {
            paddingBottom: '8px',
            width: '100%',
          },
        },
        middleTexts: [
          {
            text: 'ID',
          },
          {
            text: 'ID',
          },
        ],
        bottomLeft: {
          text: 'ID',
          styles: {
            paddingTop: '8px',
            fontFamily: 'SfProBold',
          },
        },
      },
    },
    {
      type: 'WEBFORM-ANSWER',
      optionStyles: webformAnswerLayoutOptionDefaultStyles,
      selected: false,
      optionIcon: 'paypal',
      callback: () => this.selectOnlinePayment(1),
      texts: {
        topRight: {
          text: '',
          styles: {
            color: '#7B7B7B',
          },
        },
        topLeft: {
          text: 'Paypal',
          styles: {
            paddingBottom: '8px',
          },
        },
        middleTexts: [
          {
            text: 'ID',
          },
          {
            text: 'ID',
          },
        ],
        bottomLeft: {
          text: 'ID',
          styles: {
            paddingTop: '8px',
            fontFamily: 'SfProBold',
          },
        },
      },
    },*/
    {
      type: 'WEBFORM-ANSWER',
      optionStyles: webformAnswerLayoutOptionDefaultStyles,
      selected: false,
      optionIcon: 'azul',
      callback: () => this.selectOnlinePayment(0),
      texts: {
        topRight: {
          text: '',
          styles: {
            color: '#7B7B7B',
          },
        },
        topLeft: {
          text: 'Tarjeta de crédito',
          styles: {
            paddingBottom: '8px',
          },
        },
        middleTexts: [
          {
            text: 'ID',
            styles: {
              display: 'none',
            },
          },
          {
            text: 'ID',
            styles: {
              display: 'none',
            },
          },
        ],
        bottomLeft: {
          text: 'ID',
          styles: {
            paddingTop: '8px',
            fontFamily: 'SfProBold',
            display: 'none',
          },
        },
      },
      logos: [
        {
          src: 'https://cdn.visa.com/v2/assets/images/logos/visa/blue/logo.png',
          width: '55px',
          height: '18px',
        },
        {
          src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/mastercard.svg',
          width: '50px',
          height: '46px',
        },
        {
          src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/Amex_logo_color.png',
          width: '50px',
          height: '46px',
        },
        {
          src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/discover_logo.jpg',
          width: '68px',
          height: '34px',
        },
        {
          src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/DCI_logo_all_black.svg',
          width: '100px',
          height: '25px',
        },

        {
          src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/visa-secure_blu_2021.png',
          width: '45px',
          height: '45px',
        },
        {
          src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/mc_idcheck_hrz_rgb_pos.png',
          width: '200px',
          height: '50px',
        },
      ],
    },
  ];

  constructor(
    private walletService: WalletService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private postsService: PostsService,
    private merchantService: MerchantsService,
    public headerService: HeaderService,
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
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (orderId) {
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
    const exchangeData = await this.walletService.exchangeData(
      this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id
    );

    this.banks = exchangeData?.ExchangeData?.bank;

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
    this.router.navigate([`../../../order-detail/${id || this.order._id}`], {
      relativeTo: this.route,
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

  async selectOnlinePayment(paymentIndex: number) {
    const paymentOptionName =
      this.onlinePaymentsOptions[paymentIndex].texts.topLeft.text;

    if (paymentOptionName === 'Stripe') {
      if (this.currentUser) {
        const result = await this.walletService.payOrderWithStripe(
          this.order._id
        );

        if (result) {
          localStorage.setItem('stripe_checkout_session_id', result.id);
          localStorage.setItem('stripe-payed-orderId', this.order._id);
          window.location.href = result.url;
        }
      } else {
        this.router.navigate([`/auth/login`], {
          queryParams: {
            orderId: this.order._id,
            onlinePayment: 'payment-with-stripe',
          },
        });
      }
    } else if (paymentOptionName === 'Paypal') {
      if (this.currentUser) {
        const result = await this.walletService.payOrderWithElectronicPayments(
          'paypal',
          this.order._id
        );

        if (result) {
          window.location.href = result;
        }
      } else {
        this.router.navigate([`/auth/login`], {
          queryParams: {
            orderId: this.order._id,
            onlinePayment: 'payment-with-stripe',
          },
        });
      }
    } else if (paymentOptionName === 'Tarjeta de crédito') {
      const clientURI = 'http://localhost:4200';

      const requestData: any = {
        MerchantName: "D'liciantus",
        MerchantID: '39038540035',
        MerchantType: 'Importadores y productores de flores y follajes',
        CurrencyCode: '$',
        OrderNumber: this.order._id,
        //OrderNumber: formatID(this.order.dateId),
        Amount: this.paymentAmount.toFixed(2).toString().replace('.', ''),
        ITBIS: (this.paymentAmount * 0.18)
          .toFixed(2)
          .toString()
          .replace('.', ''),
        ApprovedUrl:
          clientURI +
          '/ecommerce/' +
          this.headerService.saleflow._id +
          '/payments-redirection?typeOfPayment=azul&success=true',
        DeclinedUrl:
          clientURI +
          '/ecommerce/' +
          this.headerService.saleflow._id +
          '/payments-redirection?typeOfPayment=azul&success=false',
        CancelUrl:
          clientURI +
          '/ecommerce/' +
          this.headerService.saleflow._id +
          '/payments-redirection?typeOfPayment=azul&cancel=true',
        UseCustomField1: '0',
        CustomField1Label: 'Label1',
        CustomField1Value: 'Custom1',
        UseCustomField2: '0',
        CustomField2Label: 'Label2',
        CustomField2Value: 'Custom2',
      };

      const form = document.querySelector('#azulForm') as HTMLFormElement;

      for (const key in requestData) {
        document
          .querySelector('#' + key)
          .setAttribute('value', requestData[key]);
      }

      fetch('http://localhost:3500/azul/calculate-auth-hash', {
        method: 'POST',
        headers: {
          'App-Key':
            'a6c6d9880190ad2c4d477b89b44107b82b3e4902f293fe710d9a904de283f8f7',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => response.text())
        .then((hash) => {
          console.log("authhash", hash)

          document.querySelector('#AuthHash').setAttribute('value', hash);

          form.submit();
        });
    }
  }

  onBackClick() {
    this.dialogService.open(ConfirmActionDialogComponent, {
      type: 'fullscreen-translucent',
      props: {
        topText: 'Si tocas en cta[0] empezarás una nueva factura.',
        topButtonText: 'Seguir en el pago de mi factura actual',
        cta: [
          {
            text: '"Cancelar mi factura"',
            styles: {
              color: '#FFF',
            },
            callback: () => {
              this.router.navigate([`../../store`], {
                relativeTo: this.route,
              });
            },
          },
        ],
        topBtnCallback: () => {},
        bottomButtonText: 'Cancelar mi factura',
        bottomBtnCallback: () => {
          this.router.navigate([`../../store`], {
            relativeTo: this.route,
          });
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  markOrUnmarkCheckbox() {
    this.acceptedRefundPolicies = !this.acceptedRefundPolicies;
  }
}
