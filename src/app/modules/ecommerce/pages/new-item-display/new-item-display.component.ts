import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Item, ItemCategory, ItemPackage } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { WalletService } from 'src/app/core/services/wallet.service';
import { User } from 'src/app/core/models/user';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { Merchant } from 'src/app/core/models/merchant';
import { UsersService } from 'src/app/core/services/users.service';
import { StoreShareComponent, StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

@Component({
  selector: 'app-new-item-display',
  templateUrl: './new-item-display.component.html',
  styleUrls: ['./new-item-display.component.scss']
})
export class NewItemDisplayComponent implements OnInit {
  item: Item;
  shouldRedirectToPreviousPage: boolean = false;
  loggedIn: boolean = false;
  hasToken: boolean = false;
  isPreItem: boolean = false;
  newMerchant: boolean = false;
  providerView: boolean;
  mode: 'new-item' | 'edit';
  defaultMerchant: Merchant = null;
  buyersByItem: User[];
  totalByItem: any;
  isOwner: boolean;

  tagsData: Array<any> = ['', '', '', ''];

  categories: ItemCategory[] = [];
  tapped: boolean = false;
  env: string = environment.assetsUrl;
  user: User;
  canCreateBank: boolean;
  saleflow: SaleFlow = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private itemsService: ItemsService,
    private dialogService: DialogService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService,
    private walletService: WalletService,
    private usersService: UsersService,
    private headerService: HeaderService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.route.queryParams.subscribe(async queryParams => {
        const { token: magicLinkToken, mode } = queryParams;


        this.mode = mode;
        if (params.itemId) {
          lockUI();
          this.item = await this.itemsService.item(params.itemId);
          if (!this.item) return this.redirect();

          if ((this.item && !this.item.merchant) || (this.item && this.item.status === 'draft')) this.isPreItem = true;

          console.log(this.isPreItem);

          // this.item.images = null;
          // this.item.description = 'gdfgdfgdf';
          // this.item.content = ["fdsdfsdf", "ggggggggg"]

          this.shouldRedirectToPreviousPage = true;

          this.categories = this.item.category;

          if (localStorage.getItem('session-token')) {
            this.hasToken = true;
          }

          if (this.hasToken) {
            this.user = await this.authService.me();

            if (this.user) this.loggedIn = true;
            try {
              await this.checkBanks();              
            } catch (error) {
              console.log('hubo un error 1');
            }
          }
        }

        const myUser = await this.authService.me();

        console.log(myUser, mode);

        if (myUser && mode === 'new-item') {

          let defaultMerchant = null;

          try {
            console.log('one');
            defaultMerchant = await this.merchantService.merchantDefault();
          } catch (error) {
            console.log('hubo un error 2');
          }

          if (!defaultMerchant) {
            const merchants = await this.merchantService.myMerchants();

            if (merchants.length === 0) {
              const { createMerchant: createdMerchant } = await this.merchantService.createMerchant({
                owner: myUser._id,
                name: myUser.name + " mechant #" + Math.floor(Math.random() * 100000)
              });

              const { merchantSetDefault: defaultMerchant } = await this.merchantService.setDefaultMerchant(createdMerchant._id);

              if (this.isPreItem)
                await this.itemsService.authItem(defaultMerchant._id, params.itemId);

              const defaultSaleflow = await this.saleflowService.saleflowDefault(defaultMerchant?._id);

              if (!defaultSaleflow) {
                const { createSaleflow: createdSaleflow } = await this.saleflowService.createSaleflow({
                  merchant: defaultMerchant._id,
                  name: defaultMerchant._id + " saleflow #" + Math.floor(Math.random() * 100000),
                  items: []
                });

                const { saleflowSetDefault: defaultSaleflow } = await this.saleflowService.setDefaultSaleflow(defaultMerchant._id, createdSaleflow._id);
                this.saleflow = defaultSaleflow;

                this.saleflowService.createSaleFlowModule({
                  saleflow: createdSaleflow._id
                });

                await this.saleflowService.addItemToSaleFlow({
                  item: params.itemId
                }, defaultSaleflow._id);

                this.newMerchant = true;
              }
            } else {
              const { merchantSetDefault: defaultMerchant } = await this.merchantService.setDefaultMerchant(merchants[0]._id);

              if (this.isPreItem)
                await this.itemsService.authItem(defaultMerchant._id, params.itemId);

              const defaultSaleflow = await this.saleflowService.saleflowDefault(defaultMerchant?._id);

              if (!defaultSaleflow) {
                const saleflows = await this.saleflowService.saleflows(merchants[0]._id, {});

                if (!saleflows || saleflows.length === 0) {
                  const { createSaleflow: createdSaleflow } = await this.saleflowService.createSaleflow({
                    merchant: defaultMerchant._id,
                    name: defaultMerchant._id + " saleflow #" + Math.floor(Math.random() * 100000),
                    items: []
                  });

                  const { saleflowSetDefault: defaultSaleflow } = await this.saleflowService.setDefaultSaleflow(defaultMerchant._id, createdSaleflow._id);
                  this.saleflow = defaultSaleflow;

                  this.saleflowService.createSaleFlowModule({
                    saleflow: createdSaleflow._id
                  });

                  await this.saleflowService.addItemToSaleFlow({
                    item: params.itemId
                  }, defaultSaleflow._id);
                  this.newMerchant = true;
                } else {
                  const { saleflowSetDefault: defaultSaleflow } = await this.saleflowService.setDefaultSaleflow(defaultMerchant._id, saleflows[0]._id);
                  this.saleflow = defaultSaleflow;

                  await this.saleflowService.addItemToSaleFlow({
                    item: params.itemId
                  }, defaultSaleflow._id);
                  this.newMerchant = true;
                }
              } else {
                this.saleflow = defaultSaleflow;

                await this.saleflowService.addItemToSaleFlow({
                  item: params.itemId
                }, defaultSaleflow._id);

                this.newMerchant = true;
              }
            }
            unlockUI();
          } else {
            this.defaultMerchant = defaultMerchant;
            if (this.defaultMerchant?._id === this.item?.merchant?._id) this.isOwner = true;

            if (this.isPreItem)
              await this.itemsService.authItem(defaultMerchant._id, params.itemId);

            const defaultSaleflow = await this.saleflowService.saleflowDefault(defaultMerchant?._id);

            if (!defaultSaleflow) {

              const { createSaleflow: createdSaleflow } = await this.saleflowService.createSaleflow({
                merchant: defaultMerchant._id,
                name: defaultMerchant._id + " saleflow #" + Math.floor(Math.random() * 100000),
                items: []
              });

              const { saleflowSetDefault: defaultSaleflow } = await this.saleflowService.setDefaultSaleflow(defaultMerchant._id, createdSaleflow._id);

              this.saleflowService.createSaleFlowModule({
                saleflow: createdSaleflow._id
              });

              await this.saleflowService.addItemToSaleFlow({
                item: params.itemId
              }, defaultSaleflow._id);
              unlockUI();
              // this.router.navigate([`/ecommerce/merchant-dashboard/${defaultMerchant._id}/my-store`]);
              this.router.navigate([`/ecommerce/user-items`]);
            } else {
              await this.saleflowService.addItemToSaleFlow({
                item: params.itemId
              }, defaultSaleflow._id);
              unlockUI();
              // this.router.navigate([`/ecommerce/merchant-dashboard/${defaultMerchant._id}/my-store`]);
              this.router.navigate([`/ecommerce/user-items`]);
            }

            // const defaultSaleflow = await this.saleflowService.saleflowDefault(defaultMerchant?._id);        
          }
        } else {
          try {
            console.log('two');
            this.defaultMerchant = await this.merchantService.merchantDefault();
          } catch (error) {
            console.log('hubo un error 3');
          }

          if(!this.defaultMerchant) return unlockUI();;
          if (this.defaultMerchant._id === this.item?.merchant?._id) {
            this.isOwner = true;

            if(this.mode === 'edit') {
              this.providerView = true;
  
              await Promise.all([
                this.getTotalByItem(this.item._id),
                this.getBuyersByItem(this.item._id),
                this.getSaleflow(),
              ]);
            }
            unlockUI();
          }
        }

        // if (params.itemId && !magicLinkToken) {
        //   this.item = await this.itemsService.item(params.itemId);
        //   this.shouldRedirectToPreviousPage = true;

        //   if (!this.item) return this.redirect();

        //   if (localStorage.getItem('session-token')) {
        //     this.hasToken = true;
        //   }

        //   if (this.hasToken) {
        //     const myUser = await this.authService.me();

        //     if (myUser) this.loggedIn = true;
        //   }
        // }
        //  else {
        //   if (this.headerService.newTempItem) {
        //     this.item = this.headerService.newTempItem;
        //     this.shouldRedirectTo = this.headerService.newTempItemRoute;
        //   }
        // }
      });
    })
  }

  async checkBanks() {
    if (!this.loggedIn) return;
    const wallet = await this.walletService.exchangeDataByUser(this.user._id);
    if (!wallet) this.canCreateBank = true;
  }

  async getSaleflow() {
    try {
      this.saleflow = await this.saleflowService.saleflowDefault(this.defaultMerchant._id);
    } catch (error) {
      console.log(error);
    }
  }

  async getTotalByItem(itemID: string) {
    try {
      this.totalByItem = (await this.itemsService.totalByItem(this.defaultMerchant._id, [itemID]))[0];
    } catch (error) {
      console.log(error);
    }
  }

  async getBuyersByItem(itemID: string) {
    try {
      this.buyersByItem = (await this.usersService.buyersByItem(itemID))?.buyersByItem;
    } catch (error) {
      console.log(error);
    }
  }

  goToAuth() {
    this.router.navigate([`/ecommerce/authentication/${this.item._id}`]);
  }

  goToMerchantStore() {
    if (this.defaultMerchant)
      // this.router.navigate([`/ecommerce/merchant-dashboard/${this.defaultMerchant._id}/my-store`]);
      this.router.navigate([`/ecommerce/user-items`]);
  }

  goToBanksForm() {
    if (this.canCreateBank && this.saleflow) this.router.navigate([`/ecommerce/bank-registration/${this.saleflow._id}`]);
  }

  toggleActivateItem() {
    this.itemsService.updateItem({
      status: this.item.status === 'disabled' ? 'active' : 'disabled'
    }, this.item._id).catch((error) => {
      console.log(error);
      this.item.status = this.item.status === 'disabled' ? 'active' : 'disabled';
    })
    this.item.status = this.item.status === 'disabled' ? 'active' : 'disabled';
  }

  openShareDialog() {
    const list: StoreShareList[] = [
      {
        title:  'Mi item',
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `https://kanddys.com/ecommerce/item-detail/${this.saleflow._id}/${this.item._id}`
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `https://kanddys.com/ecommerce/item-detail/${this.saleflow._id}/${this.item._id}`,
            icon: {
              src: '/upload.svg',
              size: {
                width: 20,
                height: 26
              }
            }
          },
        ]
      }
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

  openImageModal(imageSourceURL: string) {
    this.dialogService.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  redirect() {
    unlockUI();
    if (!this.shouldRedirectToPreviousPage) {
      this.router.navigate([`ecommerce/error-screen/`], {
        queryParams: { type: 'item' },
      });
    } else {
      this.location.back();
    }
  }

  tapping(){
    let url = 'www.google.com';
    window.open(url, "_blank");
  }

  toggleView() {
    this.providerView = !this.providerView;
  }

}
