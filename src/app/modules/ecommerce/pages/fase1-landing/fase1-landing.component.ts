import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fase1-landing',
  templateUrl: './fase1-landing.component.html',
  styleUrls: ['./fase1-landing.component.scss'],
})
export class Fase1LandingComponent implements OnInit {
  env: string = environment.assetsUrl;

  cards = [
    {
      top: 'KIOSKEROS PROVEEDORES',
      mid: 'Utilizan WhatsApp para vender',
      bottom:
        'Recibe las facturadas generadas por tus compradores en tu WhatsApp',
      cta: '¡Conviértete en KiosKero Proveedor ahora!',
      callback: async () => {
        this.goTo();
      },
    },
    {
      top: 'KIOSKEROS PROVEEDORES',
      mid: 'Crean formularios para llenar las expectativas',
      bottom:
        'Personaliza las preguntas que responden tus compradores según tus artículos',
      cta: '¡Conviértete en KiosKero Proveedor ahora!',
      callback: async () => {
        this.goTo();
      },
    },
    {
      top: 'KIOSKEROS PROVEEDORES',
      mid: 'Notifican según el status',
      bottom:
        'Automatiza las notificaciones a los compradores según el status por whatsapp o email.',
      cta: '¡Conviértete en KiosKero Proveedor ahora!',
      callback: async () => {
        this.goTo();
      },
    },
    {
      top: 'KIOSKEROS PROVEEDORES',
      mid: 'Controlan y organizan lo vendido',
      bottom:
        'Manten organizado las factura según el progreso y status pos-ventas.',
      cta: '¡Conviértete en KiosKero Proveedor ahora!',
      callback: async () => {
        this.goTo();
      },
    },
    {
      top: 'KIOSKEROS PROVEEDORES',
      mid: 'Acceden a información valiosa',
      bottom:
        'Analiza el rendimiento de tus producto y ventas para optimizar las tácticas de las campañas de tu estrategia.',
      cta: '¡Conviértete en KiosKero Proveedor ahora!',
      callback: async () => {
        this.goTo();
      },
    },
    {
      top: 'KIOSKEROS PROVEEDORES',
      mid: 'Reciben los pagos directamente',
      bottom: 'Cobra por transferencia, tarjeta de crédito con azul y paypal.',
      cta: '¡Conviértete en KiosKero Proveedor ahora!',
      callback: async () => {
        this.goTo();
      },
    },
    {
      top: 'KIOSKEROS PROVEEDORES',
      mid: 'Asignan costos extras a las facturas',
      bottom:
        'Te permite cobrar adicional según la zona de entrega seleccionada por el comprador.',
      cta: '¡Conviértete en KiosKero Proveedor ahora!',
      callback: async () => {
        this.goTo();
      },
    },
    {
      top: 'KIOSKEROS PROVEEDORES',
      mid: 'Confirman el pago',
      bottom:
        'Automatiza el mensaje que confirma los pagos que recibes por transferencia',
      cta: '¡Conviértete en KiosKero Proveedor ahora!',
      callback: async () => {
        this.goTo();
      },
    },
    {
      top: 'KIOSKEROS PROVEEDORES',
      mid: 'Ofrecen mensajes virtuales',
      bottom:
        'Tus compradores tienen la opción de decir mas con fotos, videos y musica en sus mensajes de regalo.',
      cta: '¡Conviértete en KiosKero Proveedor ahora!',
      callback: async () => {
        this.goTo();
      },
    },
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  goTo() {
    this.router.navigate([`ecommerce/article-upload`]);
  }
}
