import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-description-dialog',
  templateUrl: './description-dialog.component.html',
  styleUrls: ['./description-dialog.component.scss'],
})
export class DescriptionDialogComponent implements OnInit {
  env: string = environment.assetsUrl;

  @Input() title: string =
    'Hola UserID, los formularios son para que el comprador te reesponda cosas que necesitas saber al vender ArticleID.';
  @Input() text1: string =
    '- Haces las preguntas para recolectar la información que necesitas.';
  @Input() text2: string =
    '- Accedes a las respuestas individuales y los reportes grupales (opciones de exportar la info recolectada).';
  @Input() text3: string =
    '- Opcional le haces un obsequio a cada formulario llenado (sin riesgo: solo un obsequio por email por email).';
  @Input() checkText1: string = 'Quiero regalarle un GiftCard.';
  @Input() checkText2: string = 'Quiero regalarle un Voucher de mi tienda.';

  constructor() {}

  ngOnInit(): void {}
}
