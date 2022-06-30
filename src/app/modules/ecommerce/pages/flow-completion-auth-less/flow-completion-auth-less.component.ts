import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrderService } from 'src/app/core/services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletService } from 'src/app/core/services/wallet.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Bank } from 'src/app/core/models/wallet';
import { LocationStrategy, TitleCasePipe } from '@angular/common';
import { HeaderService } from 'src/app/core/services/header.service';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ItemOrder } from 'src/app/core/models/order';
import { FormControl, Validators } from '@angular/forms';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { environment } from 'src/environments/environment';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';

interface BankDetails {
  status: boolean;
  value: string;
  description: any;
}

@Component({
  selector: 'flow-completion-auth-less',
  templateUrl: './flow-completion-auth-less.component.html',
  styleUrls: ['./flow-completion-auth-less.component.scss'],
  providers: [TitleCasePipe],
})
export class FlowCompletionAuthLessComponent implements OnInit {
  @Input() localStorageFlowRoute = '';
  options = [
    {
      status: true,
      value: 'Si',
    },
    {
      status: true,
      value: 'No',
    },
  ];
  bankOptions: BankDetails[] = [];
  banksInfo: BankDetails[] = [];
  banks: Bank[] = [];
  step: 'PHONE_CHECK_AND_SHOW_BANKS' | 'UPDATE_NAME_AND_SHOW_BANKS' | 'PAYMENT_INFO' = 'PHONE_CHECK_AND_SHOW_BANKS';
  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  phoneNumber = new FormControl('', [Validators.required]);
  selectedBank: BankDetails = null;
  paymentCode: string = '';
  image: File;
  merchantInfo: Merchant;
  orderId: string;
  isLogged: boolean;
  userId: string;
  userData: User;
  orderData: any;
  isAPreOrder: boolean = true;
  fakeData: ItemOrder;
  reservationOrProduct: string = '';
  headerText: string;
  disableUserDataInputs: boolean = false;
  dialogProps: Record<string, any>;
  saleflowData: SaleFlow;
  ammount = new FormControl('', Validators.pattern(/^\d+$/));
  stepButtonText: string;
  stepButtonMode: string;
  whatsappLink: string = '';
  fixedWhatsappLink: string = '';
  fixedWhatsappLink2: string = '';
  isANewUser: boolean = false;
  pastStep: 'PHONE_CHECK_AND_SHOW_BANKS' | 'UPDATE_NAME_AND_SHOW_BANKS' | 'PAYMENT_INFO';
  env: string = environment.assetsUrl;
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.DominicanRepublic, CountryISO.UnitedStates];
  shouldAllowPaymentSkipping: boolean = false;
  showCartCallBack: () => void;
  itemsAmount: number;

  constructor(
    private authService: AuthService,
    public order: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private wallet: WalletService,
    private header: HeaderService,
    private customizerValueService: CustomizerValueService,
    private merchant: MerchantsService,
    protected _DomSanitizer: DomSanitizer,
    private titlecasePipe: TitleCasePipe,
    private saleflow: SaleFlowService,
    private dialogService: DialogService,
    private location: LocationStrategy,
  ) {
    if(this.header.orderId) {
      history.pushState(null, null, window.location.href);
      this.location.onPopState(() => {
        history.pushState(null, null, window.location.href);
      });
    }
  }

  afterOrderRequest = async (data) => {
    if (
      data.order.orderStatus === 'cancelled' ||
      data.order.orderStatus === 'to confirm' ||
      data.order.orderStatus === 'completed'
    )
      this.router.navigate([`ecommerce/order-info/${data.order._id}`]);
    if (data.order.items[0].reservation?._id !== null) {
      this.reservationOrProduct = 'reservacion';
    } else {
      this.reservationOrProduct = 'producto';
    }

    if (data) {
      this.fakeData = data.order;
      if (!this.merchantInfo) {
        await this.getMerchant(this.fakeData.merchants[0]._id).then(() => {
          this.merchantInfo = this.header.merchantInfo;
          if(this.merchantInfo?.name.includes('&')) {
            this.merchantInfo.name = this.merchantInfo?.name.replace('&', 'and');
          }
        });
      }
      const totalPrice = this.fakeData.subtotals.reduce(
        (a, b) => a + b.amount,
        0
      );

      this.orderData = {
        id: this.fakeData._id,
        userId: this.fakeData.user ? this.fakeData.user._id : null,
        user: this.fakeData.user ? this.fakeData.user : null,
        itemAmount: this.fakeData.items.reduce((a, b) => a + b.amount, 0),
        name: this.fakeData.itemPackage?.name
          ? this.fakeData.itemPackage?.name
          : this.fakeData.items[0].item.name,
        amount: this.fakeData.items[0].customizer
          ? totalPrice * 1.18
          : totalPrice,
        hasCustomizer: this.fakeData.items[0].customizer ? true : false,
        isPackage: this.fakeData.itemPackage ? true : false,
      };

      const fullLink = `${environment.uri}/ecommerce/order-info/${this.orderData.id}`;

      this.fixedWhatsappLink2 = `https://wa.me/${this.merchantInfo.owner.phone}?text=Hola%20${this.merchantInfo.name},%20%20acabo%20de%20hacer%20una%20orden.%20Mas%20info%20aquí%20${fullLink}`;

      this.products = this.fakeData.items.map((item) => {
        const newItem = item.item;
        if (item.customizer) {
          newItem.customizerId = item.customizer._id;
          newItem.total = totalPrice * 1.18;
          this.customizerValueService
            .getCustomizerValuePreview(item.customizer._id)
            .then((value) => {
              newItem.images[0] = value.preview;
            });
        }
        return newItem;
      });

      let showProducts = [];
      if (this.orderData.isPackage) {
        showProducts.push(this.fakeData.itemPackage);
      } else {
        showProducts = this.products;
      }

      this.dialogProps = {
        orderFinished: true,
        products: showProducts,
      };
      this.itemsAmount = showProducts.length;
      this.showCartCallBack = () => this.openCart();

      if (!this.orderData) {
        this.router.navigate(['/error-screen/?type=item']);
      }
      if (data.order.items[0].saleflow.module.paymentMethod?.paymentModule?._id)
        await this.getExchangeData(
          data.order.items[0].saleflow.module.paymentMethod.paymentModule._id
        );
    } else {
      this.router.navigate(['/ecommerce/error-screen']);
    }
  };

  openCart() {
    this.dialogService.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: this.dialogProps,
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  async getOrderData(id: string, preOrder = false) {
    if (preOrder) {
      return this.order
        .preOrder(id)
        .then(this.afterOrderRequest)
        .catch((error) => console.log(error));
    } else {
      return this.order
        .order(id)
        .then(this.afterOrderRequest)
        .catch((error) => console.log(error));
    }
  }

  async getMerchant(id: string) {
    try {
      const merchant = await this.merchant.merchant(id);
      this.header.merchantInfo = merchant;
    } catch (error) {
      console.log(error);
    }
  }

  products: any[] = [];

  async ngOnInit() {
    this.localStorageFlowRoute =
      this.header.flowRoute || localStorage.getItem('flowRoute');

    this.route.params.subscribe(async (routeParams) => {
      const { orderId } = routeParams;

      const { orderStatus } = await this.order.getOrderStatus(orderId);

      if (orderId) {
        this.orderId = orderId;

        await this.getOrderData(orderId, orderStatus === 'draft');

        if (orderStatus === 'completed') {
          this.redirect();
        }

        if (orderStatus !== 'draft') {
          this.phoneNumber.setValue(this.orderData.user.phone);
          this.name.setValue(this.orderData.user.name);
          this.phoneNumber.disable();
          this.name.disable();
          this.disableUserDataInputs = true;
        }
        //   await this.order.authOrder(orderId);

        //   await this.getOrderData(orderId, false);
        // }
      } else if (!this.header.isDataComplete()) {
        this.header.resetIsComplete();
      }

      const saleflow =
        this.header.saleflow ||
        JSON.parse(localStorage.getItem('saleflow-data'));
      this.saleflowData = saleflow;

      if (saleflow._id === '61b8df151e8962cdd6f30feb')
        this.shouldAllowPaymentSkipping = true;

      if (saleflow?.module?.paymentMethod?.paymentModule?._id) {
        try {
          await this.getExchangeData(
            saleflow.module.paymentMethod.paymentModule._id
          );
          this.step = 'PHONE_CHECK_AND_SHOW_BANKS';

          // if (currentSession) {
          //   await this.getExchangeData(
          //     saleflow.module.paymentMethod.paymentModule._id
          //   );
          //   this.isANewUser =
          //     currentSession.name === '' ||
          //     String(currentSession.name) === 'null';
          //   this.step = 'UPDATE_NAME_AND_SHOW_BANKS';
          // } else {
          //   this.router.navigate(['/']);
          // }
        } catch (error) {
          console.log(error);
        }
      }

      this.headerText =
        this.saleflowData._id === '6201d72bdfeceed4d13805bc'
          ? 'INFORMACIÓN'
          : 'INFORMACIÓN DEL PAGO';
      let packages: string[] = [];
      if (this.header.order?.itemPackage) {
        packages.push(this.header.order.itemPackage);
        const listPackages = (
          await this.saleflow.listPackages({
            findBy: {
              _id: {
                __in: ([] = packages),
              },
            },
          })
        ).listItemPackage;
        this.products = listPackages;
      }

      if (this.header.merchantInfo || localStorage.getItem('merchantInfo'))
        this.merchantInfo =
          this.header.merchantInfo ||
          JSON.parse(localStorage.getItem('merchantInfo'));
    });
  }

  findItemData(products) {
    this.saleflow
      .listItems({
        findBy: {
          _id: {
            __in: ([] = products),
          },
        },
      })
      .then((data) => {
        this.products = data.listItems;
      });
  }

  async getExchangeData(id: string) {
    const data = await this.wallet.exchangedata(id);

    this.banks = data.ExchangeData.bank;

    this.banksInfo = this.banks.map(bank => {
      return {
        value: `${bank.bankName}`,
        status: true,
        description: {
          typeAccount: bank.typeAccount,
          owner: bank.ownerAccount,
          account: bank.account,
          routingNumber: bank.routingNumber
        }
      }
    });

    this.bankOptions = this.banks.map(bank => {
      return {
        value: `${bank.bankName} (${bank.account}, ${bank.ownerAccount})`,
        status: true,
        description: {
          typeAccount: bank.typeAccount,
          owner: bank.ownerAccount,
          account: bank.account,
          routingNumber: bank.routingNumber
        }
      }
    });

    // let wallets = [];
    // for (let i = 0; i < data.ExchangeData.bank.length; i++) {
    //   wallets.push(
    //     await this.wallet.paymentReceiver(
    //       data.ExchangeData.bank[i].paymentReceiver._id
    //     )
    //   );
    // }
    


    // Promise.all(wallets).then((values) => {
    //   console.log(values);
    //   let descriptions = data.ExchangeData.bank.map((value) => {
    //     return {
    //       owner: value.ownerAccount,
    //       type: value.typeAccount,
    //       account: value.account,
    //       routingNumber: value.routingNumber,
    //     };
    //   });
    //   const payments = values.map((value) => {
    //     return {
    //       paymenteceiver: value.PaymentReceiver,
    //       bankdata: descriptions,
    //     };
    //   });
    //   console.log(payments);
    //   this.bankOptions = payments.map((value, index) => {
    //     this.banks[index].name = this.titlecasePipe.transform(
    //       value.paymenteceiver.name
    //     );
    //     return {
    //       value: this.titlecasePipe.transform(`${value.paymenteceiver.name} (${value.bankdata[0].account}, ${value.bankdata[0].owner})`),
    //       status: true,
    //       description: {
    //         typeAccount: value.bankdata[0].type,
    //         owner: value.bankdata[0].owner,
    //         account: value.bankdata[0].account,
    //         routingNumber: value.bankdata[0].routingNumber
    //       },
    //     };
    //   });
    // });
  }

  async submit() {
    const fullLink = `${environment.uri}/ecommerce/order-info/${this.orderData.id}`;

    try {
      switch (this.step) {
        case 'PHONE_CHECK_AND_SHOW_BANKS': {
          if (this.isAPreOrder) {
            const foundUser = await this.checkIfUserExists();
            
            this.userData = foundUser;

            if (!foundUser || !foundUser.name || String(foundUser.name) === 'null') {
              this.step = 'UPDATE_NAME_AND_SHOW_BANKS';
              return;
            }

            if (foundUser && foundUser.name) {
              lockUI();

              const { orderStatus } = await this.order.getOrderStatus(
                this.orderId
              );

              if (orderStatus === 'draft') {
                await this.order.authOrder(this.orderId, foundUser._id);
                this.header.deleteSaleflowOrder(this.saleflowData._id);
                this.header.resetIsComplete();
                this.isAPreOrder = false;
              }

              await this.getOrderData(this.orderId, false);

              //disable 1st step inputs to avoid further changes to existing order
              this.phoneNumber.disable();

              if (this.banks.length === 1) {
                this.selectedBank = this.bankOptions[0];
              }
              unlockUI();
            }
          }
          if (this.saleflowData?.module?.paymentMethod?.paymentModule?._id) {
            this.pastStep = this.step;
            this.step = 'PAYMENT_INFO';
          } else {
            this.whatsappLink = `https://wa.me/${this.merchantInfo.owner.phone}?text=Hola%20${this.merchantInfo.name},%20%20acabo%20de%20hacer%20una%20orden.%20Mas%20info%20aquí%20${fullLink}`;

            // const link = document.getElementById(
            //   'invisible-link'
            // ) as HTMLAnchorElement;
            // link.click();

            this.redirect();
          }

          this.fixedWhatsappLink = `https://wa.me/${
            this.merchantInfo.owner.phone
          }?text=Hola%20${
            this.merchantInfo.name
          },%20%20acabo%20de%20hacer%20una%20orden.${
            String(this.userData.name) !== 'null' && this.userData.name
              ? '%20Mi%20nombre%20es:%20' + this.userData.name
              : ''
          }.%20Mas%20info%20aquí%20${fullLink}`;

          break;
        }
        case 'UPDATE_NAME_AND_SHOW_BANKS': {
          if (this.isAPreOrder) {
            // this.totalQuestions = 2;
            const phoneNumber = this.phoneNumber.value.e164Number.split('+')[1];

            if (!this.name.disabled) {
              lockUI();

              let registeredNewUser: User = null;

              let foundUser = await this.authService.checkUser(phoneNumber);
              this.userData = foundUser;

              const { orderStatus } = await this.order.getOrderStatus(
                this.orderId
              );

              if(!foundUser) {
                registeredNewUser = await this.signUp();
                this.userData = registeredNewUser;

                if (registeredNewUser && orderStatus === 'draft') {
                  await this.order.authOrder(this.orderId, registeredNewUser._id);
                  this.header.deleteSaleflowOrder(this.saleflowData._id);
                  this.header.resetIsComplete();
                  this.isAPreOrder = false;
                }
  
                await this.getOrderData(this.orderId, false);
                //disable 1st step inputs to avoid further changes to existing order
                this.name.disable();
  
                if (this.banks.length === 1) {
                  this.selectedBank = this.bankOptions[0];
                }
                unlockUI();
              }

              if(foundUser && !foundUser.name) {
                this.userData.name = this.name.value;
                const { orderStatus } = await this.order.getOrderStatus(
                  this.orderId
                );
  
                if (orderStatus === 'draft') {
                  await this.order.authOrder(this.orderId, foundUser._id);
                  this.header.deleteSaleflowOrder(this.saleflowData._id);
                  this.header.resetIsComplete();
                  this.isAPreOrder = false;
                }
  
                await this.getOrderData(this.orderId, false);
  
                //disable 1st step inputs to avoid further changes to existing order
                this.phoneNumber.disable();
  
                if (this.banks.length === 1) {
                  this.selectedBank = this.bankOptions[0];
                }
                unlockUI();
              }
            }
            // this.updateUser();
          }

          this.pastStep = this.step;
          this.step = 'PAYMENT_INFO';
          break;
        }
        case 'PAYMENT_INFO':
          this.payOrder();
          break;
      }
    } catch (error) {
      console.log(error);
    }
  }

  selectBank(index: number) {
    this.selectedBank = this.bankOptions[index];
  }

  validateNumbers(event: KeyboardEvent) {
    event.preventDefault();
    let transformedOutput: string = this.ammount.value;
    if ('0123456789'.includes(event.key) && event.key !== 'Backspace') {
      transformedOutput += event.key;
    }

    if (event.key === 'Backspace' && transformedOutput.length > 0) {
      transformedOutput = transformedOutput.slice(0, -1);
    }

    this.ammount.setValue(transformedOutput);
  }

  goBack() {
    if (this.step === 'UPDATE_NAME_AND_SHOW_BANKS') {
      this.step = 'PHONE_CHECK_AND_SHOW_BANKS';
    }

    if (
      this.step === 'PHONE_CHECK_AND_SHOW_BANKS' && !this.header.orderId &&
      (this.header.flowRoute || this.localStorageFlowRoute !== '')
    ) {
      const redirectionURL = `/ecommerce/${
        this.header.flowRoute || this.localStorageFlowRoute
      }`;
      this.router.navigate([redirectionURL]);
    }

    if (this.step === 'PAYMENT_INFO') {
      this.image = null;
      this.selectedBank = null;
      this.step = this.pastStep;
      this.isANewUser = false;
    }
  }

  // PAYMENT INFO
  async signUp() {
    try {
      const data = await this.authService.signup(
        {
          phone: this.phoneNumber.value.e164Number.split('+')[1],
          name: this.name.value,
        },
        'whatsapp'
      );
      if (data) {
        localStorage.setItem('id', data._id);
        return data;
      } else {
        console.log('error');
      }
    } catch (error) {
      console.log(error);
    }
  }

  async checkIfUserExists(): Promise<User | null> {
    const phoneNumber = this.phoneNumber.value.e164Number.split('+')[1];
    const data = await this.authService.checkUser(phoneNumber);

    if (data) {
      return data;
    } else {
      return null;
    }
  }

  // PAYMENT INFO
  async updateUser() {
    try {
      const input = {
        name: this.name.value,
      };

      if (this.isANewUser) {
        const data = await this.authService.updateMe(input);
        this.userData = data;
      }

      this.isLogged = true;
      // if (this.orderId) {
      //   this.router.navigate(['ecommerce/error-screen']);
      //   return;
      // }

      if (this.banks.length === 1) {
        this.selectedBank = this.bankOptions[0];
      }

      this.step = 'PAYMENT_INFO';
    } catch (error) {
      console.log(error);
    }
  }

  // Case 7
  onFileInput(file: File | { image: File; index: number }) {
    if (!('index' in file)) this.image = file;
  }

  // Case 7
  async payOrder() {
    const totalPrice = this.fakeData.subtotals.reduce(
      (a, b) => a + b.amount,
      0
    );
    const fullLink = `${environment.uri}/ecommerce/order-info/${this.orderData.id}`;
    // const ammount = new Intl.NumberFormat('es-MX').format(
    //   this.ammount.value.toLocaleString('es-MX')
    // );
    if (this.fakeData.items[0].customizer)
      this.whatsappLink = `https://wa.me/${
        this.merchantInfo.owner.phone
      }?text=Hola%20${
        this.merchantInfo.name
      },%20le%20acabo%20de%20hacer%20un%20pago%20de%20$${
        Math.round((totalPrice * 1.18 + Number.EPSILON) * 100) / 100
      }.${
        String(this.userData.name) !== 'null' && this.userData.name
          ? '%20Mi%20nombre%20es:%20' + this.userData.name
          : ''
      }.%20Mas%20info%20aquí%20${fullLink}`;
    else
      this.whatsappLink = `https://wa.me/${
        this.merchantInfo.owner.phone
      }?text=Hola%20${
        this.merchantInfo.name
      },%20le%20acabo%20de%20hacer%20un%20pago%20de%20$${totalPrice.toLocaleString(
        'es-MX'
      )}.%20Mi%20nombre%20es:%20${
        this.userData.name
      }.%20Mas%20info%20aquí%20${fullLink}`;
    try {
      lockUI();

      // alert(this.orderData.userId + " === " + this.orderData.user._id + " === " + this.orderData.user.name);

      const data = await this.order.payOrder(
        {
          image: this.image,
          platform: 'bank-transfer',
          transactionCode: this.paymentCode,
        },
        this.orderData.userId,
        'bank-transfer',
        this.orderData.id
      );
      // this.header.deleteSaleflowOrder(this.saleflowData._id);
      // this.header.resetIsComplete();
      this.header.storedDeliveryLocation = null;

      this.orderFinished();
    } catch (error) {
      console.log(error);
      this.orderFinished();
    }
  }

  changeStickyButtonText() {
    switch (this.step) {
      case 'PHONE_CHECK_AND_SHOW_BANKS':
        return (this.stepButtonText =
          !this.phoneNumber.value || this.phoneNumber.value.nationalNumber === '' || this.phoneNumber.status === 'INVALID' 
            ? 'ESCRIBE COMO TE CONTACTAMOS'
            : 'CONTINUAR LA ORDEN');
      case 'UPDATE_NAME_AND_SHOW_BANKS':
        return (this.stepButtonText =
          this.name.status === 'INVALID'
            ? 'ESCRIBE QUIEN ERES'
            : 'CONTINUAR LA ORDEN');

      case 'PAYMENT_INFO':
        return (this.stepButtonText =
          !this.image || !this.selectedBank
            ? 'ADICIONA LA INFO DE LA TRANSFERENCIA'
            : 'MANDA TU ORDEN A ' + this.merchantInfo.name.toUpperCase());
    }
  }

  changeStickyButtonMode() {
    switch (this.step) {
      case 'PHONE_CHECK_AND_SHOW_BANKS':
        return (this.stepButtonMode =
          !this.phoneNumber.value || this.phoneNumber.value.nationalNumber === '' || this.phoneNumber.status === 'INVALID' ? 'disabled-fixed' : 'fixed');
      case 'UPDATE_NAME_AND_SHOW_BANKS':
        return (this.stepButtonMode =
          this.name.status === 'INVALID' ? 'disabled-fixed' : 'fixed');
      case 'PAYMENT_INFO':
        return !this.image || !this.selectedBank ? 'disabled-fixed' : 'fixed';
    }
  }

  redirect() {
    this.router.navigate([`ecommerce/order-info/${this.orderData.id}`]);
  }

  orderFinished() {
    unlockUI();
    this.redirect();
  }

  validCharacters(event: KeyboardEvent) {
    if (
      event.key == '-' ||
      event.key == '(' ||
      event.key == ')' ||
      event.key == '+' ||
      !isNaN(parseInt(event.key))
    ) {
    } else {
      event.preventDefault();
    }
  }
}
