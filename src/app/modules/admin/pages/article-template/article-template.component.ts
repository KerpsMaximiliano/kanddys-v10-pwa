import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { QrCodeDialogComponent } from 'src/app/shared/dialogs/qr-code-dialog/qr-code-dialog.component';
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
      img: 'merge-vertical.png',
      width: '22',
      height: '17',
    },
    {
      text: 'Crea un nuevo Símbolo (tu mismo adicionarás el contenido).',
      img: 'file-new.png',
      width: '22',
      height: '23',
    },
    {
      text: 'Comparte el enlace (para que otra persona adicione el contenido).',
      img: 'share-outline2.png',
      callback: () => this.handleDialog(),
      width: '21',
      height: '27',
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
    this._DialogService.open(QrCodeDialogComponent, {
      type: 'fullscreen-translucent',
      props: {},
    });
  }
}
