import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { UsersService } from 'src/app/core/services/users.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { StoreShareComponent, StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-contact-landing',
  templateUrl: './user-contact-landing.component.html',
  styleUrls: ['./user-contact-landing.component.scss']
})
export class UserContactLandingComponent implements OnInit {
  URI: string = environment.uri;
  user: User;
  merchant: Merchant;
  saleflow: SaleFlow;
  items: Item[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    private dialogService: DialogService,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      lockUI();
      this.user = await this.usersService.user(params.id);
      if(!this.user) return unlockUI();
      this.merchant = await this.merchantsService.merchantDefault(this.user._id);
      if(!this.merchant) return unlockUI();
      this.saleflow = await this.saleflowService.saleflowDefault(this.merchant._id);
      if(!this.saleflow) return unlockUI();
      this.items = (await this.saleflowService.listItems({
        findBy: {
          _id: {
            __in: ([] = this.saleflow.items?.slice(0,3).map((items) => items.item._id)),
          },
        },
      }))?.listItems;
      unlockUI();
    })
  }

  back() {
    this.location.back();
  }

  openShareDialog() {
    const list: StoreShareList[] = [
      {
        qrlink: `${this.URI}/ecommerce/megaphone-v3/${this.saleflow._id}`,
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}/ecommerce/megaphone-v3/${this.saleflow._id}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}/ecommerce/megaphone-v3/${this.saleflow._id}`,
          },
          {
            text: 'Descarga el qrCode',
            mode: 'qr',
            link: `${this.URI}/ecommerce/megaphone-v3/${this.saleflow._id}`,
          },
          {
            text: 'Ir a la vista del visitante',
            mode: 'func',
            func: () => this.router.navigate([`/ecommerce/megaphone-v3/${this.saleflow._id}`]),
          },
        ]
      },
    ]
    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

}
