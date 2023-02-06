import { Component, Input, OnInit } from '@angular/core';
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

  constructor() {}

  ngOnInit(): void {}
}
