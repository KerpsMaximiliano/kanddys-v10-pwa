import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Item, ItemPackage } from 'src/app/core/models/item';
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

@Component({
  selector: 'app-new-item-display',
  templateUrl: './new-item-display.component.html',
  styleUrls: ['./new-item-display.component.scss']
})
export class NewItemDisplayComponent implements OnInit {
  @Input() item: Item;
  shouldRedirectToPreviousPage: boolean = false;
  loggedIn: boolean = false;
  hasToken: boolean = false;
  isPreItem: boolean = false;

  isOwner: boolean = true;

  tagsData: Array<any> = ['', '', '', ''];

  tapped: boolean = false;

  env: string = environment.assetsUrl;
  user: User;
  canCreateBank: boolean;
  saleflow: SaleFlow;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private itemsService: ItemsService,
    private dialogService: DialogService,
    private merchantService: MerchantsService,
    private itemService: ItemsService,
    private saleflowSarvice: SaleFlowService,
    private walletService: WalletService,
    private headerService: HeaderService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.route.queryParams.subscribe(async queryParams => {
        const { token: magicLinkToken, mode } = queryParams;

        if (params.itemId) {
          this.item = await this.itemsService.item(params.itemId);
          if (this.item && !this.item.merchant) this.isPreItem = true;

          this.shouldRedirectToPreviousPage = true;

          if (!this.item) return this.redirect();

          if (localStorage.getItem('session-token')) {
            this.hasToken = true;
          }

          if (this.hasToken) {
            this.user = await this.authService.me();

            if (this.user) this.loggedIn = true;
            this.checkBanks();
          }
        }

        if (magicLinkToken) {
          const { analizeMagicLink: session } =
            await this.authService.analizeMagicLink(magicLinkToken);

          if (session.token && session.user.phone && mode === 'new-item') {
            localStorage.setItem('session-token', session.token);

            const defaultMerchant = await this.merchantService.merchantDefault();

            if (!defaultMerchant) {
              const merchants = await this.merchantService.myMerchants();

              if (merchants.length === 0) {
                const { createMerchant: createdMerchant } = await this.merchantService.createMerchant({
                  owner: session.user._id,
                  name: session.user.name + " mechant #" + Math.floor(Math.random() * 100000)
                });

                const { merchantSetDefault: defaultMerchant } = await this.merchantService.setDefaultMerchant(createdMerchant._id);

                if (this.isPreItem)
                  await this.itemService.authItem(defaultMerchant._id, params.itemId);

                const defaultSaleflow = await this.saleflowSarvice.saleflowDefault(defaultMerchant?._id);

                if (!defaultSaleflow) {
                  const { createSaleflow: createdSaleflow } = await this.saleflowSarvice.createSaleflow({
                    merchant: defaultMerchant._id,
                    name: defaultMerchant._id + " saleflow #" + Math.floor(Math.random() * 100000),
                    items: []
                  });

                  const { saleflowSetDefault: defaultSaleflow } = await this.saleflowSarvice.setDefaultSaleflow(defaultMerchant._id, createdSaleflow._id);

                  this.saleflowSarvice.createSaleFlowModule({
                    saleflow: createdSaleflow._id
                  });

                  const result = await this.saleflowSarvice.addItemToSaleFlow({
                    item: params.itemId
                  }, defaultSaleflow._id);

                  this.router.navigate([`/ecommerce/merchant-dashboard/${defaultMerchant._id}/my-store`]);
                }
              } else {
                const { merchantSetDefault: defaultMerchant } = await this.merchantService.setDefaultMerchant(merchants[0]._id);

                if (this.isPreItem)
                  await this.itemService.authItem(defaultMerchant._id, params.itemId);

                const defaultSaleflow = await this.saleflowSarvice.saleflowDefault(defaultMerchant?._id);

                if (!defaultSaleflow) {
                  const saleflows = await this.saleflowSarvice.saleflows(merchants[0]._id, {});

                  if (!saleflows || saleflows.length === 0) {
                    const { createSaleflow: createdSaleflow } = await this.saleflowSarvice.createSaleflow({
                      merchant: defaultMerchant._id,
                      name: defaultMerchant._id + " saleflow #" + Math.floor(Math.random() * 100000),
                      items: []
                    });

                    const { saleflowSetDefault: defaultSaleflow } = await this.saleflowSarvice.setDefaultSaleflow(defaultMerchant._id, createdSaleflow._id);

                    this.saleflowSarvice.createSaleFlowModule({
                      saleflow: createdSaleflow._id
                    });

                    await this.saleflowSarvice.addItemToSaleFlow({
                      item: params.itemId
                    }, defaultSaleflow._id);

                    this.router.navigate([`/ecommerce/merchant-dashboard/${defaultMerchant._id}/my-store`]);

                  } else {
                    const { saleflowSetDefault: defaultSaleflow } = await this.saleflowSarvice.setDefaultSaleflow(defaultMerchant._id, saleflows[0]._id);

                    await this.saleflowSarvice.addItemToSaleFlow({
                      item: params.itemId
                    }, defaultSaleflow._id);

                    this.router.navigate([`/ecommerce/merchant-dashboard/${defaultMerchant._id}/my-store`]);
                  }
                } else {
                  await this.saleflowSarvice.addItemToSaleFlow({
                    item: params.itemId
                  }, defaultSaleflow._id);

                  this.router.navigate([`/ecommerce/merchant-dashboard/${defaultMerchant._id}/my-store`]);
                }
              }
            } else {
              if (this.isPreItem)
                await this.itemService.authItem(defaultMerchant._id, params.itemId);

              const defaultSaleflow = await this.saleflowSarvice.saleflowDefault(defaultMerchant?._id);

              if (!defaultSaleflow) {

                const { createSaleflow: createdSaleflow } = await this.saleflowSarvice.createSaleflow({
                  merchant: defaultMerchant._id,
                  name: defaultMerchant._id + " saleflow #" + Math.floor(Math.random() * 100000),
                  items: []
                });

                const { saleflowSetDefault: defaultSaleflow } = await this.saleflowSarvice.setDefaultSaleflow(defaultMerchant._id, createdSaleflow._id);

                this.saleflowSarvice.createSaleFlowModule({
                  saleflow: createdSaleflow._id
                });

                await this.saleflowSarvice.addItemToSaleFlow({
                  item: params.itemId
                }, defaultSaleflow._id);

                this.router.navigate([`/ecommerce/merchant-dashboard/${defaultMerchant._id}/my-store`]);

              } else {
                await this.saleflowSarvice.addItemToSaleFlow({
                  item: params.itemId
                }, defaultSaleflow._id);

                this.router.navigate([`/ecommerce/merchant-dashboard/${defaultMerchant._id}/my-store`]);
              }

              // const defaultSaleflow = await this.saleflowSarvice.saleflowDefault(defaultMerchant?._id);        
            }
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
    if(!this.loggedIn) return;
    const wallet = await this.walletService.exchangeDataByUser(this.user._id);
    if(!wallet) this.canCreateBank = true;
  }

  goToAuth() {
    this.router.navigate([`/ecommerce/new-item-contact-info/${this.item._id}`]);
  }

  goToBankCreation() {
    if(this.canCreateBank && this.saleflow) this.router.navigate([`/ecommerce/bank-registration/${this.saleflow._id}`]);
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
    if (!this.shouldRedirectToPreviousPage) {
      this.router.navigate([`ecommerce/error-screen/`], {
        queryParams: { type: 'item' },
      });
    } else {
      this.location.back();
    }
  }

  tapping() {
    this.tapped = !this.tapped;
  }

}
