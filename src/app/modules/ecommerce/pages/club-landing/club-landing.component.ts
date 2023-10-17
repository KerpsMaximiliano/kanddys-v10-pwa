import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { GoogleSigninService } from 'src/app/core/services/google-signin.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { OrderService } from 'src/app/core/services/order.service';
import { ClubDialogComponent } from 'src/app/shared/dialogs/club-dialog/club-dialog.component';
import { MessageDialogComponent } from 'src/app/shared/dialogs/message-dialog/message-dialog.component';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { truncateString } from 'src/app/core/helpers/strings.helpers';
import { Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { FormComponent } from 'src/app/shared/dialogs/form/form.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { AppService } from 'src/app/app.service';
import { base64ToBlob } from 'src/app/core/helpers/files.helpers';
import { AffiliateInput } from 'src/app/core/models/affiliate';
import { Merchant, Roles } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { AffiliateService } from 'src/app/core/services/affiliate.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { CompareDialogComponent } from 'src/app/shared/dialogs/compare-dialog/compare-dialog.component';
import { SelectRoleDialogComponent } from 'src/app/shared/dialogs/select-role-dialog/select-role-dialog.component';
import { SignupChatComponent } from 'src/app/shared/dialogs/signup-chat/signup-chat.component';
import { SpecialDialogComponent } from 'src/app/shared/dialogs/special-dialog/special-dialog.component';
import { URL } from 'url';
import { FilesService } from 'src/app/core/services/files.service';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { OptionsDialogComponent } from 'src/app/shared/dialogs/options-dialog/options-dialog.component';

interface ReviewsSwiper {
  title: string;
  slides: Array<{
    content: string;
  }>;
}

interface Tabs {
  text: string;
  subTabs?: Array<{
    text: string;
    active: boolean;
    content?: string[];
  }>;
  active?: boolean;
}

@Component({
  selector: 'app-club-landing',
  templateUrl: './club-landing.component.html',
  styleUrls: ['./club-landing.component.scss'],
})
export class ClubLandingComponent implements OnInit, OnDestroy {

  showGanas: boolean = false;

  merchantRole: Roles | null = null;
  roles : Roles[] = [];

  paymentSwitch: boolean = false;
  statusSwitch: boolean = false;

  loginflow: boolean = false;
  loginEmail: string = null;
  magicLink: boolean = false;

  sales: number | null = null;

  assetsFolder: string = environment.assetsUrl;
  URI: string = environment.uri;
  qrdata: string | undefined = undefined;
  openNavigation: boolean = false;
  queryParamsSubscription: Subscription = null;
  routerParamsSubscription: Subscription = null;

  redirectionRoute: string = '/ecommerce/club-landing';
  redirectionRouteId: string | null = null;
  entity: string = 'MerchantAccess';
  jsondata: string = JSON.stringify({
    openNavigation: true,
  });

  isFlag = false;
  tabIndex = 0;
  userID = '';
  isVendor = false;
  isProvider = false;
  mainTitle = 'HERRAMIENTAS GRATIS  PARA PROVEEDORES';
  isOpen = false;
  curRole = 0;
  tabarIndex: number | undefined = 2;

  user: gapi.auth2.GoogleUser;

  list = [
    {
      text: '"Laia, nos impulsa a avanzar para no quedarnos atrás"',
      avatar: '',
      name: 'José Miguel Caffaro',
      // role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '".. es una manera genial de simplificar el proceso de compra desde las plataformas sociales"',
      avatar: '',
      name: 'Valentina Vargas',
      // role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '".. convierto a los seguidores en compradores de manera rápida y sencilla"',
      avatar: '',
      name: 'Mateo López',
      // role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '".. puedo subir sus productos de manera rápida y sencilla"',
      avatar: '',
      name: 'Sofía Martínez',
      // role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '".. los clientes no tienen que descargar ninguna aplicación, eso simplifica la experiencia de compra"',
      avatar: '',
      name: 'Luciana Fernández',
      // role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '".. puedo acceder a una red amplia de proveedores de flores en un abrir y cerrar de ojos."',
      avatar: '',
      name: 'Tomás Gómez',
      // role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '"¡Esta función de Cotización Eficiente con Proveedores en la aplicación es como tener un equipo de compras personal a tu disposición!"',
      avatar: '',
      name: 'Aitana Sánchez',
      // role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '".. es como si los proveedores compitieran por ofrecerme las mejores ofertas, lo cual me siento confiado de donde comprar"',
      avatar: '',
      name: 'Emiliano Torres',
      // role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '".. me permite conectarme con un montón de proveedores y pedir cotizaciones en cuestión de minutos"',
      avatar: '',
      name: 'Camila Díaz',
      // role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '".. significa que puedo tomar decisiones más inteligentes y aumentar mis ganancias"',
      avatar: '',
      name: 'Matías Vidal',
      // role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '".. puedo pedir cotizaciones y luego simplemente comparar y elegir la opción más conveniente"',
      avatar: '',
      name: 'Julieta García',
      // role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '".. no solo ahorro dinero, sino que también ahorro tiempo al evitar largas negociaciones, realmente es un ganar-ganar"',
      avatar: '',
      name: 'Nicolás Herrera',
      // role: 'Proveedor de flores frescas, follajes y bases'
    },
  ];

  activeTabIndex: number = 0;

  swipers: Array<ReviewsSwiper> = [
    {
      title: 'LO QUE MAS LE GUSTA A LAS FLORISTERIAS',
      slides: [
        {
          content:
            '“.. lo de las ventas a través de WhatsApp, mensajes de video para clientes, comunicación de estado de pedidos, y la base de datos de mis clientes segmentada”',
        },
        {
          content:
            '“.. lo fácil que es convertir cotizaciones en compras y mantener un seguimiento de todas las transacciones, me ayuda a gestionar los costos y mi inventario”',
        },
        {
          content:
            '“.. me aseguro de ahorrarme $ al obtener las cotizaciones de múltiples proveedores al mismo tiempo”',
        },
      ],
    },
    {
      title: 'LO QUE MAS LE GUSTA A LOS PROVEEDORES',
      slides: [
        {
          content:
            '“.. es que no hay manera más fácil de cotizarles a las floristerías, me ahorra tiempo y una empleada.”',
        },
        {
          content:
            '“.. las floristerías convierten las cotizaciones en compras con un solo clic y eso simplifica el proceso de venta”',
        },
      ],
    },
  ];
  link: string = this.URI;
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 0,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
    },
  };

  emailDialogRef: MatDialogRef<FormComponent, any> = null;
  merchant: string;
  merchantSlug: string;
  merchantName: string;
  merchantEmail: string;
  saleflow: SaleFlow;
  referralsCount: number = 0;
  vectorsCount: number = 0;
  chatsCount: number = 0;
  @ViewChild('qrcode', { read: ElementRef }) qrcode: ElementRef;
  
  constructor(
    public headerService: HeaderService,
    private app: AppService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private bottomSheet: MatBottomSheet,
    private itemsService: ItemsService,
    private dialogService: DialogService,
    private googleSigninService: GoogleSigninService,
    private orderService: OrderService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private saleflowsService: SaleFlowService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private clipboard: Clipboard,
    private affiliateService: AffiliateService,
    private filesService: FilesService,
    private gptService: Gpt3Service
  ) {
    const sub = this.app.events
      .pipe(filter((e) => e.type === 'auth'))
      .subscribe(async (e) => {
        if (e.data) {
          await this.getMerchantDefault();
          await this.getReferrals();
          await this.getSaleflowDefault();
        }
      });
  }

  async ngOnInit() {
    await this.getMerchantDefault();
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      async ({ affiliateCode, tabarIndex }) => {
        if (tabarIndex) {
          this.tabarIndex = parseInt(tabarIndex);
        }
        if (affiliateCode) {
          if (this.merchant) {
            const input: AffiliateInput = {
              reference: this.merchant,
            };
            try {
              await this.affiliateService.createAffiliate(affiliateCode, input);
            } catch (error) {
              console.log(error);
            }
          } else {
            localStorage.setItem('affiliateCode', affiliateCode);
          }
        }
      }
    );
    if (this.merchant) {
      await this.getReferrals();
      await this.getSaleflowDefault();
      let logins : any[] = JSON.parse(window.localStorage.getItem('logins'));
      if(!logins) {
        logins = [];
        logins.push({
          name: this.merchantName ? this.merchantName : this.headerService.user.name,
          email: this.merchantEmail ? this.merchantEmail : this.headerService.user.email,
        })
        console.log(logins)
        window.localStorage.setItem('logins', JSON.stringify(logins));
      } else if(!logins.find((login) => login.name === this.merchantName || login.name === this.headerService.user.name)) {
        logins.push({
          name: this.merchantName ? this.merchantName : this.headerService.user.name,
          email: this.merchantEmail ? this.merchantEmail : this.headerService.user.email,
        })
        console.log(logins)
        window.localStorage.setItem('logins', JSON.stringify(logins));
      }
      await Promise.all([
        this.gptService.getMerchantEmbeddingsMetadata(),
        this.getChats(),
      ]).then(async ([embeddingsMetadata, numberOfChatResponse]) => {
        if (embeddingsMetadata) {
          this.vectorsCount = embeddingsMetadata.vectorsCount;
        }

        if (numberOfChatResponse) {
          const data = await numberOfChatResponse.json();
          this.chatsCount =
            typeof data?.numberOfChats === 'number' ? data?.numberOfChats : 0;
        }
      });
    }
    this.googleSigninService.observable().subscribe((user) => {
      this.user = user;
      console.log(user);
      this.changeDetectorRef.detectChanges();
    });
    if (this.tabarIndex === undefined) {
      this.tabarIndex = 2;
    }
  }

  async getChats() {
    try {
      return await fetch(environment.chatAPI.url + '/numberOfChats', {
        headers: {
          token: localStorage.getItem('session-token'),
        },
      }) 
    } catch (error) {
      console.log(error);
    }
  }

  userSwitchDialog(email: string) {
    this.bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: 'Bienvenido de vuelta, prefieres acceder:',
        options: [
          {
            value: 'Con mi clave provisional que es "123"',
            callback: () => {
              this.loginEmail = email;
              this.loginflow = true;
            }
          },
          {
            value: `Desde mi correo electronico (recibirás el acceso en ${email})`,
            callback: () => {
              this.loginEmail = email;
              this.magicLink = true;
              this.loginflow = true;
            }
          }
        ]
      }
    })
  }

  showRoleDialog() {
    let options : [
      {
        value:string, 
        callback: () => void,
         active?: boolean, 
         noSettings?: boolean
      }
    ] = [
      {
        value: `${this.merchantName? this.merchantName : this.merchantSlug? this.merchantSlug : this.headerService.user.name}`,
        callback: () => {},
        active: true,
      },
    ];
    if(this.headerService.user.roles.length > 0) {
      this.headerService.user.roles.forEach((role) => {
        if(role.code === 'ADMIN') {
          options.push({
            value: 'De Super Admin',
            callback: ()=> {}
          })
        }
      })
    }
    options.push({
      value: 'Crear un nuevo comercio',
      callback: () => {
        this.loginEmail = null;
        this.dialog.closeAll();
        console.log(this.loginflow)
        setTimeout(() => {
          this.loginflow = true;
        }, 1000)
      },
      noSettings: true,
    })
    let logins : any[] = JSON.parse(window.localStorage.getItem('logins'));
    if(logins) {
      logins.forEach((login) => {
        if(login.email !== this.headerService.user.email) {
          options.push({
            value: `${login.name}`,
            callback: () => {
              this.userSwitchDialog(login.email)
            }
          })
        }
      })
    }

    const dialogRef = this.dialog.open(SelectRoleDialogComponent, {
      data: {
        title: "Perfil de:",
        options,
        bottomLeft: {
          text: 'Cambiar de industria',
          callback: () => {
          }
        }
      }
    });
    dialogRef.afterClosed().subscribe((role) => {
      
    });
  }

  setRole(role: number) {
    this.curRole = role;
    switch (role) {
      case 0:
        this.tabIndex = 0;
        break;
      case 1:
        this.tabIndex = 1;
        break;
      case 2:
        this.tabIndex = 1;
        break;
      case 3:
        this.tabIndex = 0;
        break;
      default:
        this.tabIndex = 1;
        break;
    }
    this.isOpen = false;
  }

  shareDialog(store = false) {
    let data; 
    if(store) {
      let storeLink = `${this.URI}/ecommerce/${this.merchantSlug}/store`;
      data = {
        title: 'Comparte el Enlace de Ventas:',
        options: [
          {
            value: 'Copia',
            callback: () => {
              this.clipboard.copy(storeLink);
              this.snackbar.open('Enlace copiado', 'Cerrar', {
                duration: 3000,
              });
            },
          },
          {
            value: 'Comparte',
            callback: () => {
              this.ngNavigatorShareService.share({
                title: 'Compartir enlace de www.flores.club',
                url: `${storeLink}`,
              });
            },
          },
          {
            value: 'Descarga el QR',
            callback: () => {
              this.qrdata = storeLink;
              this.downloadQr();
            },
          },
        ],
        bottomLabel: 'Enlace: ' + storeLink,
      };
    } else {
      data = {
        title: 'Compartir enlace',
        options: [
          {
            value: 'Copiar enlace',
            callback: () => {
              this.clipboard.copy(this.link);
              this.snackbar.open('Enlace copiado', 'Cerrar', {
                duration: 3000,
              });
            },
          },
          {
            value: 'Compartir enlace',
            callback: () => {
              this.ngNavigatorShareService.share({
                title: 'Compartir enlace de www.flores.club',
                url: `${this.link}`,
              });
            },
          },
          {
            value: 'Enviar por WhatsApp',
            callback: () => {
              const message = `${this.link}`;
              window.location.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                message
              )}`;
            },
          },
          {
            value: 'Enviar por correo electrónico',
            callback: () => {
              window.location.href = `mailto:?body=${this.link}`;
            },
          },
          {
            value: 'Descargar QR',
            callback: () => {
              this.qrdata = this.link;
              this.downloadQr();
            },
          },
        ],
      };
    }
    const dialogRef = this.bottomSheet.open(OptionsMenuComponent, {
      data: data,
    });
  }

  showDialog() {
    const dialogRef = this.dialog.open(SpecialDialogComponent, {});
    const link = `${this.URI}/ecommerce/club-landing`;

    dialogRef.afterClosed().subscribe((role) => {
      if (!role) {
        // this.setRole(parseInt(role))
        return;
      }
      console.log(role);
      switch (role) {
        case '0':
          this.ngNavigatorShareService.share({
            title: '',
            url: `${link}`,
          });
          break;
        case '1':
          this.ngNavigatorShareService.share({
            title: '',
            url: `${link}`,
          });
          break;
        case '2':
          const message = `${link}`;
          const phone = '19188156444';
          window.location.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(
            message
          )}`;
          break;
        case '3':
          window.location.href = 'mailto:';
          break;
        default:
          break;
      }
    });
  }

  close() {
    // if (this.headerService.user) this.location.back();
    this.openNavigation = true;
  }

  openLaiaDialog() {
    this.bottomSheet.open(SignupChatComponent, {
      data: {
        login: () => {
          this.loginflow = true;
        },
        phone: () => {
          console.log('phone callback');
        },
        url: () => {
          console.log('url callback');
        },
      },
    });
  }

  openClubDialog() {
    this.bottomSheet.open(ClubDialogComponent, {
      data: {
        title: '',
        styles: {
          fullScreen: true,
        },
        tabIndex: this.tabIndex,
        callback: (e: number) => {
          this.tabIndex = e;
        },
      },
    });
  }
  openCompareDialog() {
    this.bottomSheet.open(CompareDialogComponent, {
      data: {
        title: '',
        styles: {
          fullScreen: true,
        },
        tabIndex: this.tabIndex,
        callback: (e: number) => {
          this.tabIndex = e;
        },
      },
    });
  }
  openMsgDialog() {
    const dialogRef = this.dialog.open(MessageDialogComponent, {});

    dialogRef.afterClosed().subscribe((role) => {
      if (!role) {
        // this.setRole(parseInt(role))
        return;
      }
      console.log(role);
    });
  }

  redirectToLink(link: any) {
    this.headerService.flowRouteForEachPage[link.linkName] = this.router.url;

    if (link.isDummy) {
      const message = `Hola, me interesa esta funcionalidad: ${link.text}`;
      const phone = '19188156444';
      window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
        message
      )}`;
      return;
    }

    this.headerService.flowRoute = this.headerService.buildURL(
      link.routerLink.join('/'),
      link.queryParams ? link.queryParams : null
    );

    this.router.navigate(link.routerLink, {
      queryParams: link.queryParams ? link.queryParams : {},
    });

    this.close();
  }

  goToReferrals() {
    if (!this.headerService.user) {
      this.loginflow = true;
    } else return this.router.navigate(['/admin/affiliate-referrals']);
  }

  enterClub() {
    if (!this.headerService.user) this.loginflow = true;
    else this.showDialog();
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
  }

  resetLoginDialog(event) {
    this.loginflow = false;
    this.changeDetectorRef.detectChanges();
    if (this.tabarIndex === 3 && this.headerService.user) {
      this.openLinkDialog();
    }
  }

  async openLinkDialog(merchant?: Merchant) {
    let slug;
    if (merchant) {
      slug = merchant.slug;
    } else {
      await this.merchantsService.merchantDefault().then((res) => {
        slug = res.slug;
      });
    }
    let link = `${this.URI}/ecommerce/club-landing?affiliateCode=${slug}`;
    console.log(link);
    let dialogData = {
      title: 'Gana dinero cada mes, recurrente y sin limites',
      bottomLabel: 'Tu enlace es: ' + link,
      options: [
        {
          value: 'Copiar enlace',
          callback: () => {
            this.clipboard.copy(link);
            this.snackbar.open('Enlace copiado', 'Cerrar', {
              duration: 3000,
            });
          },
        },
        {
          value: 'Comparte tu enlace',
          callback: () => {
            this.ngNavigatorShareService.share({
              title: 'Compartir enlace de www.flores.club',
              url: `${link}`,
            });
          },
        },
        {
          value: 'Descarga el QR',
          callback: () => {
            this.qrdata = link;
            this.downloadQr();
          },
        },
      ],
    };

    let dialogRef = this.bottomSheet.open(OptionsMenuComponent, {
      data: dialogData,
    });
    console.log(dialogRef);
  }

  downloadQr() {
    setTimeout(() => {
      const parentElement = this.qrcode.nativeElement.querySelector('img').src;
      let blobData = base64ToBlob(parentElement);
      if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
        //IE
        (window.navigator as any).msSaveOrOpenBlob(blobData, 'Landing QR Code');
      } else {
        // chrome
        const blob = new Blob([blobData], { type: 'image/png' });
        const url = window.URL.createObjectURL(blob);
        // window.open(url);
        const link = document.createElement('a');
        link.href = url;
        link.download = "Landing QR Code";
        link.click();
      }
    }, 1000)
  }
  async getMerchantDefault() {
    try {
      const merchantDefault: Merchant = await this.merchantsService.merchantDefault();
      this.merchant = merchantDefault._id;
      this.merchantSlug = merchantDefault.slug;
      this.merchantName = merchantDefault.name;
      this.merchantEmail = merchantDefault.email;
      this.orderService.ordersTotal(
        ['to confirm', 'completed'],
        this.merchant
      ).then((res) => {
        this.sales = res.length;
      })
      this.merchantsService.rolesPublic().then((res) => {
        console.log(res);
        this.roles = res;
      })
      if(merchantDefault.roles.length > 0) {
        console.log(merchantDefault.roles)
        this.merchantRole = merchantDefault.roles[0];
      }
    } catch (error) {
      console.log('error');
    }
  }

  async getSaleflowDefault() {
    try {
      const saleflowDefault: SaleFlow =
        await this.saleflowsService.saleflowDefault(this.merchant);
      this.saleflow = saleflowDefault;
      if(this.saleflow.status === 'open') {
        this.statusSwitch = true;
      } else {
        this.statusSwitch = false;
      }
    } catch (error) {
      console.log('error');
    }
  }

  async getReferrals() {
    try {
      const result = await this.affiliateService.affiliatePaginate(
        {
          findBy: {
            parent: this.merchant,
          },
        },
        new Date().toString()
      );

      this.referralsCount = result?.totalResults;
    } catch (error) {
      console.log(error);
    }
  }

  invite() {
    if (!this.headerService.user) {
      this.redirectionRoute = '/ecommerce/club-landing?tabarIndex=3';
      this.openLoginDialog();
    } else {
      this.openLinkDialog();
    }
  }

  openMemoriesLoginDialog() {
    this.redirectionRoute = '/ecommerce/club-landing?tabarIndex=2';
    this.loginflow = true;
  }

  goToLaiaTraining() {
    return this.router.navigate(['/ecommerce/laia-training']);
  }

  goToDashboard() {
    return this.router.navigate(['/admin/dashboard']);
  }

  goToOrders() {
    return this.router.navigate(['/admin/order-progress']);
  }

  openLoginDialog() {
    let dialogRef = this.dialog.open(FormComponent, {
      data: {
        title: { text: "🤑 Correo electronico que guardará el dinero:" },
        fields: [
          {
            name: 'email',
            placeholder: 'Escribe..',
            type: 'text',
            validations: [Validators.required, Validators.email],
          },
        ],
        buttonsTexts: {
          accept: 'Generar el enlace',
        },
      },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result.value.email) return;
      const exists = await this.authService.checkUser(result.value.email);
      if (exists) {
        let merchants = await this.merchantsService.merchants({ findBy: { owner: exists._id } });
        if (merchants.length > 0) {
          let defaultMerchant = merchants.find(merchant => merchant.default);
          if (defaultMerchant) {
            this.openLinkDialog(defaultMerchant);
          } else {
            this.openLinkDialog(merchants[0]);
          }
        } else {
          let merchant = await this.merchantsService.createMerchant({
            owner: exists._id,
          });
          console.log(merchant);
          this.openLinkDialog(merchant.createMerchant);
        }
      } else {
        let user = await this.authService.signup(
          { email: result.value.email, password: '123' },
          'none'
        );
        let merchant = await this.merchantsService.createMerchant({
          owner: user._id,
        });
        this.openLinkDialog(merchant.createMerchant);
      }
    });
  }

  buttonHandler() {
    if (!this.headerService.user) {
      this.loginflow = true;
    }
  }

  async getImg(e) {
      console.log("🚀 ~ file: club-landing.component.ts:707 ~ ClubLandingComponent ~ getImg ~ e:", e)
      const inputElement = e.target as HTMLInputElement;
      if (inputElement.files && inputElement.files[0]) {
        const selectedFile = inputElement.files[0];
        const toBase64 = selectedFile => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
      });
      const base64Data = await toBase64(selectedFile);
      this.filesService.setFile(base64Data);
      this.router.navigate(['/ecommerce/provider-items-editor']);
      }
  }
  
  isUserAdmin() {
    if (this.headerService?.user)
      return this.headerService.user?.roles?.some(
        (role) => role.code === 'ADMIN'
      );
    else return false;
  }

  goToAIMemoriesManagement() {
    this.router.navigate(['/ecommerce/laia-memories-management']);
  }

  goToChatsManagement() {
    this.router.navigate(['/admin/laia-chats']);
  }

  goToWizard() {
    return this.router.navigate(['/admin/wizard-training'], {
      queryParams: {
        triggerWhatsappClient: true
      }
    });
  }

  truncateString(word) {
    return truncateString(word, 12);
  }

  toggleStoreVisibility() {
    const input = {
      status: this.statusSwitch ? "closed" : "open"
    }

    this.saleflowsService
      .updateSaleflow(input, this.saleflow._id)
      .then(() => this.statusSwitch = !this.statusSwitch)
      .catch(error => {
        console.error(error);
        const message = 'Ocurrió un error al intentar cambiar la visibilidad de tu tienda, intenta más tarde'
        this.headerService.showErrorToast(message);
      })
  }

  openExhibitDialog() {
    const roleSwitch = async (role : number) => {
      console.log(this.merchantRole)
      console.log(this.roles)
      if(this.merchantRole) {
        await this.merchantsService.merchantRemoveRole(this.merchantRole._id, this.merchant).then((res)=> {
          console.log(res)
        })
        this.merchantsService.merchantAddRole(this.roles[role]._id, this.merchant).then((res)=> {
          console.log(res)
          console.log(this.roles[role])
          this.merchantRole = this.roles[role]
        })
      } else {
        this.merchantsService.merchantAddRole(this.roles[role]._id, this.merchant).then((res)=> {
          console.log(res)
          this.merchantRole = this.roles[role]
        })
      }
    }
    this.dialog.open(OptionsDialogComponent, {
      data: {
        title: '¿A quién le vendes?',
        options: [
          {
            value: 'Consumidor final',
            callback: () => {
              let index = this.roles.findIndex((role) => role.code === 'STORE')
              roleSwitch(index)
            }
          },
          {
            value: 'Floristerías',
            callback: () => {
              let index = this.roles.findIndex((role) => role.code === 'PROVIDER')
              roleSwitch(index)
            }
          },
          {
            value: 'Wholesalers',
            callback: () => {
              let index = this.roles.findIndex((role) => role.code === 'SUPPLIER')
              roleSwitch(index)
            }
          },
          {
            value: 'Fincas',
            callback: () => {
              let index = this.roles.findIndex((role) => role.code === 'PRODUCTOR')
              roleSwitch(index)
            }
          },
        ]
      }
    })
  }
}
