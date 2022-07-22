import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import {
  Item,
  ItemCategory,
  ItemCategoryHeadline,
  ItemPackage,
} from 'src/app/core/models/item';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-gallery-store',
  templateUrl: './gallery-store.component.html',
  styleUrls: ['./gallery-store.component.scss'],
})
export class GalleryStoreComponent implements OnInit, OnDestroy {
  env: string = environment.assetsUrl;
  url: string = environment.uri;
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  categorylessItems: Item[] = [];
  items: Item[] = [];
  categories: ItemCategory[] = [];
  itemsByCategory: {
    label: string;
    items: Item[];
    images: {
      src: string;
      alt?: string;
      callback: () => void;
    }[];
  }[] = [];
  inputPackage: ItemPackage[] = [];
  sliderPackage: ItemPackage[] = [];
  packageData: {
    package?: ItemPackage;
    items?: Item[];
  }[] = [];
  itemCartAmount: number;
  hasCustomizer: boolean;
  canOpenCart: boolean;
  contactLandingRoute: string;
  deleteEvent: Subscription;
  saleflow: SaleFlow;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private saleflowService: SaleFlowService,
    private headerService: HeaderService,
    private itemsService: ItemsService,
    private merchantsService: MerchantsService,
    private dialogService: DialogService,
    private appService: AppService
  ) {
    this.deleteEvent = this.appService.events
      .pipe(filter((e) => e.type === 'deleted-item'))
      .subscribe((e) => {
        let productData: Item[] = this.headerService.getItems(
          this.saleflow._id
        );
        const selectedItems = productData?.length
          ? productData.map((item) => item._id)
          : [];
        this.items.forEach((item) => {
          if (!item.customizerId)
            item.isSelected = selectedItems.includes(item._id);
        });
        this.canOpenCart = this.items.some((item) => item.isSelected);
      });
  }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.status = 'loading';
      lockUI();
      this.headerService.flowId = params.id;
      this.headerService.orderId = null;
      this.saleflow = await this.headerService.fetchSaleflow(params.id);
      const orderData = this.headerService.getOrder(this.saleflow._id);
      if (!orderData || !orderData.products || orderData.products.length === 0)
        this.headerService.emptyItems(this.saleflow._id);

      const [itemCategories, headlines, merchant] = await Promise.all([
        this.itemsService.itemCategories(this.saleflow.merchant._id, {
          options: {
            limit: 20,
          },
        }),
        this.itemsService.itemCategoryHeadlineByMerchant(
          this.saleflow.merchant._id
        ),
        this.merchantsService.merchant(this.saleflow.merchant._id),
      ]);

      this.categories = this.getCategories(
        itemCategories.itemCategoriesList,
        headlines[0]
      );
      this.contactLandingRoute = `user-contact-landing/${merchant.owner._id}`;

      // Package fetching
      if (this.saleflow.packages.length) {
        const listPackages = (
          await this.saleflowService.listPackages({
            findBy: {
              _id: {
                __in: ([] = this.saleflow.packages.map(
                  (itemPackage) => itemPackage._id
                )),
              },
            },
          })
        ).listItemPackage;
        listPackages.forEach((itemPackage) => {
          itemPackage.isSelected = orderData?.itemPackage === itemPackage._id;
        });
        this.inputPackage = listPackages;
        this.sliderPackage = listPackages;
        await this.itemOfPackage(listPackages);
        this.inputPackage = this.packageData.map((e) => e.package);
        if (
          orderData &&
          !this.saleflow.packages.some(
            (itemPackage) => itemPackage._id === orderData.itemPackage
          )
        )
          this.headerService.deleteSaleflowOrder(this.saleflow._id);
      }
      // No packages. Item fetching
      if (!this.saleflow.packages.length && this.saleflow.items.length) {
        const saleflowItems = this.saleflow.items.map((saleflowItem) => ({
          item: saleflowItem.item._id,
          customizer: saleflowItem.customizer?._id,
          index: saleflowItem.index,
        }));
        if (saleflowItems.some((item) => item.customizer))
          this.hasCustomizer = true;
        const items = await this.saleflowService.listItems({
          findBy: {
            _id: {
              __in: ([] = saleflowItems.map((items) => items.item)),
            },
            status: 'active',
          },
          options: {
            limit: 60,
          },
        });
        const selectedItems = orderData?.products?.length
          ? orderData.products.map((subOrder) => subOrder.item)
          : [];
        this.items = items.listItems;
        this.canOpenCart = orderData?.products?.length > 0;
        for (let i = 0; i < this.items.length; i++) {
          const saleflowItem = saleflowItems.find(
            (item) => item.item === this.items[i]._id
          );
          this.items[i].customizerId = saleflowItem.customizer;
          this.items[i].index = saleflowItem.index;
          if (!this.items[i].customizerId)
            this.items[i].isSelected = selectedItems.includes(
              this.items[i]._id
            );
          if (this.items[i].hasExtraPrice)
            this.items[i].totalPrice =
              this.items[i].fixedQuantity *
                this.items[i].params[0].values[0].price +
              this.items[i].pricing;
        }
        if (this.items.every((item) => item.index)) {
          this.items = this.items.sort((a, b) =>
            a.index > b.index ? 1 : b.index > a.index ? -1 : 0
          );
        } else {
          this.items = this.items.sort((a, b) => a.pricing - b.pricing);
        }
        if (orderData?.products?.length) {
          orderData.products.forEach((item) => {
            if (!this.items.some((product) => product._id === item.item)) {
              this.headerService.removeOrderProduct(
                this.saleflow._id,
                item.item
              );
              this.headerService.removeItem(this.saleflow._id, item.item);
            }
          });
        }
        this.organizeItems();
        this.status = 'complete';
        unlockUI();
      }
      if (!this.saleflow.packages.length && !this.saleflow.items.length) {
        this.status = 'complete';
        unlockUI();
      }
    });
  }

  ngOnDestroy() {
    this.deleteEvent.unsubscribe();
  }

  getCategories(
    itemCategoriesList: ItemCategory[],
    headlines: ItemCategoryHeadline
  ) {
    if (itemCategoriesList.length === 0) return;
    const categories = headlines.itemsCategories
      .map((value) =>
        itemCategoriesList.find((element) => element._id === value)
      )
      .filter((value) => value);
    return categories;
  }

  organizeItems() {
    this.categorylessItems = this.items
      .filter((item) => !item.category.length)
      .sort((a, b) => a.pricing - b.pricing);
    if (!this.categories || !this.categories.length) return;
    this.categories.forEach((saleflowCategory) => {
      if (
        this.items.some((item) =>
          item.category.some(
            (category) => category.name === saleflowCategory.name
          )
        )
      ) {
        this.itemsByCategory.push({
          label: saleflowCategory.name,
          items: this.items.filter((item) =>
            item.category.some(
              (category) => category.name === saleflowCategory.name
            )
          ),
          images: this.items
            .filter((item) =>
              item.category.some(
                (category) => category.name === saleflowCategory.name
              )
            )
            .map((item) => ({
              src: item.images?.length ? item.images[0] : '',
              callback: () => {console.log('clicked item')},
            })),
        });
      }
    });
  }

  showShoppingCartDialog = () => {
    this.dialogService.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: {
        headerButton: 'Ver mas productos',
        footerCallback: () =>
          this.router.navigate(['/ecommerce/create-giftcard']),
        headerCallback: () =>
          this.router.navigate([
            `ecommerce/megaphone-v3/${this.headerService.saleflow._id}`,
          ]),
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  itemInCart() {
    const productData = this.headerService.getItems(this.saleflow._id);
    this.itemCartAmount = productData?.length;
  }

  async itemOfPackage(packages: ItemPackage[]) {
    let index = 0;

    for (let itemPackage of packages) {
      this.packageData.push({
        package: itemPackage,
      });

      const listItems = (
        await this.saleflowService.listItems({
          findBy: {
            _id: {
              __in: ([] = itemPackage.packageRules.map((e) => e.item._id)),
            },
          },
        })
      ).listItems;

      this.packageData[index].items = listItems;
      this.status = 'complete';
      index++;
      unlockUI();
    }
  }
}
