import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-merchant-creator',
  templateUrl: './merchant-creator.component.html',
  styleUrls: ['./merchant-creator.component.scss']
})
export class MerchantCreatorComponent implements OnInit {

    env: string = environment.assetsUrl;
    merchantName: string = 'Sin Nombre';
    merchantDescription: string = 'Añade una pequeña descripción como tu Bio ';
    active: boolean = true;

  constructor() { }

  ngOnInit(): void {
  }

}
