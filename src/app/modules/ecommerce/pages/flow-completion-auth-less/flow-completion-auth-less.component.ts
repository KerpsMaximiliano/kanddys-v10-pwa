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
import { Item, ItemPackage } from 'src/app/core/models/item';

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
  step:
    | 'PHONE_CHECK_AND_SHOW_BANKS'
    | 'UPDATE_NAME_AND_SHOW_BANKS'
    | 'PAYMENT_INFO' = 'PHONE_CHECK_AND_SHOW_BANKS';
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
  isAPreOrder: boolean = true;
  orderData: ItemOrder;
  products: Item[] | ItemPackage[] = [];
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
  pastStep:
    | 'PHONE_CHECK_AND_SHOW_BANKS'
    | 'UPDATE_NAME_AND_SHOW_BANKS'
    | 'PAYMENT_INFO';
  env: string = environment.assetsUrl;
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO.DominicanRepublic;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  buttonBlocked: boolean = false;
  itemsAmount: number;
  totalPrice: number;

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
    private location: LocationStrategy
  ) {
    if (this.header.orderId) {
      history.pushState(null, null, window.location.href);
      this.location.onPopState(() => {
        history.pushState(null, null, window.location.href);
      });
    }
  }

  afterOrderRequest = async ({ order }: { order: ItemOrder }) => {
    if (!order) {
      this.router.navigate(['/ecommerce/error-screen']);
      return;
    }
    this.orderData = order;

    if (
      order.orderStatus === 'cancelled' ||
      order.orderStatus === 'to confirm' ||
      order.orderStatus === 'completed'
    )
      this.router.navigate([`ecommerce/order-info/${order._id}`]);
    if (order.items[0].reservation?._id !== null)
      this.reservationOrProduct = 'reservacion';
    else this.reservationOrProduct = 'producto';
    if (!this.merchantInfo) {
      await this.getMerchant(order.merchants[0]._id);
      if (this.merchantInfo?.name.includes('&'))
        this.merchantInfo.name = this.merchantInfo?.name.replace('&', 'and');
    }

    this.totalPrice = order.subtotals.reduce((a, b) => a + b.amount, 0);
    if (order.items[0].customizer) this.totalPrice = this.totalPrice * 1.18;

    const fullLink = `${environment.uri}/ecommerce/order-info/${order._id}`;
    this.fixedWhatsappLink2 = `https://wa.me/${
      this.merchantInfo.owner.phone
    }?text=Hola%20${this.merchantInfo.name.replace(
      /[^\w\s]/gi,
      ''
    )},%20%20acabo%20de%20hacer%20una%20orden.%20Mas%20info%20aquí%20${fullLink}`;

    this.products = order.items.map((item) => {
      const newItem = item.item;
      if (item.customizer) {
        newItem.customizerId = item.customizer._id;
        newItem.total = this.totalPrice;
        this.customizerValueService
          .getCustomizerValuePreview(item.customizer._id)
          .then((value) => {
            newItem.images[0] = value.preview;
          });
      }
      return newItem;
    });

    this.dialogProps = {
      orderFinished: true,
      products: this.products,
    };
    this.itemsAmount = this.products.length;

    if (order.items[0].saleflow.module?.paymentMethod?.paymentModule?._id) {
      await this.getExchangeData(
        order.items[0].saleflow.module?.paymentMethod.paymentModule._id
      );
    }
  };

  openCart = () => {
    this.dialogService.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: this.dialogProps,
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
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
      this.merchantInfo = await this.merchant.merchant(id);
      this.header.merchantInfo = this.merchantInfo;
    } catch (error) {
      console.log(error);
    }
  }

  async ngOnInit() {
    this.localStorageFlowRoute =
      this.header.flowRoute || (localStorage.getItem('flowRoute') ?? '');

    const orderId = this.route.snapshot.paramMap.get('orderId');
    const { orderStatus } = await this.order.getOrderStatus(orderId);

    if (orderId) {
      this.orderId = orderId;

      await this.getOrderData(orderId, orderStatus === 'draft');

      if (orderStatus === 'completed') {
        this.redirect();
      }

      if (orderStatus !== 'draft') {
        const {countryIso, nationalNumber} = this.authService.getPhoneInformation(this.orderData.user.phone);
        this.phoneNumber.setValue(nationalNumber);
        this.CountryISO = countryIso;
        this.name.setValue(this.orderData.user.name);
        this.phoneNumber.disable();
        this.name.disable();
        this.disableUserDataInputs = true;
      }
    } else if (!this.header.isDataComplete()) {
      this.header.resetIsComplete();
    }

    this.saleflowData = this.orderData.items[0].saleflow;

    if (this.saleflowData.module?.paymentMethod?.paymentModule?._id) {
      try {
        await this.getExchangeData(
          this.saleflowData.module.paymentMethod.paymentModule._id
        );
        this.step = 'PHONE_CHECK_AND_SHOW_BANKS';
      } catch (error) {
        console.log(error);
      }
    }

    this.headerText = this.saleflowData?.module?.paymentMethod?.paymentModule
      ?._id
      ? 'INFORMACIÓN DEL PAGO'
      : 'INFORMACIÓN';
    if (this.header.order?.itemPackage) {
      const packages = [this.header.order.itemPackage];
      const listItemPackage = (
        await this.saleflow.listItemPackage({
          findBy: {
            _id: {
              __in: ([] = packages),
            },
          },
        })
      ).listItemPackage;
      this.products = listItemPackage;
    }

    if (this.header.merchantInfo || localStorage.getItem('merchantInfo'))
      this.merchantInfo =
        this.header.merchantInfo ||
        JSON.parse(localStorage.getItem('merchantInfo'));
  }

  async getExchangeData(id: string) {
    const data = await this.wallet.exchangeData(id);
    this.banks = data.ExchangeData.bank;
    this.banksInfo = this.banks.map((bank) => ({
      value: `${bank.bankName}`,
      status: true,
      description: {
        typeAccount: bank.typeAccount,
        owner: bank.ownerAccount,
        account: bank.account,
        routingNumber: bank.routingNumber,
      },
    }));
    this.bankOptions = this.banks.map((bank) => ({
      value: `${bank.bankName} (${bank.account}, ${bank.ownerAccount})`,
      status: true,
      description: {
        typeAccount: bank.typeAccount,
        owner: bank.ownerAccount,
        account: bank.account,
        routingNumber: bank.routingNumber,
      },
    }));
  }

  async submitPhoneCheck(fullLink: string) {
    if (this.isAPreOrder) {
      const foundUser = await this.checkIfUserExists(
        this.orderData.user?.phone
      );
      this.userData = foundUser;
      if (!foundUser || !foundUser.name || String(foundUser.name) === 'null') {
        this.step = 'UPDATE_NAME_AND_SHOW_BANKS';
        this.buttonBlocked = false;
        return;
      }

      if (foundUser && foundUser.name) {
        lockUI();

        const { orderStatus } = await this.order.getOrderStatus(this.orderId);

        if (orderStatus === 'draft') {
          await this.order.authOrder(this.orderId, foundUser._id);
          this.header.flowRoute = '';
          this.localStorageFlowRoute = '';
          localStorage.removeItem('flowRoute');
          this.header.deleteSaleflowOrder(this.saleflowData._id);
          this.header.resetIsComplete();
          this.isAPreOrder = false;
        }

        await this.getOrderData(this.orderId, false);

        //disable 1st step inputs to avoid further changes to existing order
        this.phoneNumber.disable();

        if (this.banks?.length === 1) this.selectedBank = this.bankOptions[0];
        this.buttonBlocked = false;
        unlockUI();
      }
    }

    if (this.saleflowData.module?.paymentMethod?.paymentModule?._id) {
      this.pastStep = this.step;
      this.step = 'PAYMENT_INFO';
    } else {
      this.whatsappLink = `https://wa.me/${
        this.merchantInfo.owner.phone
      }?text=Hola%20${this.merchantInfo.name.replace(
        /[^\w\s]/gi,
        ''
      )},%20%20acabo%20de%20hacer%20una%20orden.%20Mas%20info%20aquí%20${fullLink}`;
      lockUI();
      window.location.href = this.whatsappLink;
    }

    this.fixedWhatsappLink = `https://wa.me/${
      this.merchantInfo.owner.phone
    }?text=Hola%20${this.merchantInfo.name.replace(
      /[^\w\s]/gi,
      ''
    )},%20%20acabo%20de%20hacer%20una%20orden.${
      String(this.userData.name) !== 'null' && this.userData.name
        ? '%20Mi%20nombre%20es:%20' + this.userData.name
        : ''
    }.%20Mas%20info%20aquí%20${fullLink}`;

    this.buttonBlocked = false;
  }

  async submitUpdateName(fullLink: string) {
    if (this.isAPreOrder) {
      const phoneNumber = this.phoneNumber.value.e164Number.split('+')[1];

      if (!this.name.disabled) {
        lockUI();

        let registeredNewUser: User;

        let foundUser = await this.authService.checkUser(phoneNumber);

        const { orderStatus } = await this.order.getOrderStatus(this.orderId);

        if (!foundUser) {
          registeredNewUser = await this.signUp();
          this.userData = registeredNewUser;

          if (registeredNewUser && orderStatus === 'draft') {
            this.header.flowRoute = '';
            this.localStorageFlowRoute = '';
            localStorage.removeItem('flowRoute');
            await this.order.authOrder(this.orderId, registeredNewUser._id);
            this.header.deleteSaleflowOrder(this.saleflowData._id);
            this.header.resetIsComplete();
            this.isAPreOrder = false;
          }

          await this.getOrderData(this.orderId, false);
          //disable 1st step inputs to avoid further changes to existing order
          this.name.disable();

          if (this.banks?.length === 1) this.selectedBank = this.bankOptions[0];

          this.buttonBlocked = false;
          unlockUI();

          if (!this.saleflowData?.module?.paymentMethod?.paymentModule?._id) {
            this.whatsappLink = `https://wa.me/${
              this.merchantInfo.owner.phone
            }?text=Hola%20${this.merchantInfo.name.replace(
              /[^\w\s]/gi,
              ''
            )},%20%20acabo%20de%20hacer%20una%20orden.%20Más%20info%20aquí%20${fullLink}`;
            lockUI();
            window.location.href = this.whatsappLink;
            return;
          }
        }

        if (foundUser && !foundUser.name) {
          this.userData.name = this.name.value;
          const { orderStatus } = await this.order.getOrderStatus(this.orderId);

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

          this.buttonBlocked = false;
          unlockUI();
        }
      } else {
        let registeredNewUser: User = null;

        let foundUser = await this.authService.checkUser(phoneNumber);

        const { orderStatus } = await this.order.getOrderStatus(this.orderId);

        if (orderStatus === 'in progress' && !foundUser) {
          registeredNewUser = await this.signUp();
          this.userData = registeredNewUser;

          if (registeredNewUser) {
            this.header.flowRoute = '';
            this.localStorageFlowRoute = '';
            localStorage.removeItem('flowRoute');
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

          this.buttonBlocked = false;
        }
      }
    }
    if (this.saleflowData.module?.paymentMethod?.paymentModule?._id) {
      this.pastStep = this.step;
      this.step = 'PAYMENT_INFO';
      this.buttonBlocked = false;
    }
  }

  async submit() {
    this.buttonBlocked = true;
    const fullLink = `${environment.uri}/ecommerce/order-info/${this.orderData._id}`;
    try {
      switch (this.step) {
        case 'PHONE_CHECK_AND_SHOW_BANKS':
          this.submitPhoneCheck(fullLink);
          break;
        case 'UPDATE_NAME_AND_SHOW_BANKS':
          this.submitUpdateName(fullLink);
          break;
        case 'PAYMENT_INFO':
          this.payOrder();
          this.buttonBlocked = false;
          break;
      }
    } catch (error) {
      console.log(error);
    }

    this.buttonBlocked = false;
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
    if (this.step === 'PAYMENT_INFO') {
      this.image = null;
      this.selectedBank = null;
      this.step = this.pastStep;
      this.isANewUser = false;
    }

    this.buttonBlocked = false;
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

  async checkIfUserExists(number?: string): Promise<User> {
    const phoneNumber = this.phoneNumber.value.e164Number.split('+')[1];
    const data = await this.authService.checkUser(number ?? phoneNumber);

    if (!data) return;
    return data;
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
      if (this.banks?.length === 1) {
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
    const fullLink = `${environment.uri}/ecommerce/order-info/${this.orderData._id}`;
    if (this.orderData.items[0].customizer) {
      this.whatsappLink = `https://wa.me/${
        this.merchantInfo.owner.phone
      }?text=Hola%20${this.merchantInfo.name.replace(
        /[^\w\s]/gi,
        ''
      )},%20le%20acabo%20de%20hacer%20un%20pago%20de%20$${
        Math.round((this.totalPrice + Number.EPSILON) * 100) / 100
      }.${
        String(this.userData.name) !== 'null' && this.userData.name
          ? '%20Mi%20nombre%20es:%20' + this.userData.name
          : ''
      }.%20Mas%20info%20aquí%20${fullLink}`;
    } else {
      this.whatsappLink = `https://wa.me/${
        this.merchantInfo.owner.phone
      }?text=Hola%20${this.merchantInfo.name.replace(
        /[^\w\s]/gi,
        ''
      )},%20le%20acabo%20de%20hacer%20un%20pago%20de%20$${this.totalPrice.toLocaleString(
        'es-MX'
      )}.%20Mi%20nombre%20es:%20${
        this.userData.name
      }.%20Mas%20info%20aquí%20${fullLink}`;
    }
    try {
      lockUI();

      const data = await this.order.payOrder(
        {
          image: this.image,
          platform: 'bank-transfer',
          transactionCode: this.paymentCode,
        },
        this.orderData.user._id,
        'bank-transfer',
        this.orderData._id
      );
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
          !this.phoneNumber.value ||
          this.phoneNumber.value.nationalNumber === '' ||
          this.phoneNumber.status === 'INVALID'
            ? 'ESCRIBE COMO TE CONTACTAMOS'
            : this.saleflowData?.module?.paymentMethod?.paymentModule?._id
            ? 'CONTINUAR LA ORDEN'
            : 'COMPLETA POR WHATSAPP');
      case 'UPDATE_NAME_AND_SHOW_BANKS':
        return (this.stepButtonText =
          this.name.status === 'INVALID'
            ? 'ESCRIBE QUIEN ERES'
            : this.saleflowData?.module?.paymentMethod?.paymentModule?._id
            ? 'CONTINUAR LA ORDEN'
            : 'COMPLETA POR WHATSAPP');
      case 'PAYMENT_INFO':
        return (this.stepButtonText =
          !this.image || !this.selectedBank
            ? 'ADICIONA LA INFO DE LA TRANSFERENCIA'
            : 'MANDA TU ORDEN A ' +
              this.merchantInfo.name.replace(/[^\w\s]/gi, '').toUpperCase());
    }
  }

  changeStickyButtonMode() {
    switch (this.step) {
      case 'PHONE_CHECK_AND_SHOW_BANKS':
        return (this.stepButtonMode =
          !this.phoneNumber.value ||
          this.phoneNumber.value.nationalNumber === '' ||
          this.phoneNumber.status === 'INVALID'
            ? 'disabled-fixed'
            : 'fixed');
      case 'UPDATE_NAME_AND_SHOW_BANKS':
        return (this.stepButtonMode =
          this.name.status === 'INVALID' ? 'disabled-fixed' : 'fixed');
      case 'PAYMENT_INFO':
        return !this.image || !this.selectedBank ? 'disabled-fixed' : 'fixed';
    }
  }

  redirect() {
    this.router.navigate([`ecommerce/order-info/${this.orderData._id}`]);
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
