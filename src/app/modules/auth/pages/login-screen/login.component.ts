import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { ToastrService } from 'ngx-toastr';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item, ItemPackage } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { UsersService } from 'src/app/core/services/users.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
import { environment } from 'src/environments/environment';
import { formatID } from 'src/app/core/helpers/strings.helpers';

type AuthTypes =
  | 'phone'
  | 'password'
  | 'order'
  | 'address'
  | 'anonymous'
  | 'payment';

interface ValidateData {
  name: string;
  lastName: string;
  password: string;
  email?: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  mode: 'login' | 'signUp';
  saleflow: SaleFlow;
  auth: AuthTypes;
  merchantNumber: string = '(000) 000-0000';
  merchant: Merchant;
  loggin: boolean;
  signUp: boolean;
  nope: boolean;
  orderId: string;
  itemId: string;
  doesItemHasParams: boolean;
  action: string;
  paymentAmount: number;
  orderStatus: string;
  OTP: boolean = false;
  image: File;
  authCode: boolean = false;
  toValidate: boolean = false;
  sneaky: string;
  userID: string;
  fullLink: string;
  messageLink: string;
  items: Item[] | ItemPackage[] = [];
  itemCartAmount: number;
  validateData: ValidateData;
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(10),
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.pattern(/[\S]/),
  ]);
  firstName = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.pattern(/^[a-z\s\u00E0-\u00FC\u00f1\u00d1]*$/i),
    Validators.pattern(/[\S]/),
  ]);
  lastName = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.pattern(/^[a-z\s\u00E0-\u00FC\u00f1\u00d1]*$/i),
    Validators.pattern(/[\S]/),
  ]);
  email = new FormControl('', [Validators.minLength(12)]);
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private headerService: HeaderService,
    private orderService: OrderService,
    private merchantService: MerchantsService,
    private itemsService: ItemsService,
    private saleflowsService: SaleFlowService,
    private location: Location,
    private usersService: UsersService,
    private dialog: DialogService // private saleflowService: SaleFlowService, // private item: ItemsService
  ) {
    this.image = this.router.getCurrentNavigation().extras.state?.image;
  }

  async ngOnInit(): Promise<void> {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    this.itemId = this.route.snapshot.queryParamMap.get('itemId');
    this.action = this.route.snapshot.queryParamMap.get('action');
    this.doesItemHasParams = Boolean(
      this.route.snapshot.queryParamMap.get('hasParams')
    );

    if (this.action === 'precreateitem' && this.doesItemHasParams) {
      const itemParams = this.itemsService.temporalItemParams;

      if (typeof itemParams === 'undefined' || !itemParams) {
        const flowRoute = localStorage.getItem('flowRoute');
        if (flowRoute && flowRoute.length > 1) {
          const [baseRoute, paramsString] = flowRoute.split('?');
          const paramsArray = paramsString.split('&');
          const queryParams = {};

          paramsArray.forEach((param) => {
            const [key, value] = param.split('=');

            queryParams[key] = value;
          });

          localStorage.removeItem('flowRoute');
          this.router.navigate([baseRoute], {
            queryParams,
          });
        }
      }
    }

    const phone = this.route.snapshot.queryParamMap.get('phone');
    const SaleFlow = this.route.snapshot.queryParamMap.get('saleflow');
    this.auth = this.route.snapshot.queryParamMap.get('auth') as AuthTypes;

    if (this.orderId) {
      this.orderStatus = (
        await this.orderService.getOrderStatus(this.orderId)
      )?.orderStatus;
      const order = await this.getOrderData(
        this.orderId,
        this.orderStatus === 'draft'
      );
      this.headerService.saleflow = await this.headerService.fetchSaleflow(
        order.items?.[0].saleflow._id
      );
      this.merchant = await this.merchantService.merchant(
        order.merchants?.[0]?._id
      );
      this.fullLink = `${environment.uri}/ecommerce/order-info/${order._id}`;
      this.paymentAmount = order.subtotals.reduce((a, b) => a + b.amount, 0);
      order.items[0].customizer
        ? (this.paymentAmount = this.paymentAmount * 1.18)
        : null;
    }

    if (this.auth === 'password') {
      lockUI();

      if (phone) {
        const exists = await this.authService.checkUser(phone);

        if (exists) {
          const { countryIso, nationalNumber } =
            this.authService.getPhoneInformation(phone);
          this.phoneNumber.setValue(nationalNumber);
          this.CountryISO = countryIso;
          this.loggin = true;
          this.merchantNumber = phone;
        } else {
          unlockUI();
          this.toastr.info('Número no registrado o inválido', null, {
            timeOut: 1500,
          });
        }

        unlockUI();
      } else {
        this.loggin = false;
        unlockUI();
      }
    } else if (this.auth === 'order') {
      lockUI();

      this.headerService.flowId = SaleFlow;
      this.headerService.orderId = null;
      this.saleflow = await this.headerService.fetchSaleflow(SaleFlow);
      let productData: Item[] = this.headerService.getItems(this.saleflow._id);
      this.itemCartAmount = productData?.length;
      this.items = productData;

      if (phone) {
        const exists = await this.authService.checkUser(phone);

        if (exists) {
          const { countryIso, nationalNumber } =
            this.authService.getPhoneInformation(phone);
          this.phoneNumber.setValue(nationalNumber);
          this.CountryISO = countryIso;
          this.loggin = true;
          this.merchantNumber = phone;
        } else {
          unlockUI();
          this.toastr.error('Número no registrado o inválido ', null, {
            timeOut: 1500,
          });
          return;
        }

        unlockUI();
      } else {
        this.loggin = false;
        unlockUI();
      }
    } else if (this.auth === 'address') {
      const address = this.headerService.getLocation(SaleFlow);
      if (!address) {
        this.router.navigate([`ecommerce/${SaleFlow}/new-address`], {
          replaceUrl: true,
        });
      }
      unlockUI();
    } else if (this.auth === 'anonymous') {
      unlockUI();
    } else if (this.auth === 'payment') {
      if (!this.image) {
        this.router.navigate([`ecommerce/payments/${this.orderId}`], {
          replaceUrl: true,
        });
      }
    } else {
      this.auth = 'phone';
      this.loggin = false;
      unlockUI();
    }
  }

  toggleLog() {
    this.loggin = !this.loggin;
    this.OTP = false;
    this.authCode = false;
    this.phoneNumber.reset();
    this.password.reset();
    this.merchantNumber = '';
  }

  logToggle = () => {
    this.toSignUp();
  };

  toSignUp() {
    this.signUp = !this.signUp;
    this.OTP = false;
    this.authCode = false;
    this.phoneNumber.reset();
    this.password.reset();
    this.firstName.reset();
    this.lastName.reset();
    this.email.reset();
  }

  async toPassword() {
    this.password.reset();
    this.signUp = false;
    this.OTP = false;
    this.loggin = true;
    this.authCode = true;
    const toVerify = await this.authService.checkUser(this.merchantNumber);
    if (toVerify) {
      this.userID = toVerify._id;
    } else {
      this.signUp = false;
      this.loggin = false;
      this.toastr.error('Hubo un error', null, { timeOut: 2000 });
    }
  }

  async submitPhone() {
    if (this.phoneNumber.value != undefined || null) {
      const validUser = await this.authService.checkUser(
        this.phoneNumber.value.e164Number.split('+')[1]
      );

      if (validUser && validUser.validatedAt !== null) {
        try {
          const { countryIso, nationalNumber } =
            this.authService.getPhoneInformation(
              this.phoneNumber.value.e164Number
            );
          this.merchantNumber = this.phoneNumber.value.e164Number.split('+')[1];
          this.userID = validUser._id;
          if (this.orderId && this.auth === 'anonymous') {
            this.authOrder(this.userID);
            return;
          }
          this.phoneNumber.setValue(nationalNumber);
          this.CountryISO = countryIso;
          this.loggin = true;
        } catch (error) {
          console.log(error);
        }
      } else if (validUser && validUser.validatedAt === null) {
        this.merchantNumber = this.phoneNumber.value.e164Number.split('+')[1];
        this.userID = validUser._id;
        this.loggin = true;
        this.toValidate = true;
        await this.generateTOP();
      } else if (this.orderId && this.auth === 'anonymous') {
        const anonymous = await this.authService.signup(
          {
            phone: this.phoneNumber.value.e164Number.split('+')[1],
          },
          'none',
          null,
          false
        );
        if (anonymous) {
          this.authOrder(anonymous._id);
          return;
        } else {
          this.toastr.error('Algo salio mal', null, {
            timeOut: 1500,
          });
        }
      } else {
        this.toastr.info('Al registro', null, { timeOut: 2000 });
        this.merchantNumber = this.phoneNumber.value.e164Number.split('+')[1];
        this.password.setValue(this.merchantNumber.slice(-4));
        this.signUp = true;
        return;
      }
    } else {
      this.toastr.error('Introduzca un número válido', null, { timeOut: 2000 });
      return;
    }
  }

  async signIn() {
    lockUI();
    if (this.password.invalid) {
      this.toastr.error('Error en campo de contraseña', null, {
        timeOut: 1500,
      });
      unlockUI();
    } else if (this.OTP) {
      const checkOTP = await this.authService.verify(
        this.password.value,
        this.userID
      );

      if (!checkOTP) {
        this.toastr.error('Código inválido', null, { timeOut: 2000 });
        unlockUI();
        return;
      } else {
        this.toastr.info('Código válido', null, { timeOut: 2000 });
        if (this.auth === 'address') {
          const address = this.headerService.getLocation(
            this.route.snapshot.queryParamMap.get('saleflow')
          );
          const result = await this.usersService.addLocation(address);
          if (result) {
            this.router.navigate(['ecommerce/checkout'], {
              replaceUrl: true,
            });
          }
          unlockUI();
          return;
        }
        if (this.auth === 'order' && !this.toValidate) {
          this.router.navigate([`ecommerce/${this.saleflow._id}/new-address`], {
            replaceUrl: true,
            state: {
              loggedIn: true,
            },
          });
          unlockUI();
          return;
        }
        if (this.orderId && !this.toValidate) {
          this.authOrder(checkOTP.user._id);
          return;
        }

        if (this.itemId) {
          await this.createItem(checkOTP.user);

          return;
        }

        /* if (this.toValidate) {
          this.loggin = false;
          this.signUp = true;
          this.phoneNumber.disable();
          if (this.validateData) {
            this.firstName.setValue(this.validateData.name);
            this.lastName.setValue(this.validateData.lastName);
            this.validateData?.email
              ? this.email.setValue(this.validateData.email)
              : '';
          }
          this.password.reset();
          unlockUI();
          return;
        } NO LO BORRÉ PORQUE QUIZAS LO USEMOS LUEGO*/

        this.router.navigate([`admin/entity-detail-metrics`], {
          replaceUrl: true,
        });
        unlockUI();
      }
    } else if (this.authCode) {
      const authCoded = await this.authService.verify(
        this.password.value,
        this.userID
      );

      if (!authCoded) {
        this.toastr.error('Código inválido', null, { timeOut: 2000 });
        unlockUI();
        return;
      } else {
        this.toastr.info('Código válido', null, { timeOut: 2000 });
        const session = await this.authService.signin(
          this.merchantNumber,
          this.sneaky,
          true
        );
        if (!session) {
          console.log('Error logging in');
          unlockUI();
          return;
        }
        if (this.auth === 'address') {
          const address = this.headerService.getLocation(
            this.route.snapshot.queryParamMap.get('saleflow')
          );
          const result = await this.usersService.addLocation(address);
          if (result) {
            this.router.navigate(['ecommerce/checkout'], {
              replaceUrl: true,
            });
          }
          unlockUI();
          return;
        }
        if (this.auth === 'order') {
          this.router.navigate([`ecommerce/${this.saleflow._id}/new-address`], {
            replaceUrl: true,
            state: {
              loggedIn: true,
            },
          });
          unlockUI();
          return;
        }
        if (this.orderId) {
          this.authOrder(session.user._id);
          unlockUI();
          return;
        }

        if (this.itemId) {
          await this.createItem(session.user);
          unlockUI();
          return;
        }

        this.router.navigate([`admin/entity-detail-metrics`], {
          replaceUrl: true,
        });
        unlockUI();
      }
    } else {
      const signin = await this.authService.signin(
        this.merchantNumber,
        this.password.value,
        true
      );

      if (!signin) {
        this.toastr.error('Contraseña inválida o usuario no verificado', null, {
          timeOut: 2500,
        });
        console.log('error');
        unlockUI();
        return;
      }
      if (this.auth === 'address') {
        const address = this.headerService.getLocation(
          this.route.snapshot.queryParamMap.get('saleflow')
        );
        const result = await this.usersService.addLocation(address);
        if (result) {
          this.router.navigate(['ecommerce/checkout'], {
            replaceUrl: true,
          });
        }
        unlockUI();
        return;
      }
      if (this.auth === 'order') {
        this.router.navigate([`ecommerce/${this.saleflow._id}/new-address`], {
          replaceUrl: true,
          state: {
            loggedIn: true,
          },
        });
        unlockUI();
        return;
      }
      if (this.orderId) {
        this.authOrder(signin.user._id);
        return;
      }

      if (this.itemId) {
        await this.createItem(signin.user);
        return;
      }

      this.router.navigate([`admin/entity-detail-metrics`], {
        replaceUrl: true,
      });
      unlockUI();
    }
  }

  async generateTOP(notoast?: boolean) {
    const OTP = await this.authService.generateOTP(this.merchantNumber);
    if (OTP) {
      notoast
        ? null
        : this.toastr.info('Código enviado al número', null, { timeOut: 2000 });
      this.OTP = true;
    }
  }

  async signMeUp() {
    if (this.phoneNumber === null || undefined) {
      this.toastr.info('Por favor, introduzca un número válido', null, {
        timeOut: 2000,
      });
      return;
    }

    this.merchantNumber = this.phoneNumber.value.e164Number.split('+')[1];

    const valid = await this.authService.checkUser(this.merchantNumber);

    if (!valid) {
      const newUser = await this.authService.signup(
        {
          phone: this.merchantNumber,
          password: this.password.value,
          name: this.firstName.value,
          lastname: this.lastName.value,
          email:
            this.email.value && this.email.valid ? this.email.value : undefined,
        },
        'none',
        null,
        false
      );

      if (!newUser) {
        console.log('Algo salio mal');
        return;
      } else {
        this.nope = true;
        await this.generateTOP(true);
        console.log('Creando nuevo user');
        this.sneaky = this.password.value;

        // await this.authService.generateMagicLink(
        //   this.merchantNumber,
        //   `admin/entity-detail-metrics`,
        //   newUser._id,
        //   'MerchantAccess',
        //   null
        // );
        this.toPassword();
        this.toastr.info(
          '¡Usuario registrado con exito! Se ha enviado un código para verificar',
          null,
          {
            timeOut: 5000,
            disableTimeOut: 'extendedTimeOut',
          }
        );
      }
    } else if (valid && valid.validatedAt === null) {
      await this.generateTOP(true);
      this.merchantNumber = this.phoneNumber.value.e164Number.split('+')[1];
      this.userID = valid._id;
      this.validateData = {
        name: this.firstName.value,
        lastName: this.lastName.value,
        password: this.password.value,
        email:
          this.email.value && this.email.valid ? this.email.value : undefined,
      };

      this.signUp = false;
      this.loggin = true;
      this.toValidate = true;
      this.password.reset();

      this.toastr.info('Ingrese el código para completar su registro', null, {
        timeOut: 5500,
      });
    } else {
      if (this.toValidate) {
        const validateUser = await this.authService.updateMe({
          password: this.password.value,
          name: this.firstName.value,
          lastname: this.lastName.value,
          email:
            this.email.value && this.email.valid ? this.email.value : undefined,
        });

        if (validateUser) {
          await this.authService.signin(
            this.merchantNumber,
            this.password.value,
            true
          );

          this.toastr.info('¡Usuario actualizado exitosamente!', null, {
            timeOut: 2000,
          });
          if (this.auth === 'address') {
            const address = this.headerService.getLocation(
              this.route.snapshot.queryParamMap.get('saleflow')
            );
            const result = await this.usersService.addLocation(address);
            if (result) {
              this.router.navigate(['ecommerce/checkout'], {
                replaceUrl: true,
              });
            }
            return;
          }
          if (this.auth === 'order') {
            this.router.navigate(
              [`ecommerce/${this.saleflow._id}/new-address`],
              {
                replaceUrl: true,
                state: {
                  loggedIn: true,
                },
              }
            );
          } else {
            this.router.navigate([`admin/entity-detail-metrics`], {
              replaceUrl: true,
            });
          }
          return;
        } else {
          this.toastr.error('Algo no funciona', null, {
            timeOut: 2200,
          });
          return;
        }
      }
      this.toastr.info('Ese Usuario ya esta registrado', null, {
        timeOut: 2200,
      });
      return;
    }
  }

  async getDefaultMerchantAndSaleflows(user: User): Promise<{
    merchantDefault: Merchant;
    saleflowDefault: SaleFlow;
  }> {
    if (!user?._id) return null;

    let userMerchantDefault = await this.merchantService.merchantDefault(
      user._id
    );

    if (!userMerchantDefault) {
      const merchants = await this.merchantService.myMerchants();

      if (merchants.length === 0) {
        const { createMerchant: createdMerchant } =
          await this.merchantService.createMerchant({
            owner: user._id,
            name: user.name + ' mechant #' + Math.floor(Math.random() * 100000),
          });

        const { merchantSetDefault: defaultMerchant } =
          await this.merchantService.setDefaultMerchant(createdMerchant._id);

        if (defaultMerchant) userMerchantDefault = defaultMerchant;
      }
    }

    let userSaleflowDefault = await this.saleflowsService.saleflowDefault(
      userMerchantDefault._id
    );

    if (!userSaleflowDefault) {
      const { createSaleflow: createdSaleflow } =
        await this.saleflowsService.createSaleflow({
          merchant: userMerchantDefault._id,
          name:
            userMerchantDefault._id +
            ' saleflow #' +
            Math.floor(Math.random() * 100000),
          items: [],
        });

      const { saleflowSetDefault: defaultSaleflow } =
        await this.saleflowsService.setDefaultSaleflow(
          userMerchantDefault._id,
          createdSaleflow._id
        );

      this.saleflowsService.createSaleFlowModule({
        saleflow: createdSaleflow._id,
      });

      userSaleflowDefault = defaultSaleflow;
    }

    return {
      merchantDefault: userMerchantDefault,
      saleflowDefault: userSaleflowDefault,
    };
  }

  async createItem(user: User) {
    switch (this.action) {
      case 'precreateitem':
        const {
          merchantDefault: userMerchantDefault,
          saleflowDefault: userSaleflowDefault,
        } = await this.getDefaultMerchantAndSaleflows(user);

        await this.itemsService.authItem(userMerchantDefault._id, this.itemId);

        await this.saleflowsService.addItemToSaleFlow(
          {
            item: this.itemId,
          },
          userSaleflowDefault._id
        );

        if (this.doesItemHasParams) {
          const itemParams = this.itemsService.temporalItemParams;

          if (!itemParams) this.router.navigate([this.headerService.flowRoute]);

          /*
          const itemParams = JSON.parse(localStorage.getItem("temporalItemParams"));
          localStorage.removeItem("temporalItemParams");
          */

          if (itemParams.length > 0 && itemParams[0].values.length > 0) {
            const { createItemParam } = await this.itemsService.createItemParam(
              userMerchantDefault._id,
              this.itemId,
              {
                name: itemParams[0].name,
                formType: 'color',
                values: [],
              }
            );
            const paramValues = itemParams[0].values.map((value) => {
              return {
                name: value.name,
                image: value.image,
                price: value.price,
                description: value.description,
              };
            });

            await this.itemsService.addItemParamValue(
              paramValues,
              createItemParam._id,
              userMerchantDefault._id,
              this.itemId
            );
          }
        }

        this.router.navigate(['admin/options/' + this.itemId]);
        return;

        break;
    }
  }

  async getOrderData(id: string, preOrder?: boolean): Promise<ItemOrder> {
    if (!preOrder) return (await this.orderService.order(id))?.order;
    return (await this.orderService.preOrder(id))?.order;
  }

  async authOrder(id: string) {
    if (this.orderStatus !== 'draft') return;
    const order = (await this.orderService.authOrder(this.orderId, id))
      .authOrder;
    if (this.auth === 'payment') {
      await this.orderService.payOrder(
        {
          image: this.image,
          platform: 'bank-transfer',
          transactionCode: '',
        },
        order.user._id,
        'bank-transfer',
        order._id
      );
    }
    this.router.navigate([this.fullLink], {
      replaceUrl: true,
    });
    const message = `COMPRADOR: ${
      this.headerService.user
        ? this.headerService.user.name || 'Sin nombre'
        : 'Anónimo'
    }\nARTICULO: ${order.items.length > 1 ? '\n' : ''}${order.items.map(
      (itemSubOrder) =>
        '- ' +
        (itemSubOrder.item.name ||
          `${environment.uri}/ecommerce/item-detail/${this.headerService.saleflow._id}/${itemSubOrder.item._id}`) +
        '\n'
    )}PAGO: $${this.paymentAmount.toLocaleString('es-MX')}\nFACTURA ${formatID(
      order.dateId
    )}: ${this.fullLink}`.replace(/,/g, '');
    this.messageLink = `https://wa.me/${
      this.merchant.owner.phone
    }?text=${encodeURIComponent(message)}`;
    window.location.href = this.messageLink;
  }

  showShoppingCartDialog = () => {
    this.dialog.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: {
        orderFinished: true,
        products: this.items,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  back() {
    this.location.back();
  }

  async signUpNew() {
    const register = await this.authService.signup(
      {
        phone: this.merchantNumber,
        password: this.password.value,
      },
      'none',
      null,
      false
    );
    if (register) {
      this.sneaky = this.password.value;
      await this.generateTOP(true);
      this.toPassword();
      this.toastr.success(
        'Número Registrado con exito. Se ha enviado un código para verificar',
        null,
        { timeOut: 2000 }
      );
    } else this.toastr.error('Registro fallido', null, { timeOut: 2000 });
  }
}
