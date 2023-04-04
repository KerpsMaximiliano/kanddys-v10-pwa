import { Component, OnInit, Input } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

interface Benefits {
  title?: string;
  benefitsList?: {
    img?: {
      src: string;
      width?: number;
      height?: number;
      filter?: string;
    };
    text?: string;
    textStyles?: Record<string, string | number>;
  }[];
  bottomTitle?: string;
  bottomTitleStyles?: Record<string, string | number>;
  bottomText?: string;
  bottomTextStyles?: Record<string, string | number>;
}

interface HowItWorks {
  title?: string;
  listElement?: string[];
  listStyles?: Record<string, string | number>;
  extraTexts?: string[];
  textStyles?: Record<string, string | number>;
}

interface Symbols {
  title?: string;
  text?: string;
  textStyles?: Record<string, string | number>;
}

interface Actions {
  title?: string;
  text?: string[];
  textStyles?: Record<string, string | number>;
}

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss'],
})
export class InfoDialogComponent implements OnInit {
  @Input() header: string;
  // = 'El magneto para convertir en recurrentes a tus compradores. \n - Crea una relación a largo plazo.';
  @Input() benefits: Benefits;
  //  = {
  //   title: 'Beneficios',
  //   benefitsList: [
  //     {
  //       img: {
  //         src: '/creditCard.svg',
  //         width: 42,
  //         height: 38,
  //       },
  //       text: 'Sorprenderlos con detalles que tu competencia no sueña en hacer.',
  //     },
  //     {
  //       img: {
  //         src: '/document.svg',
  //         width: 32,
  //         height: 48,
  //       },
  //       text: 'Incentiva las ventas recurrentes. Los nuevos clientes son mas costosos.',
  //     },
  //     {
  //       img: {
  //         src: '/person.svg',
  //         width: 47,
  //         height: 40,
  //       },
  //       text: 'Incentiva las ventas recurrentes. Los nuevos clientes son mas costosos.',
  //     },
  //     {
  //       img: {
  //         src: '/person.svg',
  //         width: 47,
  //         height: 40,
  //       },
  //       text: 'Incentiva las ventas recurrentes. Los nuevos clientes son mas costosos.',
  //     },
  //   ],
  //   bottomText:
  //     'Tus compradores recurrentes forman el trampolín para saber si puedes crear una sucursal, hacer una inversión etc. \n - Invítalo a comprar a un precio exclusivo un artículo especifico.',
  // };
  @Input() howItWorks: HowItWorks;
  @Input() symbols: Symbols;
  // {
  //   title: 'Símbolos exhibidos en tu Tienda:',
  //   text: 'Potenciales Compradores ven todos los Símbolos que le pusiste un precio excepto: los invisibles, los que tienen clave y los que son por invitación.'
  // };
  @Input() actions: Actions;
  // = {
  //   title: 'Beneficios de esta acción:',
  //   text: ['Facilidad de vender, de cobrar y de organizar.']
  // };
  @Input() amount: string;
  //  = 'x';
  env: string = environment.assetsUrl;
  constructor(private ref: DialogRef) {}

  ngOnInit(): void {
    this.howItWorks;
    //  = {
    //   title: 'Como funciona:',
    //   listElement: [
    //     `Al comprador facturarte ${this.amount} veces`,
    //     'Tu recibes una notificación departe de nosotros que incluye el link de la plantilla.',
    //     'Tu haces TAP en el link de la plantilla y se abrirá tu WhatsApp con “la sorpresa” para que se la envies al comprador que premiarás.',
    //     'El conteo se reinicia cuando el comprador recibe “la sorpresa”.',
    //   ],
    //   extraTexts: [
    //     'Regálale uno de tus artículos junto a su próxima compra.',
    //     'Un mensaje de reconocimiento.',
    //   ],
    // };
  }

  close() {
    this.ref.close();
  }
}
