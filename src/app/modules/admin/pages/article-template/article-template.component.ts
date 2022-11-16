import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-article-template',
  templateUrl: './article-template.component.html',
  styleUrls: ['./article-template.component.scss'],
})
export class ArticleTemplateComponent implements OnInit {
  env: string = environment.assetsUrl;
  selected: string[] = [];
  list: any[] = [
    {
      text: 'Adjunta un Símbolo existente',
      img: '',
    },
    {
      text: 'Crea un nuevo Símbolo (tu mismo adicionarás el contenido).',
      img: '',
    },
    {
      text: 'Comparte el enlace (para que otra persona adicione el contenido).',
      img: '',
      callback: () => this.handleDialog(),
    },
  ];
  constructor(private _DialogService: DialogService) {}

  ngOnInit(): void {}

  handleOption(option: string): void {
    if (this.selected.includes(option))
      this.selected = this.selected.filter((opt) => opt !== option);
    else this.selected = [option];
  }

  handleDialog(): void {
    const list: StoreShareList[] = [
      {
        title: 'qrCode ID',
        options: [
          {
            text: 'Descarga el qrCode del enlace',
            mode: 'func',
            func: () => {},
          },
          {
            text: 'Copia el enlace de este qrCode',
            mode: 'func',
            func: () => {},
          },
          {
            text: 'Menú de cmpartir',
            mode: 'func',
            func: () => {},
          },
        ],
      },
    ];
    this._DialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
      },
    });
  }
}
