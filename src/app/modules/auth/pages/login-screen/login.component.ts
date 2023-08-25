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
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { Session } from 'src/app/core/models/session';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { UsersService } from 'src/app/core/services/users.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { environment } from 'src/environments/environment';

type AuthTypes =
  | 'phone'
  | 'password'
  | 'order'
  | 'address'
  | 'anonymous'
  | 'payment'
  | 'merchant'
  | 'virtual-message'
  | 'azul-login';

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
  status: 'draft' | 'ready' = 'ready';
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
  // doesItemHasParams: boolean;
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
  view: string;
  itemCartAmount: number;
  validateData: ValidateData;
  redirectionRoute: string = null;
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
  paymentWithAzul: boolean = false;
  recoverPasswordMode: boolean = false;

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
    private postsService: PostsService,
    private dialog: DialogService // private saleflowService: SaleFlowService, // private item: ItemsService
  ) {
    this.image = this.router.getCurrentNavigation().extras.state?.image;
  }

  async ngOnInit(): Promise<void> {
    this.orderId = this.route.snapshot.queryParamMap.get('orderId');
    this.itemId = this.route.snapshot.queryParamMap.get('itemId');
    this.action = this.route.snapshot.queryParamMap.get('action');
    this.redirectionRoute = this.route.snapshot.queryParamMap.get('redirect');
    this.recoverPasswordMode = Boolean(
      this.route.snapshot.queryParamMap.get('recoverPassword')
    );
    this.paymentWithAzul = Boolean(
      this.route.snapshot.queryParamMap.get('paymentWithAzul')
    );
    // this.doesItemHasParams = Boolean(
    //   this.route.snapshot.queryParamMap.get('hasParams')
    // );

    // if (this.action === 'precreateitem' && this.doesItemHasParams) {
    //   const itemParams = this.itemsService.temporalItemParams;

    //   if (typeof itemParams === 'undefined' || !itemParams) {
    //     const flowRoute = localStorage.getItem('flowRoute');
    //     if (flowRoute && flowRoute.length > 1) {
    //       const [baseRoute, paramsString] = flowRoute.split('?');
    //       const paramsArray = paramsString ? paramsString.split('&') : [];
    //       const queryParams = {};

    //       paramsArray.forEach((param) => {
    //         const [key, value] = param.split('=');

    //         queryParams[key] = value;
    //       });

    //       localStorage.removeItem('flowRoute');
    //       this.router.navigate([baseRoute], {
    //         queryParams,
    //       });
    //     }
    //   }
    // }

    if (this.recoverPasswordMode) return;

    this.getNumber();
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
      this.fullLink = `${environment.uri}/ecommerce/order-detail/${order._id}`;
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
    } else if (this.auth === 'order' || this.auth === 'address') {
      lockUI();

      this.headerService.orderId = null;
      this.saleflow = await this.headerService.fetchSaleflow(SaleFlow);

      if (this.auth === 'address') {
        const address = this.headerService.getLocation();
        if (!address) {
          this.router.navigate(
            [`ecommerce/${this.saleflow.merchant.slug}/new-address`],
            {
              replaceUrl: true,
            }
          );
        }
      }

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
        this.merchantNumber
          ? this.phoneNumber.setValue(this.merchantNumber)
          : null;
        this.loggin = false;
        unlockUI();
      }
    } else if (this.auth === 'anonymous') {
      unlockUI();
    } else if (this.auth === 'payment') {
      if (!this.image) {
        this.router.navigate(
          [`ecommerce/${this.saleflow.merchant.slug}/payments/${this.orderId}`],
          {
            replaceUrl: true,
          }
        );
      }
    } else if (this.auth === 'merchant') {
      console.log('merchant access');
    } else if (this.auth === 'virtual-message') {
      this.saleflow = await this.headerService.fetchSaleflow(SaleFlow);
      unlockUI();
    } else if (this.auth === 'azul-login') {
    } else {
      this.auth = 'phone';
      this.loggin = false;
      unlockUI();
    }
  }

  redirectFromQueryParams() {
    if (this.redirectionRoute.includes('?')) {
      const redirectURL: { url: string; queryParams: Record<string, string> } =
        { url: null, queryParams: {} };
      const routeParts = this.redirectionRoute.split('?');
      const redirectionURL = routeParts[0];
      const routeQueryStrings = routeParts[1].split('&').map((queryString) => {
        const queryStringElements = queryString.split('=');

        return { [queryStringElements[0]]: queryStringElements[1] };
      });

      redirectURL.url = redirectionURL;
      redirectURL.queryParams = {};

      routeQueryStrings.forEach((queryString) => {
        const key = Object.keys(queryString)[0];
        redirectURL.queryParams[key] = queryString[key];
      });

      this.router.navigate([redirectURL.url], {
        queryParams: redirectURL.queryParams,
        replaceUrl: true,
      });
    } else {
      this.router.navigate([this.redirectionRoute], {
        replaceUrl: true,
      });
    }
  }

  toggleLog() {
    this.loggin = !this.loggin;
    this.OTP = false;
    this.authCode = false;
    this.phoneNumber.reset();
    this.password.reset();
    this.getNumber();
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
    this.status = 'draft';
    if (this.phoneNumber.value != undefined || null) {
      const validUser = await this.authService.checkUser(
        this.phoneNumber.value.e164Number.split('+')[1]
      );

      validUser
        ? localStorage.setItem(
            'phone-number',
            JSON.stringify(this.phoneNumber.value)
          )
        : null;
      if (validUser) {
        // El user existe
        try {
          const { countryIso, nationalNumber } =
            this.authService.getPhoneInformation(
              this.phoneNumber.value.e164Number
            );
          this.merchantNumber = this.phoneNumber.value.e164Number.split('+')[1];
          this.userID = validUser._id;
          if (this.auth === 'order' || this.auth === 'address') {
            // Se le envia el magic link para autenticar
            await this.authService.generateMagicLink(
              this.merchantNumber,
              `ecommerce/${this.saleflow.merchant.slug}/new-address`,
              null,
              'NonExistingOrder',
              {
                data: localStorage.getItem(this.saleflow._id),
              }
            );
          }
          if (this.auth === 'virtual-message') {
            // Se le envia el magic link para autenticar
            await this.authService.generateMagicLink(
              this.merchantNumber,
              `ecommerce/${this.merchant.slug}/payments`,
              this.orderId,
              'Order',
              {
                privatePost: localStorage.getItem('privatePost'),
              }
            );
          }

          // if (this.action === 'precreateitem') {
          //   await this.authService.generateMagicLink(
          //     this.merchantNumber,
          //     `admin/create-article/`,F
          //     this.itemId,
          //     'NewItem',
          //     {}
          //   );
          // }

          if (this.auth === 'merchant') {
            await this.authService.generateMagicLink(
              this.merchantNumber,
              `admin/dashboard`,
              this.userID,
              'MerchantAccess',
              null
            );
          }

          if (
            this.orderId &&
            (this.auth === 'anonymous' || this.auth === 'payment')
          ) {
            await this.authOrder(this.userID);
            return;
          }

          if (this.auth === 'azul-login') {
            await this.authService.generateMagicLink(
              this.phoneNumber.value.e164Number.split('+')[1],
              this.redirectionRoute,
              null,
              'UserAccess',
              null
            );

            this.toastr.info(
              'Se ha enviado un link de acceso a tu telefono',
              null,
              { timeOut: 8000 }
            );
          }

          this.phoneNumber.setValue(nationalNumber);
          this.CountryISO = countryIso;
          this.status = 'ready';
          this.loggin = true;
        } catch (error) {
          this.status = 'ready';
          console.log(error);
        }
      } else if (
        this.orderId &&
        (this.auth === 'anonymous' || this.auth === 'payment')
      ) {
        // El user no existe y va a pagar o hacer una orden de forma anonima
        const anonymous = await this.authService.signup(
          {
            phone: this.phoneNumber.value.e164Number.split('+')[1],
            password: this.phoneNumber.value.e164Number.slice(-4),
          },
          'none',
          null,
          false
        );
        if (anonymous) {
          await this.authOrder(anonymous._id);
          return;
        } else {
          this.toastr.error('Algo salio mal', null, {
            timeOut: 1500,
          });
          this.status = 'ready';
        }
      } else {
        if (this.auth === 'azul-login') {
          await this.authService.generateMagicLink(
            this.phoneNumber.value.e164Number.split('+')[1],
            this.redirectionRoute,
            null,
            'UserAccess',
            null
          );

          this.toastr.info(
            'Se ha enviado un link de acceso a tu telefono',
            null,
            { timeOut: 2000 }
          );
        }

        // El user no esta registrado
        if (this.auth === 'address') {
          // Guardar una dirección
          const userInput = {
            phone: this.phoneNumber.value.e164Number.split('+')[1],
            password: this.phoneNumber.value.e164Number.slice(-4),
          };
          localStorage.setItem('registered-user', JSON.stringify(userInput));
          this.router.navigate(
            [`ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`],
            {
              replaceUrl: true,
            }
          );

          localStorage.setItem(
            'phone-number',
            JSON.stringify(this.phoneNumber.value)
          );

          this.status = 'ready';
          return;
        }
        if (this.auth === 'order') {
          // Ver direcciones guardadas
          const userInput = {
            phone: this.phoneNumber.value.e164Number.split('+')[1],
            password: this.phoneNumber.value.e164Number.slice(-4),
          };

          localStorage.setItem(
            'phone-number',
            JSON.stringify(this.phoneNumber.value)
          );
          localStorage.setItem('registered-user', JSON.stringify(userInput));
          this.router.navigate(
            [`ecommerce/${this.saleflow.merchant.slug}/new-address`],
            {
              replaceUrl: true,
              state: {
                loggedIn: true,
              },
            }
          );
          this.status = 'ready';
          return;
        }

        this.toastr.info('Al registro', null, { timeOut: 2000 });
        this.merchantNumber = this.phoneNumber.value.e164Number.split('+')[1];
        this.password.setValue(this.merchantNumber.slice(-4));
        this.status = 'ready';
        this.signUp = true;
        return;
      }
    } else {
      this.toastr.error('Introduzca un número válido', null, { timeOut: 2000 });
      this.status = 'ready';
      return;
    }
  }

  async signIn(avoidDraftStatus = false) {
    if (!avoidDraftStatus) this.status = 'draft';

    if (this.password.invalid) {
      this.toastr.error('Error en campo de contraseña', null, {
        timeOut: 1500,
      });
      this.status = 'ready';
    } else if (this.OTP) {
      let checkOTP: Session;
      if (this.view === 'password') {
        checkOTP = (
          await this.authService.analizeMagicLink(this.password.value)
        )?.session;
      } else {
        checkOTP = await this.authService.verify(
          this.password.value,
          this.userID
        );
      }

      if (!checkOTP) {
        this.toastr.error('Código inválido', null, { timeOut: 2000 });
        this.status = 'ready';
        if (this.view === 'password') this.OTP = false;
        return;
      } else {
        this.toastr.info('Código válido', null, { timeOut: 2000 });
        if (this.auth === 'virtual-message') {
          this.router.navigate(
            [`ecommerce/${this.merchant.slug}/payments/${this.orderId}`],
            {
              replaceUrl: true,
            }
          );
          this.status = 'ready';
          return;
        }
        if (this.auth === 'address') {
          const address = this.headerService.getLocation();
          const result = await this.usersService.addLocation(address);
          if (result) {
            this.router.navigate(
              [
                `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`,
              ],
              {
                replaceUrl: true,
              }
            );
          }
          this.status = 'ready';
          return;
        }
        if (this.auth === 'order') {
          /* && !this.toValidate*/ this.router.navigate(
            [`ecommerce/${this.saleflow.merchant.slug}/new-address`],
            {
              replaceUrl: true,
              state: {
                loggedIn: true,
              },
            }
          );
          this.status = 'ready';
          return;
        }

        if (this.auth === 'azul-login') {
          return this.redirectFromQueryParams();
        }

        if (this.orderId && !this.toValidate) {
          await this.authOrder(checkOTP.user._id);
          return;
        }

        // if (this.itemId) {
        //   await this.createItem(checkOTP.user);
        //   return;
        // }

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

        if (this.redirectionRoute) {
          this.redirectFromQueryParams();
          return;
        }

        this.router.navigate([`admin/dashboard`], {
          replaceUrl: true,
        });
        this.status = 'ready';
      }
    } else if (this.authCode) {
      const authCoded = await this.authService.verify(
        this.password.value,
        this.userID
      );

      if (!authCoded) {
        this.toastr.error('Código inválido', null, { timeOut: 2000 });
        this.status = 'ready';
        return;
      } else {
        if (this.auth !== 'address' && this.auth !== 'order')
          this.toastr.info('Código válido', null, { timeOut: 2000 });
        const session = await this.authService.signin(
          this.merchantNumber,
          this.sneaky,
          true
        );
        if (!session) {
          //  console.log('Error logging in');
          this.status = 'ready';
          return;
        }
        if (this.auth === 'address') {
          // Caso en el que el usuario se registra y guarda una direccion
          const address = this.headerService.getLocation();
          const result = await this.usersService.addLocation(address);
          if (result) {
            this.toastr.info(
              'Código válido. La dirección ha sido guardada',
              null,
              {
                timeOut: 3000,
              }
            );
            this.router.navigate(
              [
                `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`,
              ],
              {
                replaceUrl: true,
              }
            );
          }
          this.status = 'ready';
          return;
        }
        if (this.auth === 'order') {
          // Caso en el que el usuario se registra y quiere ver sus direcciones
          this.toastr.info(
            'Código válido. Ahora puedes guardar tus direcciones',
            null,
            {
              timeOut: 3000,
            }
          );
          this.router.navigate(
            [`ecommerce/${this.saleflow.merchant.slug}/new-address`],
            {
              replaceUrl: true,
              state: {
                loggedIn: true,
              },
            }
          );
          this.status = 'ready';
          return;
        }
        if (this.orderId) {
          await this.authOrder(session.user._id);
          this.status = 'ready';
          return;
        }

        // if (this.itemId) {
        //   await this.createItem(session.user);
        //   this.status = 'ready';
        //   return;
        // }

        if (this.redirectionRoute) {
          this.redirectFromQueryParams();
          return;
        }

        this.router.navigate([`admin/dashboard`], {
          replaceUrl: true,
        });
        this.status = 'ready';
      }
    } else {
      const signin = await this.authService.signin(
        this.merchantNumber,
        this.password.value,
        true
      );

      if (!signin) {
        this.OTP = true;
        this.view = 'password';
        this.status = 'ready';
        this.signIn(true);
        // this.toastr.error('Contraseña inválida o usuario no verificado', null, {
        //   timeOut: 2500,
        // });
        //   console.log('error');
        // this.status = 'ready';
        return;
      }
      if (this.auth === 'address') {
        const address = this.headerService.getLocation();
        const result = await this.usersService.addLocation(address);
        if (result) {
          this.router.navigate(
            [`ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`],
            {
              replaceUrl: true,
            }
          );
        }
        this.status = 'ready';
        return;
      }
      if (this.auth === 'order') {
        this.router.navigate(
          [`ecommerce/${this.saleflow.merchant.slug}/new-address`],
          {
            replaceUrl: true,
            state: {
              loggedIn: true,
            },
          }
        );
        this.status = 'ready';
        return;
      }
      if (this.orderId) {
        await this.authOrder(signin.user._id);

        if (!this.paymentWithAzul) return;
      }

      // if (this.itemId) {
      //   await this.createItem(signin.user);
      //   return;
      // }

      if (this.redirectionRoute) {
        this.redirectFromQueryParams();
        return;
      }

      this.router.navigate([`admin/dashboard`], {
        replaceUrl: true,
      });
      this.status = 'ready';
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
        //   `admin/items-dashboards`,
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
          }
        );

        localStorage.setItem(
          'phone-number',
          JSON.stringify(this.phoneNumber.value)
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
        // Creo que este caso no se está usando
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
            const address = this.headerService.getLocation();
            const result = await this.usersService.addLocation(address);
            if (result) {
              this.router.navigate(
                [
                  `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`,
                ],
                {
                  replaceUrl: true,
                }
              );
            }
            return;
          }
          if (this.auth === 'order') {
            this.router.navigate(
              [`ecommerce/${this.saleflow.merchant.slug}/new-address`],
              {
                replaceUrl: true,
                state: {
                  loggedIn: true,
                },
              }
            );
          } else {
            if (this.redirectionRoute) {
              this.redirectFromQueryParams();
              return;
            }

            this.router.navigate([`admin/dashboard`], {
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

  async updateMyPassword() {
    try {
      await this.authService.updateMe({
        password: this.password.value,
      });

      this.toastr.info('Contraseña actualizada', null, {
        timeOut: 3000,
      });

      this.router.navigate(['admin/dashboard']);
    } catch (error) {
      this.toastr.error(
        'Ocurrió un error al intentar actualizar la contraseña',
        null,
        {
          timeOut: 1500,
        }
      );
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

  // async createItem(user: User) {
  //   switch (this.action) {
  //     case 'precreateitem':
  //       const {
  //         merchantDefault: userMerchantDefault,
  //         saleflowDefault: userSaleflowDefault,
  //       } = await this.getDefaultMerchantAndSaleflows(user);

  //       await this.itemsService.authItem(userMerchantDefault._id, this.itemId);

  //       await this.saleflowsService.addItemToSaleFlow(
  //         {
  //           item: this.itemId,
  //         },
  //         userSaleflowDefault._id
  //       );

  //       if (this.doesItemHasParams) {
  //         const itemParams = this.itemsService.temporalItemParams;

  //         if (!itemParams) this.router.navigate([this.headerService.flowRoute]);

  //         /*
  //         const itemParams = JSON.parse(localStorage.getItem("temporalItemParams"));
  //         localStorage.removeItem("temporalItemParams");
  //         */

  //         if (itemParams.length > 0 && itemParams[0].values.length > 0) {
  //           const { createItemParam } = await this.itemsService.createItemParam(
  //             userMerchantDefault._id,
  //             this.itemId,
  //             {
  //               name: itemParams[0].name,
  //               formType: 'color',
  //               values: [],
  //             }
  //           );
  //           const paramValues = itemParams[0].values.map((value) => {
  //             return {
  //               name: value.name,
  //               image: value.image,
  //               price: value.price,
  //               description: value.description,
  //             };
  //           });

  //           await this.itemsService.addItemParamValue(
  //             paramValues,
  //             createItemParam._id,
  //             userMerchantDefault._id,
  //             this.itemId
  //           );
  //         }
  //       }
  //       this.toastr.success('Producto creado satisfactoriamente!');
  //       this.router.navigate(['admin/create-article/' + this.itemId]);
  //       return;

  //       break;
  //   }
  // }

  async getOrderData(id: string, preOrder?: boolean): Promise<ItemOrder> {
    if (!preOrder) return (await this.orderService.order(id))?.order;
    return (await this.orderService.preOrder(id))?.order;
  }

  async authOrder(id: string) {
    if (this.orderStatus !== 'draft') return;
    const order = (await this.orderService.authOrder(this.orderId, id))
      .authOrder;
    localStorage.removeItem('registered-user');
    if (this.auth === 'payment' && !this.paymentWithAzul) {
      await this.orderService.payOrder(
        {
          image: this.image,
          platform: 'bank-transfer',
          transactionCode: '',
          subtotal: this.paymentAmount,
        },
        order.user._id,
        'bank-transfer',
        order._id
      );
    }

    // if (!order.orderStatusDelivery) await this.orderService.orderSetStatusDeliveryWithoutAuth("in progress", order._id);

    if (order.items[0].post) {
      this.postsService.postAddUser(order.items[0].post._id, id);
    }

    if (this.redirectionRoute) {
      return this.redirectFromQueryParams();
    }

    if (this.auth === 'virtual-message') {
      this.router.navigate(
        [`ecommerce/${this.merchant.slug}/payments/${this.orderId}`],
        {
          replaceUrl: true,
          state: {
            loggedIn: true,
          },
        }
      );
      return;
    }

    this.router.navigate([`ecommerce/order-detail/${order._id}`], {
      queryParams: { notify: 'true' },
    });
  }

  async recoverPassword() {
    await this.authService.generateMagicLink(
      this.phoneNumber.value.e164Number.split('+')[1],
      'auth/login',
      null,
      'PasswordRecovery',
      {
        recoverPassword: 'true',
      }
    );

    this.toastr.info(
      'Se ha enviado un link a tu telefono, úsalo para recuperar tu contraseña',
      null,
      { timeOut: 8000 }
    );
  }

  back() {
    return this.router.navigate([`ecommerce/club-landing`]);
  }

  async getNumber() {
    let phoneNumberInfo: any = JSON.parse(localStorage.getItem('phone-number'));

    let number = null;

    if (phoneNumberInfo && 'e164Number' in phoneNumberInfo) {
      phoneNumberInfo.e164Number.split('+')[1];

      number = phoneNumberInfo.e164Number.split('+')[1];

      for (const countryAlias of Object.keys(CountryISO)) {
        if (
          CountryISO[countryAlias].toLowerCase() ===
          phoneNumberInfo.countryCode.toLowerCase()
        ) {
          this.CountryISO = CountryISO[countryAlias];
          this.preferredCountries = [
            CountryISO.DominicanRepublic,
            CountryISO.UnitedStates,
          ];
          this.preferredCountries.unshift(CountryISO[countryAlias]);
        }
      }
    }
    //  console.log(number);
    if (number !== null) {
      this.merchantNumber = number.split('+')[1];
      try {
        const phoneNumber = await this.authService.checkUser(number);
        if (phoneNumber) {
          const { countryIso, nationalNumber } =
            await this.authService.getPhoneInformation(number);
          this.phoneNumber.setValue(nationalNumber);
          this.CountryISO = countryIso;
        } else return;
      } catch (e) {
        console.log(e);
      }
    } else this.merchantNumber = '';
  }

  focusPhoneInput() {
    const ngxIntlPhoneInput = document.querySelector('#phone');

    (ngxIntlPhoneInput.querySelector('#phone') as HTMLInputElement).focus();
  }
}
