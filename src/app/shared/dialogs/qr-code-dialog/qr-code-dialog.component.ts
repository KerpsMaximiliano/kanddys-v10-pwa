import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-qr-code-dialog',
  templateUrl: './qr-code-dialog.component.html',
  styleUrls: ['./qr-code-dialog.component.scss'],
})
export class QrCodeDialogComponent implements OnInit {
  env: string = environment.assetsUrl;
  options: string[] = [
    'Descarga el qrCode del enlace',
    'Copia el enlace de este qrCode',
    'Menú de compartir',
  ];
  constructor() {}

  ngOnInit(): void {}
}
