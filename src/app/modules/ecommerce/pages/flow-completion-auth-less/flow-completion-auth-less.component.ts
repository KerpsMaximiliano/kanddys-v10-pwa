import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrderService } from 'src/app/core/services/order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletService } from 'src/app/core/services/wallet.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Bank } from 'src/app/core/models/wallet';
import { Location, TitleCasePipe } from '@angular/common';
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

interface BankDetails {
  status: boolean;
  value: string;
  description: string[];
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
  banks: Bank[] = [];
  step: string = 'UPDATE_NAME_AND_SHOW_BANKS';
  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.pattern(/^\d{10,}$/),
  ]);
  selectedBank: BankDetails = null;
  paymentCode: string = '';
  image: File;
  merchantInfo: Merchant;
  orderId: string;
  isLogged: boolean;
  userData: User;
  orderData: any;
  fakeData: ItemOrder;
  reservationOrProduct: string = '';
  headerText: string;
  disableUserDataInputs: boolean = false;
  dialogProps: Record<string, any>;
  saleflowData: any;
  ammount = new FormControl('', Validators.pattern(/^\d+$/));
  whatsappLink: string = '';
  isANewUser: boolean = false;
  env: string = environment.assetsUrl;

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
    private saleflow: SaleFlowService
  ) {}

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
      this.header.saleflow = data.order.items[0].saleflow;
      this.fakeData = data.order;
      if (!this.merchantInfo) {
        this.getMerchant(this.fakeData.merchants[0]._id).then(() => {
          this.merchantInfo = this.header.merchantInfo;
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

      console.log('Order data', this.orderData);

      if (!this.orderData) {
        this.router.navigate(['/error-screen/?type=item']);
      }

      await this.getExchangeData(
        data.order.items[0].saleflow.module.paymentMethod.paymentModule._id
      );
    } else {
      this.router.navigate(['/ecommerce/error-screen']);
    }
  };

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

    console.log(this.localStorageFlowRoute);

    this.route.params.subscribe(async (routeParams) => {
      const { orderId } = routeParams;

      await this.getOrderData(orderId, true);

      if (orderId) {
        this.orderId = orderId;

        const { orderStatus } = await this.order.getOrderStatus(orderId);

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

      try {
        await this.getExchangeData(
          saleflow.module.paymentMethod.paymentModule._id
        );
        this.step = 'UPDATE_NAME_AND_SHOW_BANKS';

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

      this.headerText = 'INFORMACIÓN DEL PAGO';
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

    let wallets = [];
    for (let i = 0; i < data.ExchangeData.bank.length; i++) {
      wallets.push(
        this.wallet.paymentReceiver(
          data.ExchangeData.bank[i].paymentReceiver._id
        )
      );
    }
    Promise.all(wallets).then((values) => {
      let descriptions = data.ExchangeData.bank.map((value) => {
        return {
          owner: value.ownerAccount,
          type: value.typeAccount,
          account: value.account,
          routingNumber: value.routingNumber,
        };
      });
      const payments = values.map((value) => {
        return {
          paymenteceiver: value.PaymentReceiver,
          bankdata: descriptions,
        };
      });
      this.bankOptions = payments.map((value, index) => {
        this.banks[index].name = this.titlecasePipe.transform(
          value.paymenteceiver.name
        );
        return {
          value: this.titlecasePipe.transform(value.paymenteceiver.name),
          status: true,
          description: [
            `Tipo de cuenta: ${value.bankdata[0].type}`,
            `${value.bankdata[0].owner}`,
            `Cuenta: ${value.bankdata[0].account}`,
            `RNC: ${value.bankdata[0].routingNumber}`,
          ],
        };
      });
    });
  }

  async submit() {
    switch (this.step) {
      case 'UPDATE_NAME_AND_SHOW_BANKS':
        // this.totalQuestions = 2;

        if (!this.phoneNumber.disabled && !this.name.disabled) {
          lockUI();

          let registeredNewUser: User = null;
          console.log(this.phoneNumber.value);

          let foundUser = await this.authService.checkUser(
            String(this.phoneNumber.value)
          );
          this.userData = foundUser;

          console.log(foundUser);

          const { orderStatus } = await this.order.getOrderStatus(this.orderId);

          if (foundUser && foundUser._id !== '') {
            if (orderStatus === 'draft')
              await this.order.authOrder(this.orderId, foundUser._id);
          } else {
            registeredNewUser = await this.signUp();
            this.userData = registeredNewUser;

            if (registeredNewUser && orderStatus === 'draft')
              await this.order.authOrder(this.orderId, registeredNewUser._id);
          }

          //disable 1st step inputs to avoid further changes to existing order
          this.phoneNumber.disable();
          this.name.disable();

          if (this.banks.length === 1) {
            this.selectedBank = this.bankOptions[0];
          }

          this.step = 'PAYMENT_INFO';
          unlockUI();
        } else {
          this.step = 'PAYMENT_INFO';
        }

        // this.updateUser();
        break;
      case 'PAYMENT_INFO':
        this.payOrder();
        break;
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
    if (
      this.step === 'UPDATE_NAME_AND_SHOW_BANKS' &&
      (this.header.flowRoute || this.localStorageFlowRoute !== '')
    ) {
      const redirectionURL = `/ecommerce/${
        this.header.flowRoute || this.localStorageFlowRoute
      }`;
      console.log(this.localStorageFlowRoute, redirectionURL);
      this.router.navigate([redirectionURL]);
    }

    if (this.step === 'PAYMENT_INFO') {
      this.step = 'UPDATE_NAME_AND_SHOW_BANKS';
      this.isANewUser = false;
    }
  }

  // PAYMENT INFO
  async signUp() {
    try {
      const data = await this.authService.signup(
        { phone: '1' + this.phoneNumber.value, name: this.name.value },
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
  onFileInput(file: File) {
    this.image = file;
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
      this.orderFinished();

      this.header.deleteSaleflowOrder(this.saleflowData._id);
      this.header.resetIsComplete();
    } catch (error) {
      console.log(error);
      this.orderFinished();
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
