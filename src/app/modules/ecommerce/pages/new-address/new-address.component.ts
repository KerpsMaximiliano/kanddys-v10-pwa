import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DeliveryLocation } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AnswerIcon } from 'src/app/shared/components/answer-selector/answer-selector.component';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';

interface DeliveryDetails {
  status: boolean;
  value: string;
  description: string[];
  icons?: AnswerIcon[];
}

const dummyDeliveryOptions = [
  {
    status: true,
    value: 'fdsfsdfs',
    description: ['gfsfgfdgfd'],
  },
  {
    status: true,
    value: 'fdsfsdfs',
    description: ['gfsfgfdgfd'],
  },
  {
    status: true,
    value: 'fdsfsdfs',
    description: ['gfsfgfdgfd'],
  },
];

@Component({
  selector: 'app-new-address',
  templateUrl: './new-address.component.html',
  styleUrls: ['./new-address.component.scss'],
})
export class NewAddressComponent implements OnInit {
  constructor(
    private router: Router,
    private dialogService: DialogService,
    private headerService: HeaderService
  ) {}
  mode: 'normal' | 'delete' | 'edit' = 'normal';
  env = environment.assetsUrl;
  addresses: DeliveryLocation[];
  addressesOptions: DeliveryDetails[] = dummyDeliveryOptions;

  ngOnInit(): void {}

  onOpenDialog = () => {
    const list: StoreShareList[] = [
      {
        title: 'NAME ID',
        options: [
          {
            text: 'ADICIONAR',
            mode: 'func',
            func: () => {},
          },
          {
            text: 'EDITAR',
            mode: 'func',
            func: () => {
              this.mode = 'edit';
              this.addressesOptions.forEach((option) => {
                option.icons = [
                  { src: this.env + '/pencil.svg', callback: () => [] },
                ];
              });
            },
          },
          {
            text: 'BORRAR',
            mode: 'func',
            func: () => {
              this.mode = 'delete';
              this.addressesOptions.forEach((option) => {
                option.icons = [
                  { src: this.env + '/delete.svg', callback: () => [] },
                ];
              });
            },
          },
        ],
      },
    ];

    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  selectAddress(value: any) {
    console.log(value);
  }

  goBack() {
    if (this.mode !== 'normal') {
      this.mode = 'normal';
      this.addressesOptions.forEach((option) => (option.icons = null));
      return;
    }
    this.router.navigate(['/admin/merchant-items']);
  }
}
