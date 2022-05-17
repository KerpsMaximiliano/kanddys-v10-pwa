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
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ItemOrder } from 'src/app/core/models/order';
import { FormControl, Validators } from '@angular/forms';
import { Merchant } from 'src/app/core/models/merchant';
//import { OrderDetailComponent } from 'src/app/shared/dialogs/order-detail/order-detail.component';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { environment } from 'src/environments/environment';

interface BankDetails {
  status: boolean;
  value: string;
  description: string[];
}

@Component({
  selector: 'payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
  providers: [TitleCasePipe],
})
export class PaymentsComponent implements OnInit {
  @Input() bankQuestion: boolean = true;
  bankOptions: BankDetails[] = [];
  banks: Bank[] = [];
  step: string = 'UPDATE_NAME';
  inputData: string = '';
  name: string = '';
  showLoginPassword: boolean;
  selectedBank: BankDetails = null;
  selectedPayment: number;
  paymentCode: string = '';
  image: File;
  merchantInfo: Merchant;
  imageField: string | ArrayBuffer;
  isLoading: boolean;
  orderId: string;
  isLogged: boolean;
  userData: User;
  orderData: any;
  tmpOrderData: any;
  fakeData: ItemOrder;
  reservationOrProduct: string = '';
  headerText: string;
  dialogProps: Record<string, any>;
  comesFromMagicLink: boolean = false;
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
    private readonly app: AppService,
    private merchant: MerchantsService,
    protected _DomSanitizer: DomSanitizer,
    private titlecasePipe: TitleCasePipe,
    private saleflow: SaleFlowService,
    private location: Location
  ) {}

  async getOrderData(id: string) {
    return this.order
      .order(id)
      .then(async (data) => {
        if (
          data.order.orderStatus === 'cancelled' ||
          data.order.orderStatus === 'to confirm' ||
          data.order.orderStatus === 'completed'
        )
          this.router.navigate([`ecommerce/order-info/${id}`]);
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
            userId: this.fakeData.user._id,
            user: this.fakeData.user,
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

          if (!this.orderData) {
            this.router.navigate(['/error-screen/?type=item']);
          }
          await this.getExchangeData(
            data.order.items[0].saleflow.module.paymentMethod.paymentModule._id
          );
        } else {
          this.router.navigate(['/ecommerce/error-screen']);
        }
      })
      .catch((error) => console.log(error));
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
    this.route.queryParams.subscribe(async (params) => {
      const saleflow =
        this.header.saleflow ||
        JSON.parse(localStorage.getItem('saleflow-data'));
      this.saleflowData = saleflow;

      const { token } = params;
      this.comesFromMagicLink = true;

      this.headerText = 'INFORMACIÓN DEL PAGO';
      let products: string[] = [];
      let packages: string[] = [];
      this.tmpOrderData = this.header.order;
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
      } else if (this.header.order?.products) {
        for (let i = 0; i < this.header.order.products.length; i++) {
          products.push(this.header.order.products[i].item);
        }
        this.findItemData(products);
      }

      if (this.header.merchantInfo || localStorage.getItem('merchantInfo'))
        this.merchantInfo =
          this.header.merchantInfo ||
          JSON.parse(localStorage.getItem('merchantInfo'));
      this.route.params.subscribe(async (params) => {
        if (params.id) {
          this.orderId = params.id;
          await this.getOrderData(params.id);
        } else if (!this.header.isDataComplete()) {
          console.log('enttrando');

          this.header.resetIsComplete();
          // this.router.navigate([`ecommerce/landing-vouchers`]);
        }

        if (!token) {
          this.authService.me().then((data) => {
            if (data) {
              this.userData = data;
              this.isLogged = true;
              this.inputData = this.userData.phone;
              if (this.banks.length === 1 && this.bankOptions.length > 0) {
                this.selectedBank = this.bankOptions[0];
              }

              this.step = 'PAYMENT_INFO';
            } else {
              this.router.navigate([`ecommerce/auth-classic`]);
            }
          });
        }
      });
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
    await Promise.all(wallets).then((values) => {
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
      if (this.banks.length === 1 && this.bankOptions.length > 0) {
        this.selectedBank = this.bankOptions[0];
      }
    });
  }

  submit() {
    switch (this.step) {
      case 'UPDATE_NAME':
        // this.totalQuestions = 2;
        this.updateUser();
        break;
      case 'PAYMENT_INFO':
        this.payOrder();
        break;
    }
  }

  selectOption(index: number) {
    this.selectedBank = this.bankOptions[index];
  }

  async sendCodeToEmailOrWhatsapp() {
    const validEmail = new RegExp(
      /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/gim
    );
    const validPhone = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;

    if (validEmail.test(this.inputData) || validPhone.test(this.inputData)) {
      const executedSuccessfully = await this.authService.generateMagicLink(
        '1' + this.inputData
      );

      if (executedSuccessfully) {
        console.log('Email o whatsapp enviado correctamente');
      }
    }
  }

  createOrSkipOrder() {
    if (this.banks.length === 1) {
      this.selectedBank = this.bankOptions[0];
      this.step = 'PAYMENT_INFO';
    }

    if (this.orderId) {
      this.step = 'PAYMENT_INFO';
    } else {
      lockUI(
        this.createOrder().then((data) => {
          this.location.replaceState(`ecommerce/payments/${data}`);
          return this.getOrderData(this.header.orderId).then(() => {
            this.step = 'PAYMENT_INFO';
          });
        })
      );
    }
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
    if (this.step === 'UPDATE_NAME' && !this.orderData) {
      this.router.navigate([`/ecommerce/${this.header.flowRoute}`]);
    }

    if (this.step === 'PAYMENT_INFO') {
      if (!this.comesFromMagicLink) {
        this.step = 'UPDATE_NAME';
        this.isANewUser = false;
      } else {
        this.header.order = this.tmpOrderData;
        this.header.orderId = null;
        this.router.navigate([`/ecommerce/auth-classic`]);
      }
      //added something to fix bad push
    }
  }

  // Case 3
  async updateUser() {
    try {
      const input = {
        name: this.name,
      };

      if (this.isANewUser) {
        const data = await this.authService.updateMe(input);
        this.userData = data;
      }

      this.isLogged = true;
      this.createOrSkipOrder();
    } catch (error) {
      console.log(error);
    }
  }

  // Case 4
  async userSelect(index: number) {
    if (index === 0) {
      if (this.isLogged) {
        if (
          this.orderId &&
          this.userData.phone !== this.orderData?.user.phone
        ) {
          this.router.navigate(['ecommerce/error-screen']);
          return;
        }
        this.createOrSkipOrder();
      } else {
        this.showLoginPassword = true;
      }
    } else {
      this.userData = undefined;
      this.isLogged = false;
      this.inputData = '';
      this.authService.signoutThree();
      this.showLoginPassword = false;
    }
  }

  // Case 3, 4
  createOrder() {
    const saleflow =
      this.header.saleflow || JSON.parse(localStorage.getItem('saleflow-data'));
    this.saleflowData = saleflow;

    this.header.order = this.header.getOrder(saleflow._id);
    this.header.order.products.forEach((product) => {
      delete product.isScenario;
      delete product.limitScenario;
      delete product.name;
    });
    return new Promise(async (resolve, reject) => {
      let customizer = this.header.customizer;

      if (!this.header.customizer) {
        const saleflowData = JSON.parse(localStorage.getItem('saleflow-data'));
        const customizerPreview = JSON.parse(
          localStorage.getItem('customizerFile')
        );

        let saleflow = JSON.parse(localStorage.getItem(saleflowData._id));

        if ('customizer' in saleflow) {
          customizer = saleflow.customizer;

          const res: Response = await fetch(customizerPreview.base64);
          const blob: Blob = await res.blob();

          customizer.preview = new File([blob], customizerPreview.fileName, {
            type: customizerPreview.type,
          });
        }
      }

      if (customizer) {
        const customizerId =
          await this.customizerValueService.createCustomizerValue(customizer);

        console.log(customizerId, 'CID');
        this.header.order.products[0].customizer = customizerId;
        this.header.customizer = null;
        this.header.customizerData = null;
      }
      if (saleflow.module.post) {
        if (!this.comesFromMagicLink) this.header.emptyPost(saleflow._id);
        if (saleflow.canBuyMultipleItems)
          this.header.order.products.forEach((product) => {
            const createdPostId = localStorage.getItem('createdPostId');

            product.deliveryLocation =
              this.header.order.products[0].deliveryLocation;
            product.post = createdPostId;
          });
        this.order
          .createOrder(this.header.order)
          .then((data) => {
            this.header.deleteSaleflowOrder(saleflow._id);
            this.header.resetIsComplete();
            this.isLoading = false;
            this.header.orderId = data.createOrder._id;
            this.orderId = data.createOrder._id;
            this.header.currentMessageOption = undefined;
            this.header.post = undefined;
            this.header.locationData = undefined;
            // this.app.events.emit({ type: 'order-done', data: true });
            resolve(data.createOrder._id);
          })
          .catch((err) => {
            console.log(err);
            reject('Error creando la orden');
            this.isLoading = false;
          });
      } else {
        await this.order
          .createOrder(this.header.order)
          .then(async (data) => {
            this.header.deleteSaleflowOrder(saleflow._id);
            this.header.resetIsComplete();
            this.isLoading = false;
            this.header.orderId = data.createOrder._id;
            this.orderId = data.createOrder._id;
            resolve(data.createOrder._id);
          })
          .catch((err) => {
            console.log(err);
            reject('Error creando la orden');
            this.isLoading = false;
          });
      }
    }).catch((err) => {
      console.log(err);
      this.isLoading = false;
    });
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
    const fullLink = `${environment.uri}/ecommerce/order-info/${this.orderId}`;
    if (this.fakeData.items[0].customizer)
      this.whatsappLink = `https://wa.me/${
        this.merchantInfo.owner.phone
      }?text=Hola%20${
        this.merchantInfo.name
      },%20le%20acabo%20de%20hacer%20un%20pago%20de%20$${
        Math.round((totalPrice * 1.18 + Number.EPSILON) * 100) / 100
      }.%20Mi%20nombre%20es:%20${
        this.userData.name
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
    } catch (error) {
      console.log(error);
      this.orderFinished();
    }
  }

  redirect() {
    this.router.navigate([`ecommerce/order-info/${this.orderId}`]);
  }

  orderFinished() {
    unlockUI();
    this.redirect();
  }
}
