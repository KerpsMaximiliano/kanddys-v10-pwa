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

interface ReviewsSwiper {
  title: string;
  slides: Array<{
    content: string;
  }>;
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
  listOfFeatures: Array<{
    title: string;
    content: string;
  }> = [
    {
      title: 'Gestión de las Ordenes',
      content:
        'Mantén el control de las ordenes desde tu celular. Mira las ordenes según su estado y notificale a tus clientes por WhatsApp o correo electrónico.',
    },
    {
      title: 'Cotización Eficiente con Proveedores',
      content:
        'Accede a una amplia red de proveedores de flores y obtén cotizaciones para tus compras. Compara y elige la oferta más conveniente para ti, maximizando tus ganancias.',
    },
    {
      title: 'Gestión Simplificada de Compras',
      content:
        'Convierte las cotizaciones de los proveedores en compras con un solo clic, manteniendo un seguimiento detallado para optimizar tus beneficios.',
    },
    {
      title: 'Inteligencia Artificial',
      content:
        'una bot entrenada a tu floristería para ahorrarte tiempo a ti o a tu personal de servicio y ser consistentes en el mensaje que reciben tus clientes.',
    },
    {
      title: 'Ventas con #hashtag',
      content:
        'asigna un #hashtag a tus artículos para que desde el Bio de tu Instagram tus compradores aterricen directo a comprar.',
    },
    {
      title: 'Ventas por WhatsApp',
      content:
        'Sube tus productos fácilmente y vende directamente a través de WhatsApp. Conecta con tus clientes donde ya se encuentran.',
    },
    {
      title: 'Experiencia Mejorada para tus Clientes',
      content:
        'Permite a tus clientes añadir videos a sus mensajes dedicatorios, añadiendo un toque personal único a sus regalos.',
    },
    {
      title: 'Tarifas de Entrega Personalizadas',
      content:
        'Ajusta tus tarifas de entrega en función de la zona de entrega, maximizando tus ingresos.',
    },
    {
      title: 'Marketing Segmentado',
      content:
        'Cuenta con una base de datos segmentada de tus compradores, facilitándote la planificación de tus futuras campañas de marketing.',
    },
    {
      title: 'Compra Fácil para los Clientes',
      content:
        'Tus clientes pueden comprar tus productos sin necesidad de descargar ninguna aplicación, facilitándoles la experiencia de compra.',
    },
    {
      title: 'Recompensas para tus Clientes',
      content:
        'Ofrece incentivos a tus clientes para fomentar la fidelidad y satisfacción.',
    },
    {
      title: 'Venden por Ti',
      content:
        'Paga comisiones a influencers e instituciones que están recaudando fondos dependiendo de las ventas enlazadas.',
    },
    {
      title: 'Comunicación Efectiva',
      content:
        'Informa a tus clientes sobre el estado de su pedido a través de WhatsApp, proporcionando un servicio transparente y eficiente.',
    },
    {
      title: 'Giftcards de terceros',
      content:
        'Para que seas tu quien colabores y comisiones con spas, salones y restaurantes.',
    },
  ];
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
    private location: Location,
    private bottomSheet: MatBottomSheet,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private authService: AuthService,
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
        text: 'Acceso al Club:',
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

        let optionsDialogTemplate: OptionsDialogTemplate = {
          options: [
            {
              value: 'Accederé con la clave',
              callback: async () => {
                await addPassword(emailOrPhone);
              },
            },
            {
              value: 'Prefiero recibir el enlace de acceso en mi correo',
              callback: async () => {
                if (result?.controls?.magicLinkEmailOrPhone.valid) {
                  const validEmail = new RegExp(
                    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/gim
                  );

                  let emailOrPhone = null;

                  if (
                    typeof result?.value['magicLinkEmailOrPhone'] ===
                      'string' &&
                    validEmail.test(result?.value['magicLinkEmailOrPhone'])
                  ) {
                    emailOrPhone = result?.value['magicLinkEmailOrPhone'];
                  } else {
                    emailOrPhone =
                      result?.value['magicLinkEmailOrPhone'].e164Number.split(
                        '+'
                      )[1];
                  }

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

                  this.dialogService.open(
                    GeneralFormSubmissionDialogComponent,
                    {
                      type: 'centralized-fullscreen',
                      props: {
                        icon: 'check-circle.svg',
                        showCloseButton: false,
                        message:
                          'Se ha enviado un link mágico a tu correo electrónico',
                      },
                      customClass: 'app-dialog',
                      flags: ['no-header'],
                    }
                  );
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
          ],
        };

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

            if (session) this.openNavigation = true;

            unlockUI();
          } else if (result?.controls?.password.valid === false) {
            unlockUI();
            this.snackbar.open('Datos invalidos', 'Cerrar', {
              duration: 3000,
            });
          }
        } catch (error) {
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
}
