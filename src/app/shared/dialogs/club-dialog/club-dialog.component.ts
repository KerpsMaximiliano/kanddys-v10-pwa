import {
  Component,
  OnInit,
  ViewChildren,
  ElementRef,
  QueryList,
  Inject,
} from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { environment } from 'src/environments/environment';
import { HeaderService } from 'src/app/core/services/header.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SwiperOptions } from 'swiper';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { FormGroup, Validators } from '@angular/forms';
export interface DialogOptions {
  title: string;
  link?: string;
  icon?: string;
  callback: () => void;
}

export interface DialogSecondaryOptions {
  title: string;
  link?: string;
  callback: () => void;
}

export interface DialogTemplate {
  title: string;
  styles?: Record<string, Record<string, boolean>>;
  tabIndex: number;
  callback: (e: number) => void;
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
  selector: 'app-club-dialog',
  templateUrl: './club-dialog.component.html',
  styleUrls: ['./club-dialog.component.scss']
})
export class ClubDialogComponent implements OnInit {

  tabIndex = 0
  tabProvider = [
    {
      text: "🌼 Vitrina Online",
      routerLink: ["/ecommerce/supplier-items-selector"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: false,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🧾 Facturas",
      routerLink: ["/admin/order-progress"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "📢 Comisiones de quienes venden por mi",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: true,
      isShowDialog: false
    },
    {
      text: "🛟 Artículos que compro",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: true
    },
    {
      text: "⚡️️ Ofertas flash para comprar",
      routerLink: ["/admin/merchant-offers"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🧞‍♂️‍️️️ Crea ofertas flash para vender*",
      routerLink: ["/admin/items-offers"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "📦 Seguimiento de los pedidos",
      routerLink: ["/admin/order-progress"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "💸 Seguimiento del dinero por factura",
      routerLink: ["/"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: true,
      isShowDialog: false
    },
    {
      text: "🛒 Comparte una cotización de lo que vendes",
      routerLink: ["/"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: true,
      isShowDialog: false
    },
    {
      text: "✨ Recompensas de Compradores",
      routerLink: ["/"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: true,
      isShowDialog: false
    },
    {
      text: "🎁 Premios de seguidores que te mencionan",
      routerLink: ["/"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: true,
      isShowDialog: false
    },
    {
      text: "✋ Analiza las opiniones de los compradores",
      routerLink: ["/"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: true,
      isShowDialog: false
    },
    {
      text: "💚 Invita y monetiza cada mes",
      routerLink: ["/"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: true,
      isShowDialog: false
    },
  ]
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

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate,
    private _bottomSheetRef: MatBottomSheetRef,
    public headerService: HeaderService,
    private router: Router,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {}

  env: string = environment.assetsUrl;
  URI: string = environment.uri;
  

  ngOnInit(): void {
    if(this.data && this.data.styles && this.data.styles['fullScreen']) {
      const element: HTMLElement = document.querySelector('.mat-bottom-sheet-container');
      element.style.maxHeight = 'unset';
    }
    if (this.data.tabIndex) {
      console.log("tabIndex1")
    }
    this.tabIndex = this.data.tabIndex
  }

  redirectToLink(link: any) {
    this.headerService.flowRouteForEachPage[link.linkName] = this.router.url;

    if (link.isDummy) {
      const message = `Hola, me interesa esta funcionalidad: ${link.text}`;
      const phone = '19188156444';
      window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
      return;
    }

    this.headerService.flowRoute = this.headerService.buildURL(
      link.routerLink.join('/'),
      link.queryParams ? link.queryParams : null
    );

    this.router.navigate(link.routerLink, {
      queryParams: link.queryParams ? link.queryParams : {},
    });

    this._bottomSheetRef.dismiss();
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

  openLink(event?: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    if (event) event.preventDefault();
  }

  onClick(index: number) {
    this.data.callback(index)
    this.tabIndex = index
    this._bottomSheetRef.dismiss();
  }

  share() {
    if (!this.headerService.user) {
      this.openMagicLinkDialog()
    }
  }
  async openMagicLinkDialog() {
    let fieldsToCreateInEmailDialog: FormData = {
      title: {
        text: 'Correo Electrónico:',
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

    this.emailDialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateInEmailDialog,
      disableClose: false,
    });

    this.emailDialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result?.controls?.magicLinkEmailOrPhone.valid) {
        // const exists = await this.checkIfUserExists(result?.controls?.magicLinkEmailOrPhone.value);
        // if (exists) {
        //   await this.existingUserLoginFlow(
        //     result?.controls?.magicLinkEmailOrPhone.value,
        //     result?.controls?.magicLinkEmailOrPhone.valid
        //   );
        // } else {
        //   await this.nonExistingUserLoginFlow(
        //     result?.controls?.magicLinkEmailOrPhone.value,
        //     result?.controls?.magicLinkEmailOrPhone.valid
        //   );
        // }
      } else if (result?.controls?.magicLinkEmailOrPhone.valid === false) {
        this.snackbar.open('Datos invalidos', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

}
