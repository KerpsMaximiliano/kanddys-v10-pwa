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
import { Merchant } from 'src/app/core/models/merchant';
import { CommunitiesService } from 'src/app/core/services/communities.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
//import { OrderDetailComponent } from 'src/app/shared/dialogs/order-detail/order-detail.component';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { environment } from 'src/environments/environment';

interface BankDetails {
  status: boolean;
  value: string;
  description: string[];
}

@Component({
  selector: 'app-flow-completion',
  templateUrl: './flow-completion.component.html',
  styleUrls: ['./flow-completion.component.scss'],
  providers: [TitleCasePipe],
})
export class FlowCompletionComponent implements OnInit {
  @Input() type1: boolean = true;
  @Input() type2: boolean = true;
  @Input() addPhoto: boolean = true;
  @Input() simpleQuestion: boolean = true;
  @Input() inputQuestion: boolean = true;
  @Input() paymentQuestion: boolean = true;
  @Input() bankQuestion: boolean = true;
  paymentOptions = [
    {
      value: 'Por transferencia bancaria',
      status: true,
    },
    {
      value: 'Pagaré después que me confirmen por WhatsApp (no disponible)',
      status: false,
    },
    {
      value: 'Ya pagué (no disponible)',
      status: false,
    },
  ];
  communityOptions = [
    {
      value: 'Tengo mas de 300 seguidores',
      status: true,
    },
    {
      value: 'Trabajo en una estacion de radio/tv',
      status: true,
    },
    {
      value: 'Soy creador de contenido',
      status: true,
    },
    {
      value: 'Me gusta crear Trivias',
      status: true,
    },
    {
      value: 'Trabajo en una organización sin fines de lucro',
      status: true,
    },
    {
      value: 'Soy parte de la asociación de padres de una escuela',
      status: true,
    },
    {
      value: 'Soy un usual en TikTok',
      status: true,
    },
    {
      value: 'Soy un usual en Snapchat',
      status: true,
    },
    {
      value: 'Ayudo a recaudar fondos',
      status: true,
    },
  ];
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
  windowReference: any;
  step: number = 0;
  relativeStep: number = 1;
  actual: string = '';
  stepsLeft: number;
  firstData: any = '';
  inputData: string = '';
  name: string = '';
  lastName: string = '';
  password: string = '';
  code: string = '';
  showLoginPassword: boolean;
  selectedBank: BankDetails;
  selectedPayment: number;
  selectedCommunitiesOptions: number[] = [];
  paymentCode: string = '';
  image: File;
  merchantInfo: Merchant;
  imageField: string | ArrayBuffer;
  isLoading: boolean;
  orderId: string;
  isLogged: boolean;
  userData: User;
  orderData: any;
  error: string = '';
  orderInfo: any;
  fakeData: ItemOrder;
  reservationOrProduct: string = '';
  flow: 'flow-completion' | 'create-community' | 'create-merchant';
  headerText: string;
  newProviderName: string = '';
  ammount: number;
  incorrectPasswordAttempt: boolean = false;
  whatsappLink: string = '';
  env: string = environment.assetsUrl;

  constructor(
    private authService: AuthService,
    public order: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private wallet: WalletService,
    private header: HeaderService,
    private customizerValueService: CustomizerValueService,
    private postsService: PostsService,
    private communitiesService: CommunitiesService,
    private readonly app: AppService,
    private merchant: MerchantsService,
    protected _DomSanitizer: DomSanitizer,
    private titlecasePipe: TitleCasePipe,
    private dialog: DialogService,
    private saleflow: SaleFlowService,
    private location: Location,
  ) {}

