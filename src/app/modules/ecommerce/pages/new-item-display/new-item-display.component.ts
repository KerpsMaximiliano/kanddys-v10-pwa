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
import { Location } from '@angular/common';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private itemsService: ItemsService,
    private dialogService: DialogService,
    private merchantService: MerchantsService,
    private itemService: ItemsService,
    private saleflowSarvice: SaleFlowService,
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
            const myUser = await this.authService.me();

            if (myUser) this.loggedIn = true;
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

                  const result = await this.saleflowSarvice.addItemToSaleFlow({
                    item: params.itemId
                  }, defaultSaleflow._id);

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

                    await this.saleflowSarvice.addItemToSaleFlow({
                      item: params.itemId
                    }, defaultSaleflow._id);

                  } else {
                    const { saleflowSetDefault: defaultSaleflow } = await this.saleflowSarvice.setDefaultSaleflow(defaultMerchant._id, saleflows[0]._id);

                    await this.saleflowSarvice.addItemToSaleFlow({
                      item: params.itemId
                    }, defaultSaleflow._id);
                  }
                } else {
                  await this.saleflowSarvice.addItemToSaleFlow({
                    item: params.itemId
                  }, defaultSaleflow._id);
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

                const result = await this.saleflowSarvice.addItemToSaleFlow({
                  item: params.itemId
                }, defaultSaleflow._id);

              } else {
                await this.saleflowSarvice.addItemToSaleFlow({
                  item: params.itemId
                }, defaultSaleflow._id);
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

  goToAuth() {
    this.router.navigate([`/ecommerce/new-item-contact-info/${this.item._id}`]);
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

}
