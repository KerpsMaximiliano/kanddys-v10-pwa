import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-proflora-link-dialog',
  templateUrl: './proflora-link-dialog.component.html',
  styleUrls: ['./proflora-link-dialog.component.scss']
})
export class ProfloraLinkDialogComponent {
  constructor(
    private _bottomSheetRef: MatBottomSheetRef
  ) { }

  tabProvider = [
    {
      text: "🌼 Vitrina Online de ComercioID",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
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
      text: "🛟 Cotizaciones de Artículos que pudiera comprar",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🏷️ Tienda con Artículos que pudiera comprar",
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
      text: "⚡️️ Ver ofertas flash que pudiera comprar",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🧞‍♂️‍️️️ Crea ofertas flash para vender",
      routerLink: ["/admin/supplier-dashboard"],
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
      routerLink: ["/admin/supplier-dashboard"],
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
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🛒 Carritos y cotizaciones de lo que vendo",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "📢 Mercado de Referencias",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "✨ Recompensas de Compradores",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🎁 Premios de seguidores que te mencionan",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "💰 Control, Beneficios e Impuestos",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "✋ Analiza las opiniones de los compradores",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "💚 Monetizaciones mensual invitando al Club ",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
  ]

  ngOnInit(): void {
    
    const element: HTMLElement = document.querySelector('.mat-bottom-sheet-container');

    element.style.maxHeight = 'unset';
    element.style.padding = '0px';
  }

  close() {
    this._bottomSheetRef.dismiss();
  }
}