  getOrderData(id: string) {
    return this.order.order(id).then((data) => {
      console.log(data);
      if (
        data.order.orderStatus === 'cancelled' ||
        data.order.orderStatus === 'to confirm' ||
        data.order.orderStatus === 'completed'
      )
        this.router.navigate([`ecommerce/order-info/${id}`]);
      console.log('Entrando en .then');
      if (data.order.items[0].reservation?._id !== null) {
        this.reservationOrProduct = 'reservacion';
      } else {
        this.reservationOrProduct = 'producto';
      }
      console.log(this.reservationOrProduct);
      if (data) {
        console.log(data);
        console.log('SI HAY DATA');
        this.header.saleflow = data.order.items[0].saleflow;
        this.fakeData = data.order;
        if (!this.merchantInfo) {
          console.log('ALSKDJLSKDLAKSJDHSLKD SHKLDHDLKAS HLSKJD HLSAKJd');
          console.log(this.fakeData.merchants[0]._id);
          this.getMerchant(this.fakeData.merchants[0]._id).then(() => {
            console.log('?????????????????????????????????');
            this.merchantInfo = this.header.merchantInfo;
            console.log(this.merchantInfo);
            console.log(this.header.merchantInfo);
            console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAA');
          });
        }
        const totalPrice = this.fakeData.subtotals.reduce((a, b) => a + b.amount, 0);
        this.orderData = {
          id: this.fakeData._id,
          userId: this.fakeData.user._id,
          user: this.fakeData.user,
          itemAmount: this.fakeData.items.reduce((a,b) => a + b.amount, 0),
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
          }
          return newItem;
        });

        console.log(this.orderData);
        if (!this.orderData) {
          this.router.navigate(['/error-screen/?type=item']);
        }
        this.getExchangeData(
          data.order.items[0].saleflow.module.paymentMethod.paymentModule._id
        );
      } else {
        console.log(data);
        console.log('NO HAY DATA');
        this.router.navigate(['/ecommerce/error-screen']);
      }
    }).catch((error) => console.log(error));
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
    console.log(this.header.order);

    if (this.router.url.includes('flow-completion')) {
      this.flow = 'flow-completion';
      this.headerText = 'INFORMACIÓN NECESARIA';
      let products: string[] = [];
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
        console.log(listPackages);
        this.products = listPackages;
      } else if (this.header.order?.products) {
        for (let i = 0; i < this.header.order.products.length; i++) {
          products.push(this.header.order.products[i].item);
        }
        console.log(this.products);
        this.findItemData(products);
      }
      if (this.header.merchantInfo)
        this.merchantInfo = this.header.merchantInfo;
      this.route.params.subscribe((params) => {
        if (params.id) {
          this.orderId = params.id;
          this.getOrderData(params.id);
        } else if (!this.header.isDataComplete()) {
          console.log('enttrando');

          this.header.resetIsComplete();
          this.router.navigate([`ecommerce/landing-vouchers`]);
        }
      });
    } else {
      this.headerText = 'CREANDO UN CLUB PARA MONETIZAR';
    }
    if (this.router.url.includes('create-community')) {
      this.flow = 'create-community';
    }
    if (this.router.url.includes('create-merchant')) {
      this.flow = 'create-merchant';
    }
    this.authService.me().then((data) => {
      if (data) {
        this.userData = data;
        this.isLogged = true;
        this.inputData = this.userData.phone;
        this.step = 4;
        
        if (this.flow === 'flow-completion') this.stepsLeft = 4;
      } else {
        this.step = 1;
        if (this.flow === 'flow-completion') this.stepsLeft = 6;
      }
    });

    console.log(this.flow);
    console.log(this.products);
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
        console.log(this.products);
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
    console.log(data.ExchangeData.bank);
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
      console.log(payments);
      console.log(values);
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

      if (this.bankOptions.length < 2) this.stepsLeft--;
    });
  }

  keyPressNumbers(event) {
    var charCode = event.which ? event.which : event.keyCode;

    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  submit() {
    switch (this.step) {
      case 1:
        // this.totalQuestions = 1;
        this.checkUser();
        break;
      case 2:
        // this.totalQuestions = 3;
        this.sendCode();
        break;
      case 3:
        // this.totalQuestions = 2;
        this.updateUser();
        break;
      case 4:
        this.signIn();
        break;
      case 5:
        if (this.flow !== 'flow-completion') {
          // this.totalQuestions = 1;
          this.step = 8;
        } else {
          // this.totalQuestions = 2;

          if (this.banks.length > 1) this.step = 6;
          else {
            this.selectedBank = this.bankOptions[0];
            this.headerText = 'INFORMACIÓN DEL PAGO';
            this.step = 7;
          }
        }
        this.relativeStep++;
        break;
      case 6:
        this.step = 7;
        this.relativeStep++;
        break;
      case 7:
        console.log(this.whatsappLink);
        this.payOrder();
        break;
      case 8:
        this.createNewProvider();
        break;
      case 9:
        this.gotToUpdatePassword();
        break;      
      case 10:
        this.updatePassword();
        break;     
    }
  }

  gotToUpdatePassword(){
    console.log(this.inputData, this.code);
    this.authService.verify(this.code, localStorage.getItem('id')).then((data: any) => {
      console.log(data);
      if (data != undefined) {
        this.step = 10;
      }
    })
  }

  updatePassword(){
    console.log(this.inputData, this.code, this.password);
    this.authService.updateMe({ password: this.password }).then(data => {
      console.log(data);
      console.log(localStorage.getItem('session-token'));
      this.inputData = '';
      this.password = '';
      this.step = 1;
    });
  }

  selectOption(index: number) {
    console.log(index);
    switch (this.step) {
      case 4:
        this.userSelect(index);
        break;
      case 5: {
        this.flow !== 'flow-completion'
          ? this.multipleSelect(index)
          : (this.selectedPayment = index);

        if (this.selectedPayment === 0) {
          if(this.bankOptions.length === 1) this.selectedBank = this.bankOptions[0];
          this.headerText = 'INFORMACIÓN DEL PAGO';
          this.step = this.bankOptions.length > 1 ? 6 : 7;
          this.relativeStep++;
        }
        break;
      }
      case 6: {
        this.selectedBank = this.bankOptions[index];
        break;
      }
    }
  }

  multipleSelect(index: number) {
    if (this.step == 5) {
      if (this.selectedCommunitiesOptions.includes(index)) {
        this.selectedCommunitiesOptions.splice(
          this.selectedCommunitiesOptions.indexOf(index),
          1
        );
      } else this.selectedCommunitiesOptions.push(index);
    }
  }

  createOrSkipOrder() {
    if (this.orderId) {
      this.step = 5;
      this.relativeStep++;
    } else {
      lockUI(
        this.createOrder().then((data) => {
          this.location.replaceState(`ecommerce/flow-completion/${data}`)
          this.relativeStep++;
          this.stepsLeft = 4;
          return this.getOrderData(this.header.orderId)
            .then(() => {
              this.step = 5;
            })
        })
      );
    }
  }

  goBack() {
    if (
      (this.step === 1 || this.step === 3 || this.step === 4) &&
      !this.orderData
    ) {
      this.router.navigate([`/ecommerce/${this.header.flowRoute}`]);
    }
    this.code = '';
    this.paymentCode = '';
    this.imageField = undefined;
    if (this.step === 5) this.selectedPayment = undefined;
    if (this.step === 6) this.selectedBank = undefined;
    if (
      (this.step > 4 &&
        this.step < 8 &&
        !(this.step === 7 && this.banks.length === 1)) ||
      this.step === 2
    )
      this.step--;
    if (this.step === 7 && this.banks.length === 1) this.step = 5;

    if (this.step === 8) this.step = 5;

    if (this.step === 9 || this.step === 10){
      if (this.isLogged) {
        this.step = 4;
      }else{
        this.step = 1;
      }
      return;
    } 

    this.relativeStep--;
  }

  back() {
    this.router.navigate([`/ecommerce/${this.header.flowRoute}`]);
  }

  // Case 1
  async checkUser() {
    try {
      const input = '1' + this.inputData;
      console.log(input);
      const data = await this.authService.checkUser(input, 'whatsapp');
      if (data) {
        this.userData = data;
        console.log(data);
        localStorage.setItem('id', data._id);
        if (data.validatedAt) {
          console.log('user is validated');

          if (data.name) {
            console.log('and has name');
            this.step = 4;
            if (this.orderId && (input !== this.orderData?.user.phone)) {
              this.router.navigate(['ecommerce/error-screen']);
            }
          } else {
            const data = await this.authService.generateOTP(input);
            if (data) {
              this.step = 2;
              this.relativeStep++;
              console.log('code sent');
            }
            // console.log('but doesnt have name and password');
            // this.step = 3;
          }
        } else {
          console.log('user is not validated, sending code...');
          const data = await this.authService.generateOTP('1' + this.inputData);
          if (data) {
            this.step = 2;
            this.relativeStep++;
            console.log('code sent');
          }
        }
      } else {
        console.log('user doesnt exist, creating account');
        this.signUp();
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Case 1
  async signUp() {
    try {
      const data = await this.authService.signup(
        { phone: '1' + this.inputData },
        'whatsapp'
      );
      console.log(data);
      if (data) {
        localStorage.setItem('id', data._id);
        this.step = 2;
        this.relativeStep++;
      } else {
        console.log('error');
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Case 2
  async sendCode() {
    try {
      console.log(this.code);
      console.log(localStorage.getItem('id'));
      const data = await this.authService.verify(
        this.code,
        localStorage.getItem('id')
      );
      console.log(data);

      if (data != undefined) {
        this.step = 3;
        this.relativeStep++;
      } else {
        this.code = '';
      }
    } catch (error) {
      this.code = '';
      console.log(error);
    }
  }

  // Case 3
  async updateUser() {
    try {
      const input = {
        name: this.name,
        password: this.password,
      };
      const data = await this.authService.updateMe(input);
      this.userData = data;
      this.orderData.user = this.userData;
      this.orderData.userId = this.orderData.user._id;
      this.isLogged = true;
      this.createOrSkipOrder();
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  // Case 4
  async userSelect(index: number) {
    if (index === 0) {
      if (this.isLogged) {
        if (this.flow === 'flow-completion') this.createOrSkipOrder();
        if (this.flow === 'create-community') this.step = 5;
        if (this.flow === 'create-merchant') this.step = 5;
      } else {
        this.showLoginPassword = true;
        this.stepsLeft = this.banks.length > 1 ? 4 : 3;
      }
    } else {
      this.stepsLeft = this.banks.length > 1 ? 6 : 5;
      this.step = 1;
      this.userData = undefined;
      this.isLogged = false;
      this.inputData = '';
      this.password = '';
      this.incorrectPasswordAttempt = false;
      this.authService.signoutThree();
      this.showLoginPassword = false;
    }
  }

  // Case 4
  async signIn() {
    try {
      const data = await this.authService.signin(
        '1' + this.inputData,
        this.password,
        false
      );
      if (data) {
        this.userData = data.user;
        console.log('user has signed in');
        this.isLogged = true;
        this.password = '';
        this.showLoginPassword = false;
        this.incorrectPasswordAttempt = false;
        if (this.flow === 'flow-completion') this.createOrSkipOrder();
        if (this.flow === 'create-community') this.step = 5;
        if (this.flow === 'create-merchant') this.step = 5;
      } else {
        this.incorrectPasswordAttempt = true;
        this.password = '';
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Case 3, 4
  createOrder() {
    this.header.order = this.header.getOrder(this.header.saleflow._id);
    this.header.order.products.forEach((product) => {
      delete product.isScenario;
      delete product.limitScenario;
      delete product.name;
    });
    return new Promise(async (resolve, reject) => {
      if (this.header.customizer) {
        const customizerId =
          await this.customizerValueService.createCustomizerValue(
            this.header.customizer
          );
        this.header.order.products[0].customizer = customizerId;
        this.header.customizer = null;
        this.header.customizerData = null;
      }
      if (this.header.saleflow.module.post) {
        let postinput = this.header.post ?? this.header.getPost(this.header.saleflow?._id ?? this.header.getSaleflow()._id)?.data;
        console.log(postinput);
        
        this.postsService
          .creationPost(postinput)
          .then((data) => {
            if (data) {
              this.header.emptyPost(this.header.saleflow._id);
              console.log(data);
              if(this.header.saleflow.canBuyMultipleItems) this.header.order.products.forEach((product) => {
                product.deliveryLocation = this.header.order.products[0].deliveryLocation;
                product.post = data.createPost._id;
              });
              console.log(this.header.order);
              this.order
                .createOrder(this.header.order)
                .then((data) => {
                  console.log(data);
                  console.log(data.createOrder._id);
                  this.header.deleteSaleflowOrder(this.header.saleflow._id);
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
            }
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
            console.log(data);
            this.header.deleteSaleflowOrder(this.header.saleflow._id);
            this.header.resetIsComplete();
            this.isLoading = false;
            this.header.orderId = data.createOrder._id;
            this.orderId = data.createOrder._id;
            // this.app.events.emit({ type: 'order-done', data: true });
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
    console.log(this.image);
  }

  // Case 7
  async payOrder() {
    const totalPrice = this.fakeData.subtotals.reduce((a, b) => a + b.amount, 0);
    const fullLink =
      'https://kanddys.com/ecommerce/order-info/' + this.orderId;
    if (this.fakeData.items[0].customizer)
      this.whatsappLink = `https://wa.me/${
        this.merchantInfo.owner.phone
      }?text=Hola%20${
        this.merchantInfo.name
      },%20le%20acabo%20de%20hacer%20un%20pago%20de%20$${
        this.ammount ??
        Math.round(
          (totalPrice * 1.18 + Number.EPSILON) *
            100
        ) / 100
      }.%20Mi%20nombre%20es:%20${
        this.userData.name
      }.%20Mas%20info%20aquí%20${fullLink}`;
    else
      this.whatsappLink = `https://wa.me/${this.merchantInfo.owner.phone}?text=Hola%20${this.merchantInfo.name},%20le%20acabo%20de%20hacer%20un%20pago%20de%20$${this.ammount ?? totalPrice}.%20Mi%20nombre%20es:%20${this.userData.name}.%20Mas%20info%20aquí%20${fullLink}`;
    try {
      lockUI();

      // alert(this.orderData.userId + " === " + this.orderData.user._id + " === " + this.orderData.user.name);

      const data = await this.order.payOrder(
        {
          image: this.image,
          platform: 'bank-transfer',
          transactionCode: this.paymentCode
        },
        this.orderData.userId,
        'bank-transfer',
        this.orderData.id
      );
      console.log(data);
      this.orderFinished();
    } catch (error) {
      console.log(error);
      this.orderFinished();
    }
  }

  /*openOrderDetail() {
    this.dialog.open(OrderDetailComponent, {
      //type:'window',
      type: 'flat-action-sheet',
      flags: ['no-header'],
      customClass: 'app-dialog',
      props: {},
    });
  }*/

  redirect() {
    this.router.navigate([`ecommerce/order-info/${this.orderId}`]);
  }

  orderFinished() {
    console.log(this.fakeData);
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
      console.log('Bien');
    } else {
      event.preventDefault();
    }
  }

  // Case 8
  async createNewProvider() {
    lockUI();
    try {
      if (this.flow === 'create-community') {
        const data = await this.communitiesService.create({
          owner: this.userData._id,
          name: this.newProviderName,
          creator: this.userData._id,
        });
        unlockUI();
        console.log(data);
      }
      if (this.flow === 'create-merchant') {
        const data = await this.merchant.createMerchant({
          owner: this.userData._id,
          name: this.newProviderName,
        });
        unlockUI();
        console.log(data);
      }
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  showItems() {
    let showProducts = []
    if (this.orderData.isPackage) {
      console.log('si');
      console.log(this.fakeData);
      showProducts.push(this.fakeData.itemPackage);
    }else{
      console.log('no');
      console.log(this.fakeData);
      showProducts = this.products;
    }
    this.dialog.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: { 
        orderFinished: this.orderData?.id ? true : false, 
        products: showProducts,
        headerButton: 'Ver mas productos',
        headerCallback: () => this.router.navigate([`ecommerce/megaphone-v3/${this.header.saleflow._id}`])
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  generateOTP(){
    console.log(this.inputData);
    let input;
    if (this.isLogged) {
      input = this.inputData
    } else {
      input = '1' + this.inputData;
    }
    console.log(input);
    this.authService.generateOTP(input).then(data =>{
      console.log(data);
      this.step = 9;
    })
  }
}
