import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { SwiperOptions } from 'swiper';
import { environment } from 'src/environments/environment';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Location } from '@angular/common';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  OptionsDialogComponent,
  OptionsDialogTemplate,
} from 'src/app/shared/dialogs/options-dialog/options-dialog.component';
import { MerchantsService } from 'src/app/core/services/merchants.service';

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
  assetsFolder: string = environment.assetsUrl;
  URI: string = environment.uri;
  openNavigation: boolean = false;
  queryParamsSubscription: Subscription = null;
  routerParamsSubscription: Subscription = null;

  tabs: Array<Tabs> = [
    {
      text: 'Control',
      subTabs: [
        {
          text: 'Ordenes',
          active: true,
          content: [
            '“.. puedo ver el estado actualizado de cada orden desde mi celular”',
            '“.. la función de notificar a los clientes por WhatsApp o correo electrónico es una verdadera maravilla!”',
            '“¡Es como magia para mantener todo bajo control!”',
            '“.. me permite estar al tanto de cada orden de una manera que nunca imaginé”',
            '“.. puedo filtrar las facturas según su estado para priorizar lo que necesito atender primero”',
            '“.. es como tener a tu asistente personal siempre contigo”',
            '“.. puedo ver qué órdenes necesitan mi atención inmediata y cuáles están en camino”',
          ],
        },
        {
          text: 'Entregas',
          active: false,
          content: [
            '“.. puedo cobrar extra según la zona de entrega especificada por el comprador”',
            '“..  maximizo lo que cobro y me permite entregar mas lejos”',
            '“..  me muestra un enfoque estratégico de las entregas y eso me ayuda en la logística para entregar a tiempo”',
          ],
        },
        {
          text: 'Clientes',
          active: false,
          content: [
            '“.. los reportes que puedo exportar me ayudan a planificar y ejecutar campañas”',
            '“..  puedo dirigir mis mensajes a grupos específicos con información precisa basado en sus preferencias”',
            '“..  tener una visión clara de quiénes son mis compradores y qué quieren”',
          ],
        },
      ],
      active: false,
    },
    {
      text: 'Más Ventas',
      subTabs: [
        {
          text: '#hashtags',
          active: false,
          content: [
            '“.. asigno un simple #hashtag y, voilà, los interesados pueden dirigirse directamente a la compra desde cualquier red social”',
            '“.. es una manera genial de simplificar el proceso de compra desde las plataformas sociales”',
            '“.. convierto a los seguidores en compradores de manera rápida y sencilla”',
          ],
        },
        {
          text: 'Proveedores',
          active: true,
          content: [
            '“.. puedo acceder a una red amplia de proveedores de flores en un abrir y cerrar de ojos.”',
            '¡Esta función de Cotización Eficiente con Proveedores en la aplicación es como tener un equipo de compras personal a tu disposición!',
            '“.. es como si los proveedores compitieran por ofrecerme las mejores ofertas, lo cual me siento confiado de donde comprar”',
            '“.. me permite conectarme con un montón de proveedores y pedir cotizaciones en cuestión de minutos”',
            '“.. significa que puedo tomar decisiones más inteligentes y aumentar mis ganancias”',
            '“.. puedo pedir cotizaciones y luego simplemente comparar y elegir la opción más conveniente”',
            '“.. no solo ahorro dinero, sino que también ahorro tiempo al evitar largas negociaciones, realmente es un ganar-ganar”',
          ],
        },
        {
          text: 'Premios',
          active: false,
          content: [
            '“.. brindo incentivos a mis clientes, lo que realmente fomenta la fidelidad y la satisfacción”',
            '“.. el programa de recompensar su lealtad es simplemente brillante”',
            '“..  los premios no solo los mantiene contentos, sino que también crea un vínculo más sólido con nosotros”',
          ],
        },
      ],
      active: true,
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
  link: string = this.URI + '/ecommerce/club-landing';
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

  constructor(
    public headerService: HeaderService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private bottomSheet: MatBottomSheet,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      async ({ jsondata }) => {
        if (jsondata) {
          const { openNavigation } = JSON.parse(decodeURIComponent(jsondata));
          this.openNavigation = JSON.parse(openNavigation || 'false');
        }
      }
    );
  }

  close() {
    // if (this.headerService.user) this.location.back();
    if (this.headerService.user) this.openNavigation = true;
  }

  share() {
    this.ngNavigatorShareService.share({
      title: '',
      url: this.link,
    });
  }

  enterClub() {
    this.bottomSheet.open(OptionsMenuComponent, {
      data: {
        options: [
          {
            value: `Soy miembro`,
            callback: async () => {
              await this.openMagicLinkDialog();
            },
          },
          {
            value: `Quiero entrar como invitado`,
            callback: () => {
              this.openNavigation = true;
            },
          },
        ],
        styles: {
          fullScreen: true,
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
  }

  async openMagicLinkDialog() {
    let fieldsToCreateInEmailDialog: FormData = {
      title: {
        text: 'Correo Electrónico para guardarlo:',
      },
      buttonsTexts: {
        accept: 'Recibir el enlace con acceso',
        cancel: 'Cancelar',
      },
      containerStyles: {
        padding: '35px 23px 38px 18px',
      },
      hideBottomButtons: true,
      fields: [
        {
          name: 'magicLinkEmailOrPhone',
          type: 'email',
          placeholder: 'Escribe el correo electrónico..',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
          },
          styles: {
            gap: '0px',
          },
          bottomTexts: [
            {
              text: 'Este correo también sirve para accesar al Club y aprovechar todas las herramientas que se están creando.',
              styles: {
                color: '#FFF',
                fontFamily: 'InterLight',
                fontSize: '19px',
                fontStyle: 'normal',
                fontWeight: '300',
                lineHeight: 'normal',
                marginBottom: '28px',
                marginTop: '36px',
              },
            },
            {
              text: 'La promesa del Club es desarrollar funcionalidades que necesites.',
              styles: {
                color: '#FFF',
                fontFamily: 'InterLight',
                fontSize: '19px',
                fontStyle: 'normal',
                fontWeight: '300',
                lineHeight: 'normal',
                margin: '0px',
                padding: '0px',
              },
            },
          ],
          submitButton: {
            text: '>',
            styles: {
              borderRadius: '8px',
              background: '#87CD9B',
              padding: '6px 15px',
              color: '#181D17',
              textAlign: 'center',
              fontFamily: 'InterBold',
              fontSize: '17px',
              fontStyle: 'normal',
              fontWeight: '700',
              lineHeight: 'normal',
              position: 'absolute',
              right: '1px',
              top: '8px',
            },
          },
        },
      ],
    };

    const emailDialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateInEmailDialog,
      disableClose: true,
    });

    emailDialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result?.controls?.magicLinkEmailOrPhone.valid) {
        const emailOrPhone = result?.value['magicLinkEmailOrPhone'];
        const myUser = await this.authService.checkUser(emailOrPhone);
        const myMerchant = !myUser
          ? null
          : await this.merchantsService.merchantDefault(myUser._id);

        let optionsDialogTemplate: OptionsDialogTemplate = null;

        if (!myUser) {
          optionsDialogTemplate = {
            title:
              'Notamos que es la primera vez que intentas acceder con este correo, prefieres:',
            options: [
              {
                value:
                  'Empezar mi Membresía al Club con este correo electrónico',
                callback: async () => {
                  let fieldsToCreateInMerchantRegistrationDialog: FormData = {
                    buttonsTexts: {
                      accept: 'Confirmar mi correo',
                      cancel: 'Cancelar',
                    },
                    containerStyles: {
                      padding: '39.74px 17px 47px 24px',
                    },
                    fields: [
                      {
                        label: 'Nombre Comercial que verán tus compradores:',
                        name: 'merchantName',
                        type: 'text',
                        placeholder: 'Escribe el nombre comercial',
                        validators: [
                          Validators.pattern(/[\S]/),
                          Validators.required,
                        ],
                        inputStyles: {
                          padding: '11px 1px',
                        },
                      },
                      {
                        label:
                          'WhatsApp que recibirá las facturas que te mandarán los compradores:',
                        name: 'merchantPhone',
                        type: 'phone',
                        placeholder: 'Escribe el nombre comercial',
                        validators: [
                          Validators.pattern(/[\S]/),
                          Validators.required,
                        ],
                        inputStyles: {
                          padding: '11px 1px',
                        },
                      },
                    ],
                  };

                  const merchantRegistrationDialogRef = this.dialog.open(
                    FormComponent,
                    {
                      data: fieldsToCreateInMerchantRegistrationDialog,
                      disableClose: true,
                      panelClass: 'merchant-registration',
                    }
                  );

                  merchantRegistrationDialogRef
                    .afterClosed()
                    .subscribe(async (result: FormGroup) => {
                      if (
                        result?.controls?.merchantName.valid &&
                        result?.controls?.merchantPhone.valid
                      ) {
                        lockUI();

                        const merchantInput: Record<string, any> = {
                          name: result?.value['merchantName'],
                          phone: result?.value['merchantPhone'],
                        };

                        await this.authService.generateMagicLink(
                          emailOrPhone,
                          '/ecommerce/club-landing',
                          null,
                          'MerchantAccess',
                          {
                            jsondata: JSON.stringify({
                              openNavigation: true,
                              merchantInput,
                            }),
                          },
                          []
                        );

                        unlockUI();
                      }
                    });
                },
              },
              {
                value: 'Intentar con otro correo electrónico.',
                callback: async () => {
                  return this.openMagicLinkDialog();
                },
              },
              {
                value:
                  'Algo anda mal porque no es la primera vez que trato de acceder con este correo',
                callback: async () => {
                  this.sendWhatsappToAppOwner(emailOrPhone);
                },
              },
            ],
          };
        } else {
          optionsDialogTemplate = {
            title:
              'Bienvenido de vuelta ' +
              (myMerchant
                ? myMerchant.name
                : myUser.name || myUser.email || myUser.phone) +
              ', prefieres:',
            options: [
              {
                value: 'Prefiero acceder con la clave',
                callback: () => {
                  addPassword(emailOrPhone);
                },
              },
              {
                value: 'Prefiero recibir el enlace de acceso en mi correo',
                callback: async () => {
                  if (result?.controls?.magicLinkEmailOrPhone.valid) {
                    let emailOrPhone = result?.value['magicLinkEmailOrPhone'];

                    lockUI();

                    await this.authService.generateMagicLink(
                      emailOrPhone,
                      '/ecommerce/club-landing',
                      null,
                      'MerchantAccess',
                      {
                        jsondata: JSON.stringify({
                          openNavigation: true,
                        }),
                      },
                      []
                    );

                    unlockUI();
                  } else if (
                    result?.controls?.magicLinkEmailOrPhone.valid === false
                  ) {
                    unlockUI();
                    this.snackbar.open('Datos invalidos', 'Cerrar', {
                      duration: 3000,
                    });
                  }
                },
              },
              {
                value:
                  'Algo anda mal porque no es la primera vez que trato de acceder con este correo',
                callback: async () => {
                  this.sendWhatsappToAppOwner(emailOrPhone);
                },
              },
            ],
          };
        }

        this.dialog.open(OptionsDialogComponent, {
          data: optionsDialogTemplate,
          disableClose: true,
        });
      } else if (result?.controls?.magicLinkEmailOrPhone.valid === false) {
        unlockUI();
        this.snackbar.open('Datos invalidos', 'Cerrar', {
          duration: 3000,
        });
      }
    });

    const addPassword = async (emailOrPhone: string) => {
      emailDialogRef.close();

      let fieldsToCreate: FormData = {
        title: {
          text: 'Clave de Acceso:',
        },
        buttonsTexts: {
          accept: 'Accesar al Club',
          cancel: 'Cancelar',
        },
        fields: [
          {
            name: 'password',
            type: 'password',
            placeholder: 'Escribe la contraseña',
            validators: [Validators.pattern(/[\S]/)],
            bottomButton: {
              text: 'Prefiero recibir el correo con el enlace de acceso',
              callback: () => {
                //Cerrar 2do dialog

                return switchToMagicLinkDialog();
              },
            },
          },
        ],
      };

      const dialog2Ref = this.dialog.open(FormComponent, {
        data: fieldsToCreate,
        disableClose: true,
      });

      dialog2Ref.afterClosed().subscribe(async (result: FormGroup) => {
        try {
          if (result?.controls?.password.valid) {
            let password = result?.value['password'];

            lockUI();

            const session = await this.authService.signin(
              emailOrPhone,
              password,
              true
            );

            if (!session) throw new Error('invalid credentials');

            this.openNavigation = true;

            unlockUI();
          } else if (result?.controls?.password.valid === false) {
            unlockUI();
            this.snackbar.open('Datos invalidos', 'Cerrar', {
              duration: 3000,
            });
          }
        } catch (error) {
          unlockUI();
          console.error(error);
          this.headerService.showErrorToast();
        }
      });

      const switchToMagicLinkDialog = () => {
        dialog2Ref.close();
        return this.openMagicLinkDialog();
      };
    };
  }

  sendWhatsappToAppOwner(emailOrPhone: string) {
    let message =
      `Algo anda mal porque es la primera vez que trato de acceder con este correo: ` +
      emailOrPhone;

    const whatsappLink = `https://api.whatsapp.com/send?phone=19188156444&text=${encodeURIComponent(
      message
    )}`;

    window.location.href = whatsappLink;
  }

  changeTab(tabIndex: number) {
    this.tabs[tabIndex].active = true;
    this.activeTabIndex = tabIndex;

    this.tabs.forEach((tab, index) => {
      if (index !== tabIndex) tab.active = false;
    });
  }

  changeSubtab(tabIndex: number, subTabIndex: number) {
    this.tabs[tabIndex].subTabs[subTabIndex].active = true;

    this.tabs[tabIndex].subTabs.forEach((subTab, index) => {
      if (index !== subTabIndex) subTab.active = false;
    });
  }
}
