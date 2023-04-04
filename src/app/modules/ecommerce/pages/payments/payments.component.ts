import { LocationStrategy } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Integration } from 'src/app/core/models/integration';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { Post } from 'src/app/core/models/post';
import { User } from 'src/app/core/models/user';
import { ViewsMerchant } from 'src/app/core/models/views-merchant';
import { Bank } from 'src/app/core/models/wallet';
import { HeaderService } from 'src/app/core/services/header.service';
import { IntegrationsService } from 'src/app/core/services/integrations.service';
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
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { SwiperOptions } from 'swiper';
import { GeneralDialogComponent } from 'src/app/shared/components/general-dialog/general-dialog.component';
import { Validators } from '@angular/forms';

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
  openedDialogFlow: boolean;
  onlinePaymentsOptions: WebformAnswerLayoutOption[] = [
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
          src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets%2Fpayment_methods_logos.svg',
          width: '100%',
        },
      ],
    },
  ];
  viewMerchantForRefund: ViewsMerchant = null;
  azulPaymentsSupported: boolean = false;
  logged: boolean;
  dialogs: Array<EmbeddedComponentWithId> = [
    {
      component: GeneralDialogComponent,
      componentId: 'userEmailDialog',
      inputs: {
        dialogId: 'userEmailDialog',
        omitTabFocus: false,
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '12px',
          opacity: '1',
          padding: '37.1px 23.6px 38.6px 31px',
        },
        header: {
          styles: {
            fontSize: '23px',
            fontFamily: 'SfProBold',
            color: '#4F4F4F',
            marginTop: '0px',
            marginBottom: '18.5px',
          },
          text: 'El banco necesita tu email para hacer el pago.',
        },
        fields: {
          styles: {},
          list: [
            {
              name: 'email',
              value: '',
              validators: [Validators.required, Validators.email],
              label: {
                styles: {
                  display: 'block',
                  fontSize: '17px',
                  fontFamily: '"SFProRegular"',
                  color: '#A1A1A1',
                  margin: '10px 0px',
                },
                text: '',
              },
              type: 'email',
              disclaimer: {
                styles: {
                  marginTop: '17.9px',
                  fontFamily: 'SfProLight',
                  fontStyle: 'italic',
                  fontSize: '15px',
                  color: '#7B7B7B',
                },
                text: 'Esto solo ocurre cuando los pagos son con tarjetas de crédito.',
              },
              placeholder: 'Escribe tu correo electrónico',
              styles: {
                border: 'none',
                borderRadius: '9px',
                boxShadow: 'rgb(228 228 228) 0px 3px 7px 0px inset',
                display: 'block',
                fontFamily: 'RobotoMedium',
                fontSize: '17px',
                padding: '26px 26px 26px 16px',
                resize: 'none',
                width: '100%',
                color: '#A1A1A1',
              },
            },
            {
              name: 'submitButton',
              value: '',
              validators: [],
              type: 'buttonIcon',
              buttonIcon: {
                src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/arrow-right-black.svg',
                styles: {
                  width: '10px',
                  filter:
                    'invert(100%) sepia(13%) saturate(7497%) hue-rotate(182deg) brightness(97%) contrast(100%)',
                },
              },
              styles: {
                backgroundColor: 'limegreen',
                border: 'none',
                borderRadius: '7px',
                position: 'absolute',
                padding: '5px 20px',
                right: '37px',
                top: '133px',
                cursor: 'pointer'
              },
            },
          ],
        },
        isMultiple: true,
      },
      outputs: [
        {
          name: 'buttonClicked',
          callback: async (params) => {
            const { buttonClicked, value, valid } = params;

            try {
              if (valid &&  value.email && value.email.length > 0) {
                await this.authService.updateMe({
                  email: value.email,
                });
                this.redirectToAzulPaymentPage();
              } else {
                this.toastrService.error( value.email && value.email.length > 0 ? 'Email invalido' : 'Campo vacio, ingresa un email valido', null, {
                  timeOut: 1500,
                });
              }
            } catch (error) {
              const user = await this.authService.checkUser(value.email);

              if(user) {
                this.toastrService.error('Email ya registrado con otro usuario, ingresa un email diferente', null, {
                  timeOut: 1500,
                });
              } else {
                this.toastrService.error('Ocurrió un error', null, {
                  timeOut: 1500,
                });                
              }

            }
           
          },
        },
      ],
    },
  ];
  swiperConfig: SwiperOptions = null;

  azulPaymentURL: string =
    'https://pruebas.azul.com.do/paymentpage/Default.aspx';

  constructor(
    private walletService: WalletService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private postsService: PostsService,
    private merchantService: MerchantsService,
    public headerService: HeaderService,
    private location: LocationStrategy,
    private integrationService: IntegrationsService,
    private dialogService: DialogService,
    private authService: AuthService,
    private toastrService: ToastrService
  ) {
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
  }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe((params) => {
      this.route.queryParams.subscribe(async (queryParams) => {
        const orderId = params['orderId'];
        const { redirectToAzul } = queryParams;

        this.status = 'loading';
        const redirectToAzulPaymentsPage = Boolean(redirectToAzul);
        if (orderId) {
          const { orderStatus } = await this.orderService.getOrderStatus(
            orderId
          );
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
            !this.headerService.saleflow?.module?.paymentMethod?.paymentModule
              ?._id
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
        this.logged = Boolean(await this.authService.me());

        this.status = 'complete';

        const viewsMerchants = await this.merchantService.viewsMerchants({
          findBy: {
            merchant: this.headerService.saleflow.merchant._id,
            type: 'refund',
          },
        });

        if (viewsMerchants && viewsMerchants.length > 0) {
          this.viewMerchantForRefund = viewsMerchants[0];
        }

        this.azulPaymentsSupported =
          await this.integrationService.integrationPaymentMethod(
            'azul',
            this.headerService.saleflow.merchant._id
          );

        if (!this.azulPaymentsSupported) {
          this.onlinePaymentsOptions.pop();
        }

        if (redirectToAzulPaymentsPage && !this.order.user) {
          this.order = (
            await this.orderService.authOrder(
              this.order._id,
              this.currentUser._id
            )
          ).authOrder;
        }

        if (redirectToAzulPaymentsPage && this.currentUser.email) {
          this.redirectToAzulPaymentPage();
        } else if (redirectToAzulPaymentsPage && !this.currentUser.email) {
          this.openedDialogFlow = true;
        }

        if (this.azulPaymentsSupported) this.checkIfAzulPaymentURLIsAvailable();
      });
    });
  }

  checkIfAzulPaymentURLIsAvailable() {
    const controller = new AbortController();
    const signal = controller.signal;
    setTimeout(() => controller.abort(), 4000);

    fetch(this.azulPaymentURL, { signal, redirect: 'follow' })
      .then((response) => {
        if (!response.ok) {
          this.azulPaymentURL =
            'https://contpagos.azul.com.do/PaymentPage/Default.aspx';
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          this.azulPaymentURL =
            'https://contpagos.azul.com.do/PaymentPage/Default.aspx';
        } else {
          console.log('An error occured: ', err);
        }
      });
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
      if (this.currentUser && this.logged && this.currentUser.email)
        this.redirectToAzulPaymentPage();
      else if (this.currentUser && this.logged && !this.currentUser.email) {
        this.openedDialogFlow = true;
      } else {
        this.router.navigate(['auth/login'], {
          queryParams: {
            orderId: this.order._id,
            auth: 'azul-login',
            paymentWithAzul: true,
            redirect:
              window.location.href.split('/').slice(3).join('/') +
              '?redirectToAzul=true',
          },
        });
      }
    }
  }

  redirectToAzulPaymentPage() {
    this.toastrService.info('Redigiendo a la página de pago', null, {
      timeOut: 1500,
    });

    lockUI();

    const clientURI = `${environment.uri}`;

    const requestData: any = {
      MerchantName: "D'liciantus",
      MerchantID: this.headerService.saleflow.merchant._id,
      MerchantType: 'Importadores y productores de flores y follajes',
      CurrencyCode: '$',
      // OrderNumber: this.order._id,
      OrderNumber: formatID(this.order.dateId),
      Amount: this.paymentAmount.toFixed(2).toString().replace('.', ''),
      ITBIS: (this.paymentAmount * 0.18).toFixed(2).toString().replace('.', ''),
      ApprovedUrl:
        clientURI +
        '/ecommerce/' +
        this.headerService.saleflow._id +
        '/payments-redirection?typeOfPayment=azul&success=true&orderId=' +
        this.order._id,
      DeclinedUrl:
        clientURI +
        '/ecommerce/' +
        this.headerService.saleflow._id +
        '/payments-redirection?typeOfPayment=azul&success=false&orderId=' +
        this.order._id,
      CancelUrl:
        clientURI +
        '/ecommerce/' +
        this.headerService.saleflow._id +
        '/payments-redirection?typeOfPayment=azul&cancel=true&orderId=' +
        this.order._id,
      UseCustomField1: '0',
      CustomField1Label: 'Label1',
      CustomField1Value: 'Custom1',
      UseCustomField2: '0',
      CustomField2Label: 'Label2',
      CustomField2Value: 'Custom2',
    };

    const form = document.querySelector('#azulForm') as HTMLFormElement;

    for (const key in requestData) {
      document.querySelector('#' + key).setAttribute('value', requestData[key]);
    }

    fetch(`${environment.api.url}/azul/calculate-auth-hash`, {
      method: 'POST',
      headers: {
        'App-Key': `${environment.api.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((data) => {
        document.querySelector('#AuthHash').setAttribute('value', data.hash);
        document
          .querySelector('#MerchantID')
          .setAttribute('value', data.azulMerchantID);

        form.submit();
      });
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

  fillIndexesUpTo(arrayLength: number) {
    const array = [];

    for (let i = 0; i < arrayLength; i++) {
      array.push(i);
    }

    return array;
  }

  goToRefundPolicies() {
    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.headerService.flowRoute);

    this.router.navigate([
      '/ecommerce/' +
        this.headerService.saleflow.merchant.slug +
        '/terms-of-use/' +
        this.viewMerchantForRefund._id,
    ]);
  }

  async payWithAzul(event: Event) {
    event.preventDefault();

    const azulForm: HTMLFormElement = document.querySelector('#azulForm');
    const formData = new FormData(azulForm);

    console.log(formData);
    /*
    fetch('https://pruebas.azul.com.do/paymentpage/Default.aspx', {
      method: 'POST',
      body: formData,
    }).then((response) => {
      console.log(response);
      if (response.redirected) {
        window.location.href = response.url;
      }
    });*/
  }
}
