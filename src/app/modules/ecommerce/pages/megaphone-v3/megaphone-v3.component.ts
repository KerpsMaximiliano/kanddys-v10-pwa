import { Component, OnDestroy, OnInit } from '@angular/core';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { environment } from 'src/environments/environment';
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
  isLogged: boolean = false;
  done: boolean = false;
  category: any;
  loadingSwiper: boolean = false;
  banner: string = '';
  items: Item[] = [];
  itemsByCategory: {
    label: string;
    items: Item[];
  }[] = [];
  inputsItems: Item[] = [];
  packagesId: any = [];
  packageData: any = [];
  inputPackage: ItemPackage[] = [];
  sliderPackage: ItemPackage[] = [];
  swiperPackageOrder: any = [];
  selectedTagsIds: any = [];
  categories: ItemCategory[] = [];
  flowId: string;
  merchantId: string;
  merchantName: string = '';
  merchantSubheadline: string = '';
  merchantSocials: SocialMediaModel[];
  merchantHours: string = '';
  merchantLabel: string = ''; //Asignado en ngOnInit
  labelValues: any = [];
  filters: Array<any> = ['Mar', 'Mie', 'Jue', 'Vie'];
  isCategories: boolean;
  imageRoute: string = `${environment.assetsUrl}/share-outline.png`;
  renderedSwippers: number = 0;
  visualMode: boolean = true;
  canOpenCart: boolean;
  deleteEvent: Subscription;
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
  ) {}

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

    const filters = headlines.map((headline) => {
      const options = headline.itemsCategories
        .map((value) =>
          itemCategoriesList.find((element) => element._id === value)
        )
        .filter((item) => item)
        .map((filter) => {
          return {
            id: filter._id,
            label: filter.name,
            type: 'label',
            selected: false,
          };
        });

      return {
        section: 'categories',
        title: 'Categorías',
        subtitle: headline.headline,
        property: 'category',
        options,
      };
    });
    this.categories = headlines[0].itemsCategories
      .map(
        (value) =>
          itemCategoriesList.find((element) => element._id === value)
      )
      .filter((value) => value);
    this.filters = filters;

    if (this.items.length > 0 && this.itemsByCategory.length === 0) {
      this.organizeItems();
    }

    if (itemCategoriesList.length > 0) {
      for (let i = 0; i < itemCategoriesList.length; i++) {
        this.closeTagItems[0].options.push({
          id: itemCategoriesList[i]._id,
          label: itemCategoriesList[i].name,
          type: 'label',
          selected: false,
        });
      }
    }

    if (this.categories.length == 0) {
      this.isCategories = false;
    } else {
      this.isCategories = true;
    }

    this.done = true;
  }

  organizeItems() {
    if (this.categories) {
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

    // let categories = [];
    // this.items.forEach((item) => {
    //   item.category.forEach((category) => {
    //     if (!categories.includes(category.name)) categories.push(category.name);
    //   });
    // });
    // console.log(categories);
    // categories.forEach((name) => {
    //   this.itemsByCategory.push({
    //     label: name,
    //     items: this.items.filter((item) =>
    //       item.category.some((category) => category.name === name)
    //     ),
    //   });
    // });

    // if (
    //   this.items.some((item) =>
    //     item.category.some((category) => category.name === 'Tragos')
    //   )
    // ) {
    //   this.itemsByCategory[0] = {
    //     label: 'servilletas para tragos',
    //     items: this.items.filter((item) =>
    //       item.category.some((category) => category.name === 'Tragos')
    //     ),
    //   };
    // }
    // if (
    //   this.items.some((item) =>
    //     item.category.some((category) => category.name === 'Baño')
    //   )
    // ) {
    //   this.itemsByCategory[1] = {
    //     label: 'servilletas para baños',
    //     items: this.items.filter((item) =>
    //       item.category.some((category) => category.name === 'Baño')
    //     ),
    //   };
    // }
    // if (
    //   this.items.some((item) =>
    //     item.category.some((category) => category.name === 'Comidas')
    //   )
    // ) {
    //   this.itemsByCategory[2] = {
    //     label: 'servilletas para comidas',
    //     items: this.items.filter((item) =>
    //       item.category.some((category) => category.name === 'Comidas')
    //     ),
    //   };
    // }
    let renderedSpinners = 0;
    for (let i = 0; i < this.itemsByCategory.length; i++) {
      renderedSpinners++;
      if (renderedSpinners === this.itemsByCategory.length) {
        unlockUI();
      }
    }
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
          if(!item.customizerId) item.isSelected = selectedItems.includes(item._id);
        })
        //sub.unsubscribe();
        this.canOpenCart = this.inputsItems.some((item) => item.isSelected);
      });
  }

  ngOnDestroy() {
    this.deleteEvent.unsubscribe();
  }

  executeProcessesAfterLoading() {
    this.route.params.subscribe(async (params) => {
      this.flowId = params.id;
      lockUI();

      this.header.flowId = params.id;
      if(!this.header.getSaleflow() && !this.header.saleflow) this.saleflowData = await this.header.fetchSaleflow(params.id);
      if(this.header.getSaleflow()._id !== params.id) this.saleflowData = await this.header.fetchSaleflow(params.id);
      else {
        this.saleflowData = this.header.getSaleflow();
        this.header.saleflow = this.saleflowData;
      }
      const orderData = this.header.getOrder(this.saleflowData._id);
      if (!orderData || !orderData.products || orderData.products.length === 0)
        this.header.emptyItems(this.saleflowData._id);
      this.banner = this.saleflowData.banner;
      this.merchantName = this.saleflowData.merchant.name;
      this.merchantSubheadline = this.saleflowData.subheadline;
      this.merchantHours = this.saleflowData.workingHours;
      this.merchantId = this.saleflowData.merchant._id;
      this.merchantSocials = this.saleflowData.social;

      await this.getCategories();
      await this.getMerchant(this.saleflowData.merchant._id);

      let saleflowItems: {
        item: string;
        customizer: string;
        index: number;
      }[] = [];

      if (this.saleflowData.items.length !== 0) {
        this.merchantLabel = 'Alegrías de esta semana';
        for (let i = 0; i < this.saleflowData.items.length; i++) {
          saleflowItems.push({
            item: this.saleflowData.items[i].item._id,
            customizer: this.saleflowData.items[i].customizer?._id,
            index: this.saleflowData.items[i].index,
          });
        }
        if (saleflowItems.some((item) => item.customizer))
          this.hasCustomizer = true;
      }
      if (this.saleflowData.packages.length !== 0) {
        this.merchantLabel = 'Planes mas comprados';
        for (let i = 0; i < this.saleflowData.packages.length; i++) {
          this.packagesId.push(this.saleflowData.packages[i]._id);
        }
      }

      const listPackages = (
        await this.saleflow.listPackages({
          findBy: {
            _id: {
              __in: ([] = this.packagesId),
            },
          },
        })
      ).listItemPackage;
      for (let i = 0; i < listPackages.length; i++) {
        listPackages[i].isSelected =
          orderData?.itemPackage === listPackages[i]._id;
      }
      this.inputPackage = listPackages;
      this.sliderPackage = listPackages;
      await this.itemOfPackage(listPackages);
      this.inputPackage = this.packageData.map((e) => e.package);
      this.swiperPackageOrder = this.packageData;
      if (this.inputPackage.length > 0) this.currentItem(0);
      if (this.inputPackage.length == 0) {
        const selectedItems =
          orderData?.products?.length > 0
            ? orderData.products.map((subOrder) => subOrder.item)
            : [];
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

        this.items = items.listItems;

        this.canOpenCart = orderData?.products?.length > 0;
        this.inputsItems = this.items;
        for (let i = 0; i < this.items.length; i++) {
          const saleflowItem = saleflowItems.find(
            (item) => item.item === this.items[i]._id
          );
          this.items[i].customizerId = saleflowItem.customizer;
          this.items[i].index = saleflowItem.index;
          if(!this.items[i].customizerId) this.items[i].isSelected = selectedItems.includes(this.items[i]._id);

          if (this.items[i].hasExtraPrice)
            this.items[i].totalPrice =
              this.items[i].fixedQuantity *
                this.items[i].params[0].values[0].price +
              this.items[i].pricing;
          this.labelValues.push({ id: i, status: false });
        }
        if (this.items.every((item) => item.index)) {
          this.items = this.items.sort((a, b) =>
            a.index > b.index ? 1 : b.index > a.index ? -1 : 0
          );
        }
        this.organizeItems();
      }

      if (!this.hasCustomizer) unlockUI();

      this.authService.me().then((data) => {
        this.isLogged = data != undefined;
      });
    });
    if (this.header.customizerData) this.header.customizerData = null;
  }

  endLoader() {
    this.renderedSwippers++;

    if (this.renderedSwippers === this.itemsByCategory.length) {
      unlockUI();
    }
  }

  logOut() {
    this.authService.signouttwo();
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
          this.inputsItems[index].isSelected =
            !this.inputsItems[index].isSelected;
          this.header.storeOrderProduct(this.saleflowData._id, {
            item: this.inputsItems[index]._id,
            amount: 1,
            saleflow: this.saleflowData._id,
          });
          this.header.storeItem(this.saleflowData._id, this.inputsItems[index]);
        }
      }
    } else if (type === 'package') {
      this.sliderPackage.forEach((packageItem, packageIndex) => {
        if (packageIndex === index)
          packageItem.isSelected = !packageItem.isSelected;
        else packageItem.isSelected = false;
      });
      let products = [];
      for (let i = 0; i < this.packageData[index].items.listItems.length; i++) {
        products.push({
          item: this.packageData[index].items.listItems[i]._id,
          amount: this.packageData[index].package.packageRules[i].fixedQuantity,
          isScenario:
            this.packageData[index].items.listItems[i].itemExtra.length > 0,
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
    if(typeof index === 'string') this.router.navigate([
      `ecommerce/category-items/${this.saleflowData._id}/${index}`,
    ]);
    else this.router.navigate([
      `ecommerce/category-items/${this.saleflowData._id}/${
        this.itemsByCategory[index].items[0].category.find(
          (category) => category.name === this.itemsByCategory[index].label
        )._id
      }`,
    ]);
  }

  onItemCategoryClick(listIndex: number, itemIndex: number) {
    const itemData = this.itemsByCategory[listIndex].items[itemIndex];
    if (itemData) {
      this.header.categoryId = itemData.category[0]._id;
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
        this.router.navigate([
          `/ecommerce/provider-store/${this.saleflowData._id}/${itemData._id}`,
        ]);
      } else
        this.router.navigate([
          '/ecommerce/item-detail/' +
            this.header.saleflow._id +
            '/' +
            itemData._id,
        ], {queryParams: { viewtype: 'community' }});
    }
  }

  closeTagItems = [
    {
      title: 'Filters',
      subtitle: 'Package Filters',
      options: [],
    },
  ];

  save(index?: number) {
    if (index) this.header.packId = index;
    this.header.items = [];
    let products = [];
    let order;
    if (this.inputPackage.length === 0) {
      products.push({
        item: this.inputsItems[index]._id,
        name: this.inputsItems[index].name,
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
          this.inputsItems[index]._id,
      ]);
    }
  }

  currentItem(e) {
    let isScenario;
    let scenariosLength;

    if (this.inputPackage.length === 0) {
      this.save(e);
    } else {
      // this.options = [];

      for (
        let i = 0;
        i < this.swiperPackageOrder[e].items.listItems.length;
        i++
      ) {
        scenariosLength =
          this.swiperPackageOrder[e].items.listItems[i].itemExtra.length > 0
            ? this.swiperPackageOrder[e].items.listItems[i].itemExtra.length
            : undefined;
        isScenario =
          this.swiperPackageOrder[e].items.listItems[i].itemExtra.length > 0;
      }
    }
  }

  goToPackageDetail(index) {
    this.router.navigate([
      '/ecommerce/package-detail/' + this.sliderPackage[index]._id,
    ]);
  }

  showShoppingCartDialog() {
    this.dialog.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: {
        headerButton: 'Ver mas productos',
        footerCallback: () =>
          this.router.navigate(['/ecommerce/create-giftcard']),
        headerCallback: () =>
          this.router.navigate([
            `ecommerce/megaphone-v3/${this.header.saleflow._id}`,
          ]),
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  orderSwiper() {
    this.swiperPackageOrder = [];
    let aux;

    for (let i = 0; i < this.inputPackage.length; i++) {
      aux = this.packageData.find(
        (e) => e.package._id == this.inputPackage[i]._id
      );
      this.swiperPackageOrder.push(aux);
    }
  }

  validateCategories(category) {
    return category && category._id ? category._id : '0';
  }

  filterTags(e) {
    this.selectedTagsIds = e[0].options
      .filter((el) => el.selected)
      .map((el) => el.id);

    if (this.selectedTagsIds.length == 0) {
      this.inputPackage = this.packageData.map((e) => e.package);
    }

    if (this.selectedTagsIds.length == 0 && this.inputPackage.length === 0) {
      this.inputsItems = this.items;
    }

    if (this.selectedTagsIds.length > 0 && this.inputPackage.length > 0)
      this.inputPackage = this.packageData
        .filter((packageEl) =>
          packageEl.package.categories.some((element) =>
            this.selectedTagsIds.includes(element._id)
          )
        )
        .map((e) => e.package);

    if (this.selectedTagsIds.length > 0 && this.inputPackage.length === 0) {
      this.inputsItems = this.items.filter((el) =>
        this.selectedTagsIds.includes(this.validateCategories(el.category))
      );
    }
    this.loadingSwiper = false;
    this.orderSwiper();
    this.currentItem(0);
  }

  /*
[1,2,3] --> [tag1, tag2]

[1,2,3] --> [1,3] swiper
  */

  tagDeleted(e) {
    this.selectedTagsIds = this.selectedTagsIds.filter(
      (el) => el !== e.name[0].id
    );

    if (this.selectedTagsIds.length == 0) {
      this.inputPackage = this.packageData.map((e) => e.package);
    }

    if (this.selectedTagsIds.length == 0 && this.inputPackage.length === 0) {
      this.inputsItems = this.items;
    }

    if (this.selectedTagsIds.length > 0 && this.inputPackage.length > 0)
      this.inputPackage = this.packageData
        .filter((packageEl) =>
          packageEl.package.categories.some((element) =>
            this.selectedTagsIds.includes(element._id)
          )
        )
        .map((e) => e.package);

    if (this.inputPackage.length === 0 && this.selectedTagsIds.length > 0) {
      this.inputsItems = this.items.filter((el) =>
        this.selectedTagsIds.includes(this.validateCategories(el.category))
      );
    }

    setTimeout(() => (this.loadingSwiper = false), 1);
    this.orderSwiper();
    this.currentItem(0);
  }

  /**
   *  (click) => unload => filter/delete => load
   *
   *  (click) => deletedTags => unload
   */

  startLoading(e: boolean) {
    this.loadingSwiper = e;
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

      let isScenario;
      let scenariosLength;

      if (index === 0 && this.inputPackage.length > 0) {
        for (let i = 0; i < listItems.length; i++) {
          // scenariosLength = listItems[i].itemExtra.length > 0? listItems[i].itemExtra.length:undefined; //
          isScenario = listItems[i].itemExtra.length > 0;
        }
      }
      this.packageData[index].items = { listItems };
      index++;
    }
  }

  formatPrice(price: string = '') {
    return `${price}`.replace(',', '.').replace('.', ',');
  }
}
