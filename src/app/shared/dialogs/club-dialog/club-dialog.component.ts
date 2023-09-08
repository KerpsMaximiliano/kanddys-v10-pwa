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

@Component({
  selector: 'app-club-dialog',
  templateUrl: './club-dialog.component.html',
  styleUrls: ['./club-dialog.component.scss']
})
export class ClubDialogComponent implements OnInit {

  list = [
    "✨ Recompensas y Premios que me he ganado de las tiendas WeLike",
    "💰 Gestionar mis monetizaciones de lo que tengo guardado en mi 💚",
    "📦 Artículos que he comprado",
    "🛒 Artículos que estoy a punto de comprar",
    "🔗 “144 enlaces QR Flash” <br>Pegas el enlace y descargas el QR",
    "Colaboraciones haciendo videos tutoriales de las herramientas de www.floristerias.club"
  ]

  tabIndex = 0

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate,
    private _bottomSheetRef: MatBottomSheetRef
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
      this.list = [
        "✨ Recompensas y Premios que me he ganado de las tiendas WeLike",
        "💰 Gestionar mis monetizaciones de lo que tengo guardado en mi 💚",
        "📦 Artículos que he comprado",
        "🛒 Artículos que estoy a punto de comprar"
      ]
    }
    this.tabIndex = this.data.tabIndex
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

}
