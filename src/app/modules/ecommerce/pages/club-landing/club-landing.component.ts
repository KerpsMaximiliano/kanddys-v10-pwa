import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { SwiperOptions } from 'swiper';
import { environment } from 'src/environments/environment';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Location } from '@angular/common';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatIcon } from '@angular/material/icon';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { ClubDialogComponent } from 'src/app/shared/dialogs/club-dialog/club-dialog.component';
import { MessageDialogComponent } from 'src/app/shared/dialogs/message-dialog/message-dialog.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { PaginationInput } from 'src/app/core/models/saleflow';

import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  OptionsDialogComponent,
  OptionsDialogTemplate,
} from 'src/app/shared/dialogs/options-dialog/options-dialog.component';
import { MerchantsService } from 'src/app/core/services/merchants.service';

import { SelectRoleDialogComponent } from 'src/app/shared/dialogs/select-role-dialog/select-role-dialog.component';
import { SpecialDialogComponent } from 'src/app/shared/dialogs/special-dialog/special-dialog.component';

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

  isFlag = false;
  tabIndex = 0;
  userID = ""
  isVendor = false;
  isProvider = false;
  mainTitle = "HERRAMIENTAS GRATIS  PARA PROVEEDORES"
  isOpen = false;
  curRole = 0;

  tabContents = {
    tab1: [
      {
        text: "🛟 “Cotiza Flash” con Proveedores",
        subText: "Seleccionas, comparas y decides",
        routerLink: ["/ecommerce/supplier-items-selector"],
        linkName: "",
        queryParams: {},
        authorization: false,
        isDummy: false
      },
      {
        text: "🧞 “Ofertas Flash” de los Proveedores",
        subText: "Compra flores ideales para eventos cortos e inmediatos",
        routerLink: ["/"],
        linkName: "",
        queryParams: {},
        authorization: false,
        isDummy: true
      },
      {
        text: "📦 “Control Flash” de los pedidos",
        subText: "Sube la foto de la factura y ve cambiando el status según el progreso",
        routerLink: ["/admin/order-progress"],
        linkName: "",
        queryParams: {},
        authorization: true,
        isDummy: false
      },
      {
        text: "🧾 “Factura Flash” a tus compradores",
        subText: "Escribe fácilmente lo que te compraron para que lleves el control desde tu celular",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "📝 “Cotiza Flash” a tus compradores",
        subText: "Escribe fácilmente lo que potencialmente te compraran y potencialmente conviértela en factura.",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "🎁 “Premios Flash” para tus seguidores",
        subText: "Incentiva a quienes te mencionan en sus redes sociales",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "✨ “Recompensas Flash” para compradores",
        subText: "Fideliza a tus compradores con la foto de la factura que le emites",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "🙌 “Afiliación Flash” de membresía al Club",
        subText: "Comparte tu código ALGOID para ganar hasta $125 cada mes por cada invitado",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "🔗 “QR Flash” para guiarlos a donde necesites ",
        subText: "Pegas el enlace y descargas el QR",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "✋ “Opinión de Compradores”",
        subText: "Compradores reciben una encuesta que después que recibieron lo que compraron",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "Ir al enlace de Youtube donde hay muchos videos de como preparar arreglos florales",
        subText: "",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      }
    ],
    tab2: [
      {
        text: "🛟 “Cotizaciones Flash” con Proveedores",
        subText: "Seleccionas, comparas y decides",
        routerLink: ["/ecommerce/supplier-items-selector"],
        linkName: "",
        queryParams: {},
        authorization: false,
        isDummy: false
      },
      {
        text: "🧞 “Ofertas Flash” de los Proveedores",
        subText: "Compra flores ideales para eventos cortos e inmediatos",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "📦 “pedidos en Control Flash”",
        subText: "Sube la foto de la factura y ve cambiando el status según el progreso",
        routerLink: ["/admin/order-progress"],
        linkName: "",
        queryParams: {},
        authorization: true,
        isDummy: false
      },
      {
        text: "🛒 “Factura Flash” a tus compradores",
        subText: "Escribes fácilmente lo que te compraron para que lleves el control desde tu celular",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "🎁 “seguidores en Premios Flash”",
        subText: "Incentiva a quienes te mencionan en sus redes sociales",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "✨ “compradores en Recompensas Flash”",
        subText: "Fideliza a tus compradores con la foto de la factura que le emites",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "🙌 “códigos activos de Afiliación Flash”",
        subText: "Tu código ALGOID, ganas hasta $125 cada mes por cada invitado. Haz ganado $14,547.",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "🔗 “enlaces QR Flash”",
        subText: "Pegas el enlace y descargas el QR",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "✋ “opiniones de Compradores”",
        subText: "Encuesta que reciben después que recibieron lo que compraron",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "Ir al enlace de Youtube donde hay muchos videos de como preparar arreglos florales",
        subText: "",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
    ],
    tab3: [
      {
        text: "🛟 “Cotiza Flash” con Proveedores",
        subText: "Seleccionas, comparas y decides",
        routerLink: ["/ecommerce/supplier-items-selector"],
        linkName: "",
        queryParams: {},
        authorization: false,
        isDummy: false
      },
      {
        text: "🧞 “Ofertas Flash” para Miembros",
        subText: "Vende las flores ideales para eventos cortos e inmediatos",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "📦 “Control Flash” de los pedidos",
        subText: "Sube la foto de la factura y ve cambiando el status según el progreso",
        routerLink: ["/admin/order-progress"],
        linkName: "",
        queryParams: {},
        authorization: true,
        isDummy: false
      },
      {
        text: "🧾 “Factura Flash” a tus compradores",
        subText: "Selecciona lo que te compraron para que lleves el control desde tu celular",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "📝 “Cotiza Flash” a tus compradores",
        subText: "Selecciona lo que potencialmente te compraran y potencialmente conviértela en factura.",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "🎁 “Premios Flash” para tus seguidores",
        subText: "Incentiva a quienes te mencionan en sus redes sociales",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "✨ “Recompensas Flash” para compradores",
        subText: "Fideliza a tus compradores con la foto de la factura que le emites",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "🙌 “Afiliación Flash” de membresía al Club",
        subText: "Comparte tu código ALGOID para ganar hasta $125 cada mes por cada invitado",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "🔗 “QR Flash” para guiarlos a donde necesites ",
        subText: "Pegas el enlace y descargas el QR",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "✋ “Opinión de Compradores”",
        subText: "Compradores reciben una encuesta que después que recibieron lo que compraron",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "Ir al enlace de Youtube donde hay muchos videos de como preparar arreglos florales",
        subText: "",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      }
    ],
    tab4: [
      {
        text: "🛟 “Cotiza Flash” con Proveedores",
        subText: "Seleccionas, comparas y decides",
        routerLink: ["/ecommerce/supplier-items-selector"],
        linkName: "",
        queryParams: {},
        authorization: false,
        isDummy: false
      },
      {
        text: "🧞 “Ofertas Flash” para Miembros",
        subText: "Vende las flores ideales para eventos cortos e inmediatos",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "📦 “Control Flash” de los pedidos",
        subText: "Sube la foto de la factura y ve cambiando el status según el progreso",
        routerLink: ["/admin/order-progress"],
        linkName: "",
        queryParams: {},
        authorization: true,
        isDummy: false
      },
      {
        text: "🧾 “Factura Flash” a tus compradores",
        subText: "Selecciona lo que te compraron para que lleves el control desde tu celular",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "📝 “Cotiza Flash” a tus compradores",
        subText: "Selecciona lo que potencialmente te compraran y potencialmente conviértela en factura.",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "🎁 “Premios Flash” para tus seguidores",
        subText: "Incentiva a quienes te mencionan en sus redes sociales",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "✨ “Recompensas Flash” para compradores",
        subText: "Fideliza a tus compradores con la foto de la factura que le emites",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "🙌 “Afiliación Flash” de membresía al Club",
        subText: "Comparte tu código ALGOID para ganar hasta $125 cada mes por cada invitado",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "🔗 “QR Flash” para guiarlos a donde necesites ",
        subText: "Pegas el enlace y descargas el QR",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "✋ “Opinión de Compradores”",
        subText: "Compradores reciben una encuesta que después que recibieron lo que compraron",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      },
      {
        text: "Ir al enlace de Youtube donde hay muchos videos de como preparar arreglos florales",
        subText: "",
        routerLink: [""],
        linkName: "",
        queryParams: {},
        isDummy: true,
        authorization: false
      }
    ]
  }

  tabServices = [
    { 
      text: "🌼 Vitrina Online para exhibir lo que vendo*",
      routerLink: ["/ecommerce/provider-items"],
      linkName: "",
      queryParams: {},
      authorization: false,
      isDummy: false
    },
    { 
      text: "🛟 Artículos que compro",
      routerLink: ["/ecommerce/supplier-items-selector"],
      linkName: "",
      queryParams: {},
      authorization: false,
      isDummy: false
    },
    { 
      text: "⚡️️ Ofertas flash para comprar",
      routerLink: ["/admin/merchant-offers"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: false
    },
    { 
      text: "🧞‍♂️‍️️️ Crea ofertas flash para vender*",
      routerLink: ["/admin/items-offers"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: false
    },
    { 
      text: "📦 Seguimiento de los pedidos",
      routerLink: ["/admin/order-progress"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: false
    },
    { 
      text: "💸 Seguimiento del dinero por factura",
      routerLink: ["/"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: true
    },
    { 
      text: "🛒 Comparte una cotización de lo que vendes",
      routerLink: ["/"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: true
    },
    { 
      text: "✨ Fideliza a compradores con recompensas",
      routerLink: ["/"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: true
    },
    { 
      text: "🎁 Premia a los seguidores que te mencionan",
      routerLink: ["/"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: true
    },
    { 
      text: "✋ Analiza las opiniones de los compradores",
      routerLink: ["/"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: true
    },
    { 
      text: "💚 Invita y monetiza cada mes",
      routerLink: ["/"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: true
    },
  ]

  tabVendor = [
    {
      text: "🌼 Lo que vendo",
      routerLink: ["/admin/dashboard"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: false
    },
    {
      text: "📦 Control Flash",
      routerLink: ["/admin/order-progress"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: false
    },
    // {
    //   text: "💰 Mis beneficios",
    //   routerLink: ["/ecommerce/supplier-items-selector"],
    //   linkName: "",
    //   queryParams: {},
    //   authorization: true,
    //   isDummy: false
    // },
    // {
    //   text: "🧾 Facturas Flash",
    //   routerLink: ["/ecommerce/supplier-items-selector"],
    //   linkName: "",
    //   queryParams: {},
    //   authorization: false,
    //   isDummy: false
    // },
    // {
    //   text: "📝 Cotizaciones Flash",
    //   routerLink: ["/ecommerce/supplier-items-selector"],
    //   linkName: "",
    //   queryParams: {},
    //   authorization: false,
    //   isDummy: false
    // },
    // {
    //   text: "📢 Comisiones de quienes venden por mi",
    //   routerLink: ["/ecommerce/supplier-items-selector"],
    //   linkName: "",
    //   queryParams: {},
    //   authorization: false,
    //   isDummy: false
    // },
  ]

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

  emailDialogRef: MatDialogRef<FormComponent, any> = null;

  constructor(
    public headerService: HeaderService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private bottomSheet: MatBottomSheet,
    private itemsService: ItemsService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      async ({ jsondata }) => {
        if (jsondata) {
          const { openNavigation } = JSON.parse(decodeURIComponent(jsondata));
          this.openNavigation = JSON.parse(openNavigation || false);
        }
      }
    );
    lockUI()
    setTimeout(() => {
      unlockUI()
    }, 6000);
    const me = await this.authService.me()
    this.userID = me?.name || me?.email || me?.phone;
    if (this.userID) {
      const merchant = await this.merchantsService.merchantDefault();
      console.log(merchant)
      if (merchant?._id) {
        const supplier_pagination: PaginationInput = {
          findBy: {
            type: "supplier",
            merchant: merchant._id
          },
          options: {
            sortBy: 'createdAt:desc',
            limit: 1
          },
        };
        let supplier: Array<any> = [];
        supplier =(await this.itemsService.listItems(supplier_pagination))?.listItems;
    
        const vendor_pagination: PaginationInput = {
          findBy: {
            type: ["default", null],
            merchant: merchant._id
          },
          options: {
            sortBy: 'createdAt:desc',
            limit: 1
          },
        };
        let vendor: Array<any> = [];
        vendor =(await this.itemsService.listItems(vendor_pagination))?.listItems;
    
        if (supplier.length) {
          this.isProvider = true
          this.tabIndex = 1
        }
        if (vendor.length) {
          this.isVendor = true
          this.tabIndex = 0
        }
        // console.log(supplier)
        // console.log(vendor)
      }
    } else {
      // Borrar de cada tab los tabs que tienen authorize true
      this.tabContents.tab1 = this.tabContents.tab1.filter(tab => !tab.authorization);
      this.tabContents.tab2 = this.tabContents.tab2.filter(tab => !tab.authorization);
      this.tabContents.tab3 = this.tabContents.tab3.filter(tab => !tab.authorization);
      this.tabContents.tab4 = this.tabContents.tab4.filter(tab => !tab.authorization);
    }
    unlockUI()
  }

  showRoleDialog() {
    const dialogRef = this.dialog.open(SelectRoleDialogComponent, {});
    dialogRef.afterClosed().subscribe(role => {
      if (role != undefined) {
        this.setRole(parseInt(role))
        return
      }
      switch (role) {
        case "0":
          
          break;
        case "1":
          
          break;
        case "2":
          
          break;
        case "3":
          
          break;
        case "4":
        
          break;
        case "5":
        
          break;
      
        default:
          break;
      }
    });
  }

  setRole(role: number) {
    this.curRole = role;
    switch (role) {
      case 0:
        this.tabIndex = 0
        break;
      case 1:
        this.tabIndex = 1
        break;
      case 2:
        this.tabIndex = 1
        break;
      case 3:
        this.tabIndex = 0
        break;  
      default:
        this.tabIndex = 1;
        break;
      }
      this.isOpen = false;
  }

  showDialog() {
    const dialogRef = this.dialog.open(SpecialDialogComponent, {});
    const link = `${this.URI}/ecommerce/club-landing`;

    dialogRef.afterClosed().subscribe(role => {
      if (role != undefined) {
        this.setRole(parseInt(role))
        return
      }
      switch (role) {
        case "0":
          this.ngNavigatorShareService.share({
            title: '',
            url: `${link}?view=assistant`,
          });
          break;
        case "1":
          this.ngNavigatorShareService.share({
            title: '',
            url: `${link}?view=delivery`,
          });
          break;
        case "2":
          const message = `Hola, me interesa esta funcionalidad: `;
          const phone = '19188156444';
          window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
          break;
        case "3":
          window.location.href = "mailto:"
          break;
        case "4":
        
          break;
        case "5":
        
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

  openClubDialog() {
    this.bottomSheet.open(ClubDialogComponent, {
      data: {
        title: "",
        styles: {
          fullScreen: true,
        },
        tabIndex: this.tabIndex,
        callback: (e: number) => {
          this.tabIndex = e;
        }
      },
    });
  }
  openMsgDialog() {
    this.bottomSheet.open(MessageDialogComponent, {});
  }

  filterData () {
    if (this.headerService.user) {
      if (this.tabIndex==1) return this.tabContents.tab4
      if (this.tabIndex==0) return this.tabContents.tab2
    }
    else {
      if (this.tabIndex==1) return this.tabContents.tab3
      if (this.tabIndex==0) return this.tabContents.tab1
    }
    if (this.tabIndex==1) this.mainTitle = "HERRAMIENTAS GRATIS  PARA PROVEEDORES"
    if (this.tabIndex==0) this.mainTitle = "HERRAMIENTAS GRATIS FACILES DE USAR"
    return this.tabContents.tab3
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

    this.close();
  }

  share() {
    if (!this.headerService.user) {
      this.openMagicLinkDialog()
    }
  }

  enterClub() {
    if(!this.headerService.user) this.openMagicLinkDialog();
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
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
        const exists = await this.checkIfUserExists(result?.controls?.magicLinkEmailOrPhone.value);
        if (exists) {
          await this.existingUserLoginFlow(
            result?.controls?.magicLinkEmailOrPhone.value,
            result?.controls?.magicLinkEmailOrPhone.valid
          );
        } else {
          await this.nonExistingUserLoginFlow(
            result?.controls?.magicLinkEmailOrPhone.value,
            result?.controls?.magicLinkEmailOrPhone.valid
          );
        }
      } else if (result?.controls?.magicLinkEmailOrPhone.valid === false) {
        this.snackbar.open('Datos invalidos', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  private async checkIfUserExists(emailOrPhone: string) {
    try {
      lockUI();
      const exists = await this.authService.checkUser(emailOrPhone);
      unlockUI();
      return exists;
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  private async addPassword (emailOrPhone: string) {
      this.emailDialogRef.close();


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

  private async existingUserLoginFlow(credentials: any, isFormValid: boolean) {
    const emailOrPhone = credentials;

    let optionsDialogTemplate: OptionsDialogTemplate = {
      // TODO - Validar si es correo o telefono (actualmente se da por entendido que es solo correo)
      title: `Bienvenido de vuelta ${credentials}, prefieres:`,
      options: [
        {
          value: 'Prefiero acceder con la clave',
          callback: async () => {
            await this.addPassword(emailOrPhone);
          },
        },
        {
          value: 'Prefiero recibir el enlace de acceso en mi correo',
          callback: async () => {
            if (isFormValid) {
              const validEmail = new RegExp(
                /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/gim
              );

              let emailOrPhone = null;

              if (
                typeof credentials ===
                  'string' &&
                validEmail.test(credentials)
              ) {
                emailOrPhone = credentials;
              } else {
                emailOrPhone =
                  credentials.e164Number.split(
                    '+'
                  )[1];
              }

              // lockUI();

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
              isFormValid === false
            ) {
              unlockUI();
              this.snackbar.open('Datos invalidos', 'Cerrar', {
                duration: 3000,
              });
            }
          },
        },
        {
          value: 'Algo anda mal porque es la primera vez que trato de acceder con este correo',
          callback: () => {
            const phone = '19188156444';
            const message = 'Algo anda mal porque es la primera vez que trato de acceder con este correo';
            window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
          }
        }
      ],
    };

    this.dialog.open(OptionsDialogComponent, {
      data: optionsDialogTemplate,
      disableClose: true,
    });
  }

  private async nonExistingUserLoginFlow(credentials: any, isFormValid: boolean) {
    const emailOrPhone = credentials;

    let optionsDialogTemplate: OptionsDialogTemplate = {
      title: `Notamos que es la primera vez que intentas acceder con este correo, prefieres:`,
      options: [
        {
          value: 'Empezar mi Membresía al Club con este correo electrónico',
          callback: async () => {
            this.typeOfMerchantFlow(credentials);
          },
        },
        {
          value: 'Intentar con otro correo electrónico.',
          callback: async () => {
            await this.openMagicLinkDialog();
          },
        },
        {
          value: 'Algo anda mal porque no es la primera vez que trato de acceder con este correo',
          callback: () => {
            const phone = '19188156444';
            const message = 'Algo anda mal porque no es la primera vez que trato de acceder con este correo';
            window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
          }
        }
      ],
    };

    this.dialog.open(OptionsDialogComponent, {
      data: optionsDialogTemplate,
      disableClose: true,
    });
  }

  private typeOfMerchantFlow(credentials: any) {
    let optionsDialogTemplate: OptionsDialogTemplate = {
      title: `¿Qué tipo de comercio tienes?`,
      options: [
        {
          value: 'Soy tienda, vendo al consumidor final',
          callback: async () => {
            return this.router.navigate(
              ['/ecommerce/merchant-register'],
              {
                queryParams: {
                  credentials: credentials,
                  type: 'vendor',
                }
              }
            );
            // await this.registeringUserFlow(credentials);
          },
        },
        {
          value: 'Soy proveedor, le vendo a tiendas',
          callback: async () => {
            return this.router.navigate(
              ['/ecommerce/merchant-register'],
              {
                queryParams: {
                  credentials: credentials,
                  type: 'supplier',
                }
              }
            );
            // await this.registeringUserFlow(credentials);
          },
        },
      ],
    };

    this.dialog.open(OptionsDialogComponent, {
      data: optionsDialogTemplate,
      disableClose: true,
    });
  }

  private async registeringUserFlow(credentials: any) {
    let fieldsToCreateInEmailDialog: FormData = {
      // title: {
      //   text: 'Acceso al Club:',
      // },
      buttonsTexts: {
        accept: 'Guardar mis datos comerciales',
        cancel: 'Cancelar',
      },
      containerStyles: {
        padding: '35px 23px 38px 18px',
      },
      fields: [
        {
          label: 'Nombre Comercial:',
          name: 'name',
          type: 'text',
          placeholder: 'Escribe el nombre comercial..',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
          },
        },
        {
          label: 'WhatsApp donde tus compradores te contactan:',
          name: 'phone',
          type: 'phone',
          placeholder: 'Escribe el teléfono..',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
          },
        },
        {
          label: 'País y ciudades donde tus compradores reciben lo que te compran:',
          name: 'country',
          type: 'text',
          placeholder: 'Escribe el teléfono..',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
          },
        },
        {
          label: 'Industria de tu comercio:',
          name: 'industry',
          type: 'text',
          placeholder: 'Escribe el teléfono..',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
          },
        },
      ],
    };

    this.emailDialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateInEmailDialog,
      disableClose: true,
    });

    // TODO - Capturar el evento de cerrar el dialogo y hacer el flujo de registro
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
