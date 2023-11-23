import { LocationStrategy } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Integration } from 'src/app/core/models/integration';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { Post } from 'src/app/core/models/post';
import { User } from 'src/app/core/models/user';
import { ViewsMerchant } from 'src/app/core/models/views-merchant';
import { Bank, ElectronicPayment } from 'src/app/core/models/wallet';
import { AuthService } from 'src/app/core/services/auth.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
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
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { SwiperOptions } from 'swiper';
import { GeneralDialogComponent } from 'src/app/shared/components/general-dialog/general-dialog.component';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  LoginDialogComponent,
  LoginDialogData,
} from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';

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
  imageBase64: string;
  subtotal: number;
  deliveryAmount: number;
  paymentAmount: number;
  banks: Bank[];
  electronicPayments: ElectronicPayment[];
  order: ItemOrder;
  merchant: Merchant;
  whatsappLink: string;
  disableButton: boolean;
  depositAmount: number;
  post: Post;
  currentUser: User;
  acceptedRefundPolicies: boolean = false;
  openedDialogFlow: boolean;
  paymentMethod: 'bank-transfer' | 'paypal' | 'azul';
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
                cursor: 'pointer',
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
              if (valid && value.email && value.email.length > 0) {
                await this.authService.updateMe({
                  email: value.email,
                });
                this.redirectToAzulPaymentPage();
              } else {
                this.toastrService.error(
                  value.email && value.email.length > 0
                    ? 'Email invalido'
                    : 'Campo vacio, ingresa un email valido',
                  null,
                  {
                    timeOut: 1500,
                  }
                );
              }
            } catch (error) {
              const user = await this.authService.checkUser(value.email);

              if (user) {
                this.toastrService.error(
                  'Email ya registrado con otro usuario, ingresa un email diferente',
                  null,
                  {
                    timeOut: 1500,
                  }
                );
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

  valComprobant: boolean = false;
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
    private toastrService: ToastrService,
    private entityTemplateService: EntityTemplateService,
    private authService: AuthService,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar,
    private deliveryZonesService: DeliveryZonesService
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
        const { redirectToAzul, privatePost } = queryParams;

        this.status = 'loading';
        const redirectToAzulPaymentsPage = Boolean(redirectToAzul);
        if (orderId) {
          const { orderStatus } = await this.orderService.getOrderStatus(
            orderId
          );

          // const deliveryData = await this.deliveryZonesService.deliveryZone(orderId)

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
          // console.log("this.order", this.order)
          // Cálculo del subtotal (monto acumulado de todos los artículos involucrados en la orden)
          this.subtotal = this.order.subtotals.reduce(
            (a, b) => (b?.type === 'item' ? a + b.amount : a),
            0
          );
          // Cálculo del monto de los costos de envío
          this.deliveryAmount = this.order.subtotals.reduce(
            (a, b) => (b?.type === 'delivery' ? a + b.amount : a),
            0
          );
          // Cálculo del monto total de la orden (sumatoria de todos los subtotales)
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
          console.log("this.headerService", this.headerService)
        }
        const exchangeData = await this.walletService.exchangeData(
          this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id
        );

        this.banks = exchangeData?.ExchangeData?.bank;
        console.log("this.banks", this.banks)
        this.electronicPayments = exchangeData?.ExchangeData?.electronicPayment;

        const registeredUser = JSON.parse(
          localStorage.getItem('registered-user')
        ) as User;
        this.currentUser =
          this.order?.user ||
          this.headerService.user ||
          this.headerService.alreadyInputtedloginDialogUser ||
          registeredUser;
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

        console.log(this.azulPaymentsSupported);

        if (redirectToAzulPaymentsPage) {
          this.redirectToAzulPaymentPage();
        }

        if (!this.azulPaymentsSupported) {
          this.onlinePaymentsOptions.pop();
        }

        if (
          (redirectToAzulPaymentsPage && !this.order.user) ||
          (privatePost === 'true' && this.currentUser && !this.order.user)
        ) {
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

        // if (this.azulPaymentsSupported) this.checkIfAzulPaymentURLIsAvailable();

        if (this.post && !this.post.author && this.currentUser)
          await this.postsService.postAddUser(
            this.post._id,
            this.currentUser._id
          );

        if (privatePost === 'true' && this.currentUser) {
          const templateMatches =
            await this.entityTemplateService.entityTemplates({
              findBy: {
                reference: this.post._id,
                entity: 'post',
              },
            });
          if (!templateMatches.length) {
            const entityTemplate =
              await this.entityTemplateService.createEntityTemplate();
            await this.entityTemplateService.entityTemplateAuthSetData(
              entityTemplate._id,
              {
                reference: this.order.items[0].post._id,
                entity: 'post',
                access: privatePost === 'true' ? 'private' : 'public',
                templateNotifications:
                  this.postsService.entityTemplateNotificationsToAdd.map(
                    (keyword) => ({
                      key: keyword,
                      message:
                        keyword === 'SCAN'
                          ? 'Han escaneado el QR de tu mensaje de regalo!!!'
                          : 'Han accedido a tu mensaje de regalo!!!, Recipiente: ',
                    })
                  ),
              }
            );
            if (!this.postsService.postReceiverNumber) {
              this.postsService.postReceiverNumber = JSON.parse(
                localStorage.getItem('postReceiverNumber')
              );
            }
            const recipientUser = await this.authService.checkUser(
              this.postsService.postReceiverNumber
            );
            if (recipientUser) {
              const recipient =
                await this.entityTemplateService.createRecipient({
                  phone: this.postsService.postReceiverNumber,
                });
              if (this.postsService.privatePost) {
                await this.entityTemplateService.entityTemplateAddRecipient(
                  entityTemplate._id,
                  {
                    edit: false,
                    recipient: recipient._id,
                  }
                );
              }
            }
          }
        }
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

  fileUpload(event: any) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageBase64 = e.target.result as string;
      this.image = base64ToFile(e.target.result as string);
      this.valComprobant = true;
    };
    if(event?.target)
      reader.readAsDataURL(event.target.files[0] as File);
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
    this.router.navigate([`../../../order-confirmation/${id || this.order._id}`], {
      relativeTo: this.route,
      replaceUrl: true
    });
  }

  async submitPayment() {
    this.disableButton = true;
    lockUI();
    if (this.order) {
      if (this.order.orderStatus === 'draft') {
        if (this.currentUser) {
          this.order = (
            await this.orderService.authOrder(
              this.order._id,
              this.currentUser._id
            )
          ).authOrder;
          localStorage.removeItem('registered-user');
        } else {
          unlockUI();
          const dialogRef = this.matDialog.open(LoginDialogComponent, {
            data: {
              loginType: 'phone',
            },
          });
          dialogRef.afterClosed().subscribe(async (value) => {
            if (!value) {
              this.disableButton = false;
              return;
            }
            const userId = value.user?._id || value.session.user._id;
            if (userId) {
              this.order = (
                await this.orderService.authOrder(this.order._id, userId)
              ).authOrder;
              this.payOrder();
            }
          });
          return;
        }
      }
      this.payOrder();
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

  async payOrder() {
    await this.orderService.payOrder(
      {
        image: this.image,
        platform: 'bank-transfer',
        transactionCode: '',
        subtotal: this.paymentAmount,
      },
      this.order.user._id,
      'bank-transfer',
      this.order._id,
      {
        paymentMethod: this.paymentMethod,
        paymentReceiverId: this.paymentMethod === 'bank-transfer' ? this.banks[0]?.paymentReceiver._id : this.electronicPayments[0]?.paymentReceiver._id,
      }
    );
    unlockUI();
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
        this.matDialog.open(LoginDialogComponent, {
          data: {
            loginType: 'full',
          },
        });
        // this.router.navigate([`/auth/login`], {
        //   queryParams: {
        //     orderId: this.order._id,
        //     onlinePayment: 'payment-with-stripe',
        //   },
        // });
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
        this.matDialog.open(LoginDialogComponent, {
          data: {
            loginType: 'full',
          },
        });
        // this.router.navigate([`/auth/login`], {
        //   queryParams: {
        //     orderId: this.order._id,
        //     onlinePayment: 'payment-with-stripe',
        //   },
        // });
      }
    } else if (paymentOptionName === 'Tarjeta de crédito') {
      if (this.currentUser && this.logged && this.currentUser.email)
        this.redirectToAzulPaymentPage();
      else if (this.currentUser && this.logged && !this.currentUser.email) {
        this.openedDialogFlow = true;
      } else {
        const dialogRef = this.matDialog.open(LoginDialogComponent, {
          data: {
            loginType: 'full',
            magicLinkData: {
              redirectionRoute:
                window.location.href.split('/').slice(3).join('/') +
                '?redirectToAzul=true',
              entity: 'UserAccess',
            },
          } as LoginDialogData,
        });
        dialogRef.afterClosed().subscribe(async (value) => {
          if (!value) return;
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              redirectToAzul: true,
            },
          });
        });

        // this.router.navigate(['auth/login'], {
        //   queryParams: {
        //     orderId: this.order._id,
        //     auth: 'azul-login',
        //     paymentWithAzul: true,
        //     redirect:
        //       window.location.href.split('/').slice(3).join('/') +
        //       '?redirectToAzul=true',
        //   },
        // });
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
      //ITBIS: (this.paymentAmount * 0.18).toFixed(2).toString().replace('.', ''),
      ITBIS: '000',
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
        console.log(data);
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
          this.postsService.post = null;
          this.postsService.privatePost = null;
          this.postsService.dialogs = null;
          this.postsService.temporalDialogs = null;
          this.postsService.temporalDialogs2 = null;
          localStorage.removeItem('postReceiverNumber');
          localStorage.removeItem('privatePost');
          localStorage.removeItem('post');

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

  remindRefundPolicies() {
    this.snackBar.open(
      'Debes aceptar las políticas de reembolso antes de continuar con tu orden',
      'OK',
      {
        duration: 3000,
        panelClass: ['mat-accent'],
      }
    );
  }

  selectPaymentMethod(method: 'bank-transfer' | 'paypal' | 'azul') {
    if (!this.paymentMethod) {
      this.paymentMethod = method;
      this.imageBase64 = null;
      this.image = null;
    }else if (this.paymentMethod === method) {
      this.paymentMethod = null;
      this.image = null;
      this.imageBase64 = null;
    }
    else this.paymentMethod = method;
    
    if (this.paymentMethod === 'azul') {
      this.selectOnlinePayment(0);
    }
  }

  cleanPhoto(){
    this.imageBase64 = null;
    this.image = null;
    this.valComprobant = false;
  }
  
  onBackClickComprobant(){
    this.valComprobant = false;
  }
}
