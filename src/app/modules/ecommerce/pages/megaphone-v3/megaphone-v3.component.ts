import { Component, OnDestroy, OnInit } from '@angular/core';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { Item, ItemCategory, ItemPackage } from 'src/app/core/models/item';
import { SaleFlow, SocialMediaModel } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { AppService } from 'src/app/app.service';
import { filter } from 'rxjs/operators';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemSubOrderParamsInput } from 'src/app/core/models/order';
import { Subscription } from 'rxjs';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-megaphone-v3',
  templateUrl: './megaphone-v3.component.html',
  styleUrls: ['./megaphone-v3.component.scss'],
})
export class MegaphoneV3Component implements OnInit, OnDestroy {
  saleflowData: SaleFlow;
  hasCustomizer: boolean;
  banner: string = '';
  items: Item[] = [];
  itemsByCategory: {
    label: string;
    items: Item[];
  }[] = [];
  categorylessItems: Item[] = [];
  inputsItems: Item[] = [];
  packageData: {
    package?: ItemPackage;
    items?: Item[];
  }[] = [];
  inputPackage: ItemPackage[] = [];
  sliderPackage: ItemPackage[] = [];
  categories: ItemCategory[] = [];
  merchantId: string;
  merchantName: string = '';
  merchantSubheadline: string = '';
  merchantSocials: SocialMediaModel[];
  merchantHours: string = '';
  canOpenCart: boolean;
  deleteEvent: Subscription;
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  public swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 5,
  };

  constructor(
    private dialog: DialogService,
    private router: Router,
    private merchant: MerchantsService,
    private header: HeaderService,
    private saleflow: SaleFlowService,
    private item: ItemsService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private appService: AppService
  ) { }

  openDialog() {
    //
  }

  async getMerchant(id: string) {
    try {
      const merchant = await this.merchant.merchant(id);
      this.header.merchantInfo = merchant;
      localStorage.setItem('merchantInfo', JSON.stringify(merchant));
    } catch (error) {
      console.log(error);
    }
  }

  async getCategories() {
    const itemCategoriesList = (
      await this.item.itemCategories(this.merchantId, {
        options: {
          limit: 20,
        },
      })
    ).itemCategoriesList;
    const headlines = await this.item.itemCategoryHeadlineByMerchant(
      this.merchantId
    );
    if (itemCategoriesList.length === 0) return;
    const categories = headlines[0].itemsCategories
      .map((value) => itemCategoriesList.find((element) => element._id === value))
      .filter((value) => value);
    return categories;
  }

  organizeItems() {
    if (!this.categories || !this.categories.length) return;
    this.categorylessItems = this.items.filter((item) => !item.category.length);
    this.categories.forEach((saleflowCategory) => {
      if (
        this.items.some((item) =>
          item.category.some((category) => category.name === saleflowCategory.name)
        )
      ) {
        this.itemsByCategory.push({
          label: saleflowCategory.name,
          items: this.items.filter((item) =>
            item.category.some((category) => category.name === saleflowCategory.name)
          ),
        });
      }
    });
  }

  // =====================================================

  async ngOnInit(): Promise<void> {
    this.header.resetIsComplete();
    this.header.disableNav();
    this.header.hide();
    this.header.packId = 0;
    this.executeProcessesAfterLoading();
    this.deleteEvent = this.appService.events
      .pipe(filter((e) => e.type === 'deleted-item'))
      .subscribe((e) => {
        let productData: Item[] = this.header.getItems(this.saleflowData._id);
        const selectedItems =
          productData?.length
            ? productData.map((item) => item._id)
            : [];
        this.items.forEach((item) => {
          if (!item.customizerId) item.isSelected = selectedItems.includes(item._id);
        })
        //sub.unsubscribe();
        this.canOpenCart = this.items.some((item) => item.isSelected);
      });
  }

  ngOnDestroy() {
    this.deleteEvent.unsubscribe();
  }

  executeProcessesAfterLoading() {
    this.route.params.subscribe(async (params) => {
      this.status = 'loading';
      lockUI();

      this.header.flowId = params.id;
      this.saleflowData = await this.header.fetchSaleflow(params.id);
      const orderData = this.header.getOrder(this.saleflowData._id);
      if (!orderData || !orderData.products || orderData.products.length === 0)
        this.header.emptyItems(this.saleflowData._id);
      this.banner = this.saleflowData.banner;
      this.merchantName = this.saleflowData.merchant.name;
      this.merchantSubheadline = this.saleflowData.subheadline;
      this.merchantHours = this.saleflowData.workingHours;
      this.merchantId = this.saleflowData.merchant._id;
      this.merchantSocials = this.saleflowData.social;

      this.categories = await this.getCategories();
      await this.getMerchant(this.saleflowData.merchant._id);
      // Package fetching
      if (this.saleflowData.packages.length) {
        const listPackages = (
          await this.saleflow.listPackages({
            findBy: {
              _id: {
                __in: ([] = this.saleflowData.packages.map((itemPackage) => itemPackage._id)),
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
      }
      // No packages. Item fetching
      if (!this.saleflowData.packages.length && this.saleflowData.items.length) {
        const saleflowItems = this.saleflowData.items.map((saleflowItem) => ({
          item: saleflowItem.item._id,
          customizer: saleflowItem.customizer?._id,
          index: saleflowItem.index,
        }))
        if (saleflowItems.some((item) => item.customizer)) this.hasCustomizer = true;
        const items = await this.saleflow.listItems({
          findBy: {
            _id: {
              __in: ([] = saleflowItems.map((items) => items.item)),
            },
          },
          options: {
            limit: 60,
          },
        });
        const selectedItems =
          orderData?.products?.length
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
          if (!this.items[i].customizerId) this.items[i].isSelected = selectedItems.includes(this.items[i]._id);

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
        }
        this.organizeItems();
        this.status = 'complete';
        unlockUI();
      }
      if (!this.saleflowData.packages.length && !this.saleflowData.items.length) {
        this.status = 'complete';
        unlockUI();
      }
    });
    if (this.header.customizerData) this.header.customizerData = null;
  }

  // Logic for selecting items
  toggleSelected(type: string, index: number, $event?: number) {
    if (type === 'item') {
      if (index != undefined) {
        if ($event != undefined && this.itemsByCategory[index].items[$event]) {
          const itemData = this.itemsByCategory[index].items[$event];
          itemData.isSelected = !itemData.isSelected;
          let itemParams: ItemSubOrderParamsInput[];
          if (itemData.params.length > 0) {
            itemParams = [
              {
                param: itemData.params[0]._id,
                paramValue: itemData.params[0].values[0]._id,
              },
            ];
          }
          this.header.storeOrderProduct(this.saleflowData._id, {
            item: itemData._id,
            customizer: itemData.customizerId,
            params: itemParams,
            amount: itemData.customizerId ? undefined : 1,
            saleflow: this.saleflowData._id,
          });
          this.header.storeItem(this.saleflowData._id, itemData);
        } else {
          this.items[index].isSelected =
            !this.items[index].isSelected;
          this.header.storeOrderProduct(this.saleflowData._id, {
            item: this.items[index]._id,
            amount: 1,
            saleflow: this.saleflowData._id,
          });
          this.header.storeItem(this.saleflowData._id, this.items[index]);
        }
      }
    } else if (type === 'package') {
      this.sliderPackage.forEach((packageItem, packageIndex) => {
        if (packageIndex === index)
          packageItem.isSelected = !packageItem.isSelected;
        else packageItem.isSelected = false;
      });
      let products = [];
      for (let i = 0; i < this.packageData[index].items.length; i++) {
        products.push({
          item: this.packageData[index].items[i]._id,
          amount: this.packageData[index].package.packageRules[i].fixedQuantity,
          isScenario:
            this.packageData[index].items[i].itemExtra.length > 0,
          limitScenario:
            this.packageData[index].package.packageRules[i].maxQuantity,
        });
      }
      this.header.storeOrderPackage(
        this.saleflowData._id,
        this.packageData[index].package._id,
        products
      );
      this.header.storeItem(this.saleflowData._id, this.sliderPackage[index]);
    }
  }

  seeCategories(index: number | string) {
    if (typeof index === 'string') this.router.navigate([
      `ecommerce/category-items/${this.saleflowData._id}/${index}`,
    ]);
    else this.router.navigate([
      `ecommerce/category-items/${this.saleflowData._id}/${this.itemsByCategory[index].items[0].category.find(
        (category) => category.name === this.itemsByCategory[index].label
      )._id
      }`,
    ]);
  }

  onItemClick(id: string) {
    const itemData = this.items.find((item) => item._id === id);
    if (!itemData) return;
    if (itemData.category.length) this.header.categoryId = itemData.category[0]?._id;
    this.header.items = [itemData];
    if (itemData.customizerId) {
      this.header.emptyOrderProducts(this.saleflowData._id);
      this.header.emptyItems(this.saleflowData._id);
      let itemParams: ItemSubOrderParamsInput[];
      if (itemData.params.length > 0) {
        itemParams = [
          {
            param: itemData.params[0]._id,
            paramValue: itemData.params[0].values[0]._id,
          },
        ];
      }
      const product = {
        item: itemData._id,
        customizer: itemData.customizerId,
        params: itemParams,
        amount: itemData.customizerId ? undefined : 1,
        saleflow: this.saleflowData._id,
        name: itemData.name,
      };
      this.header.order = {
        products: [product],
      };
      this.header.storeOrderProduct(this.saleflowData._id, product);
      this.header.storeItem(this.saleflowData._id, itemData);
      this.router.navigate([`/ecommerce/provider-store/${this.saleflowData._id}/${itemData._id}`]);
    } else {
      this.header.storeOrderProduct(this.saleflowData._id, {
        item: itemData._id,
        amount: 1,
        saleflow: this.saleflowData._id,
      });
      this.header.storeItem(this.saleflowData._id, itemData);
      this.router.navigate([`/ecommerce/item-detail/${this.saleflowData._id}/${itemData._id}`])
    };
  }

  save(index?: number) {
    if (index) this.header.packId = index;
    this.header.items = [];
    let products = [];
    let order;
    if (this.inputPackage.length === 0) {
      products.push({
        item: this.items[index]._id,
        name: this.items[index].name,
        amount: 1,
      });

      order = {
        products: products,
      };

      this.header.order = order;
      this.header.order.products[0].saleflow = this.header.saleflow._id;
      this.router.navigate([
        '/ecommerce/item-detail/' +
        this.header.saleflow._id +
        '/' +
        this.items[index]._id,
      ]);
    }
  }

  goToPackageDetail(index) {
    this.router.navigate([`/ecommerce/package-detail/${this.saleflowData._id}/${this.sliderPackage[index]._id}`]);
  }

  goToItemDetail(id: string) {
    this.router.navigate([`/ecommerce/item-detail/${this.saleflowData._id}/${id}`]);
  }

  showShoppingCartDialog() {
    this.dialog.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: {
        footerCallback: () =>
          this.router.navigate(['/ecommerce/create-giftcard']),
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  async itemOfPackage(packages: ItemPackage[]) {
    let index = 0;

    for (let itemPackage of packages) {
      this.packageData.push({
        package: itemPackage,
      });

      const listItems = (
        await this.saleflow.listItems({
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
