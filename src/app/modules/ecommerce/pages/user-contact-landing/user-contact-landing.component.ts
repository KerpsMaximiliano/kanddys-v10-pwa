import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow, SocialMediaModel } from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { UsersService } from 'src/app/core/services/users.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { StoreShareComponent, StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';

const socialNames = [
  'linkedin',
  'twitter',
  'instagram',
  'tiktok',
  'web',
  'facebook',
]

@Component({
  selector: 'app-user-contact-landing',
  templateUrl: './user-contact-landing.component.html',
  styleUrls: ['./user-contact-landing.component.scss']
})
export class UserContactLandingComponent implements OnInit {
  URI: string = environment.uri;
  user: User;
  admin: boolean;
  merchant: Merchant;
  saleflow: SaleFlow;
  items: Item[] = [];
  ordersTotal: {
    total: number;
    length: number;
  };
  users: User[] = [];
  hasSocials: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private usersService: UsersService,
    private orderService: OrderService,
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    private dialogService: DialogService,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      lockUI();
      const [user, currentUser] = await Promise.all([
        this.usersService.user(params.id),
        this.authService.me(),
      ])
      if(!user) return unlockUI();
      this.user = user;
      if(user._id === currentUser?._id) this.admin = true;
      this.merchant = await this.merchantsService.merchantDefault(this.user._id);
      if(!this.merchant) return unlockUI();
      this.checkSocials(this.merchant.social);
      this.saleflow = await this.saleflowService.saleflowDefault(this.merchant._id);
      if(!this.saleflow) return unlockUI();
      if(this.admin) {
        const [total, users] = await Promise.all([
          this.orderService.ordersTotal(['completed', 'in progress', 'to confirm'], this.merchant._id),
          this.merchantsService.usersOrderMerchant(this.merchant._id),
          this.getItems()
        ]);
        this.ordersTotal = total;
        this.users = users;
      } else this.getItems();
      unlockUI();
    })
  }

  back() {
    this.location.back();
  }

  checkSocials(socials: SocialMediaModel[]) {
    if(!socials) return;
    if(socials.some((social) => socialNames.includes(social.name))) this.hasSocials = true;
  }

  async getItems() {
    try {
      this.items = (await this.saleflowService.listItems({
        findBy: {
          _id: {
            __in: ([] = this.saleflow.items?.slice(0,3).map((items) => items.item._id)),
          },
        },
      }))?.listItems;
    } catch (error) {
      console.log(error)
    }
  }

  async toggleShowItems() {
    const showItems = !this.merchant.showItems;
    try {
      this.merchant.showItems = showItems;
      await this.merchantsService.updateMerchant({
        showItems
      }, this.merchant._id);
    } catch (error) {
      console.log(error);
    }
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

  openCreateItemDialog() {
    const list: StoreShareList[] = [
      {
        title: 'WebApps Store',
        options: [
          {
            text: 'Vende Online y por WhatsApp',
            mode: 'func',
            func: () => this.router.navigate([`/ecommerce/item-creator`]),
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
