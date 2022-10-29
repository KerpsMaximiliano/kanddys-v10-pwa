import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import {
  Item,
  ItemCategory,
  ItemCategoryHeadline,
} from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemSubOrderParamsInput } from 'src/app/core/models/order';
import { PaginationInput, SaleFlow } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SettingsComponent } from 'src/app/shared/dialogs/settings/settings.component';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';

interface ExtendedTag extends Tag {
  selected?: boolean;
}

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnInit {
  URI: string = environment.uri;
  env: string = environment.assetsUrl;
  saleflowData: SaleFlow;
  hasCustomizer: boolean;
  items: Item[] = [];
  filteredItems: Item[] = [];
  tags: ExtendedTag[] = [];
  itemsByCategory: {
    label: string;
    items: Item[];
    images: {
      src: string;
      alt?: string;
      callback: () => void;
    }[];
    earnings?: string;
    sales?: number;
    shareCallback: () => void;
    callback: () => void;
  }[] = [];
  categorylessItems: Item[] = [];
  filteredCategoryLessItems: Item[] = [];
  itemsPerTag: Array<{
    tag: ExtendedTag;
    items: Array<Item>;
  }> = [];
  filteredItemsPerTag: Array<{
    tag: ExtendedTag;
    items: Array<Item>;
  }> = [];
  itemsWithoutTags: Item[] = [];
  filteredItemsWithoutTags: Item[] = [];
  categories: ItemCategory[] = [];
  contactLandingRoute: string;
  highlightedItems: Item[] = [];
  // canOpenCart: boolean;
  itemCartAmount: number;
  deleteEvent: Subscription;
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  viewtype: 'preview' | 'merchant';
  admin: boolean;
  searchBar: FormControl = new FormControl('');
  selectedTagsCounter: number = 0;
  selectedTags: Array<Tag> = [];
  user: User = null;
  userDefaultMerchant: Merchant = null;

  public swiperConfigTag: SwiperOptions = {
    slidesPerView: 5,
    freeMode: true,
    spaceBetween: 0,
  };

  public swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 5,
  };

  swiperConfigHighlightedItems: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: false,
    spaceBetween: 0,
  };

  constructor(
    private dialog: DialogService,
    private router: Router,
    private merchantService: MerchantsService,
    private header: HeaderService,
    private saleflow: SaleFlowService,
    private item: ItemsService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private appService: AppService,
    private orderService: OrderService,
    private tagsService: TagsService,
    private location: Location
  ) {}

  async ngOnInit(): Promise<void> {
    this.header.resetIsComplete();
    this.executeProcessesAfterLoading();
  }

  setMerchant(merchant: Merchant) {
    this.header.merchantInfo = merchant;
    localStorage.setItem('merchantInfo', JSON.stringify(merchant));
  }

  getCategories(
    itemCategoriesList: ItemCategory[],
    headlines: ItemCategoryHeadline
  ) {
    if (itemCategoriesList.length === 0) return;
    const categories =
      headlines?.itemsCategories.length > 0
        ? headlines.itemsCategories
            .map((value) =>
              itemCategoriesList.find((element) => element._id === value)
            )
            .filter((value) => value)
        : [];
    return categories;
  }

  async organizeItems(merchant: Merchant) {
    // .sort((a, b) => a.pricing - b.pricing);
    const highlightedItemsObject = {};
    this.highlightedItems = [];

    //Sets highlightedItems array
    for (const item of this.items) {
      if (item.status === 'featured') {
        this.highlightedItems.push(item);
        highlightedItemsObject[item._id] = true;
      }
    }

    //************************* GROUPS ITEMS BY TAG***************//
    const tagsAndItemsHashtable: Record<string, Array<Item>> = {};

    for (const item of this.items) {
      if (item.tags.length > 0) {
        for (const tagId of item.tags) {
          if (!tagsAndItemsHashtable[tagId]) tagsAndItemsHashtable[tagId] = [];
          tagsAndItemsHashtable[tagId].push(item);
        }
      } else {
        this.itemsWithoutTags.push(item);
      }
    }

    this.filteredItemsWithoutTags = this.itemsWithoutTags;

    for (const tag of this.tags) {
      if (
        tagsAndItemsHashtable[tag._id] &&
        tagsAndItemsHashtable[tag._id].length > 0
      ) {
        this.itemsPerTag.push({
          tag,
          items: tagsAndItemsHashtable[tag._id],
        });
        this.filteredItemsPerTag = this.itemsPerTag;
      } else {
        this.itemsPerTag.push({
          tag,
          items: [],
        });
        this.filteredItemsPerTag = this.itemsPerTag;
      }
    }
    //*************************                        END                   *****************************//
  }

  executeProcessesAfterLoading() {
    this.route.params.subscribe(async (params) => {
      this.status = 'loading';
      lockUI();

      this.header.orderId = null;
      this.saleflowData = await this.header.fetchSaleflow(params.id);
      this.getTags();
      const orderData = this.header.getOrder(this.saleflowData._id);
      if (!orderData || !orderData.products || orderData.products.length === 0)
        this.header.emptyItems(this.saleflowData._id);

      const [itemCategories, headlines, merchant, user] = await Promise.all([
        this.item.itemCategories(this.saleflowData.merchant._id, {
          options: {
            limit: 20,
          },
        }),
        this.item.itemCategoryHeadlineByMerchant(
          this.saleflowData.merchant._id
        ),
        this.merchantService.merchant(this.saleflowData.merchant._id),
        this.authService.me(),
      ]);
      if (user) {
        this.user = user;

        this.userDefaultMerchant = await this.merchantService.merchantDefault();
      }

      if (user?._id === merchant?.owner?._id) {
        this.admin = true;
      }

      this.categories = this.getCategories(
        itemCategories.itemCategoriesList,
        headlines[0]
      );
      this.setMerchant(merchant);
      this.contactLandingRoute = `user-contact-landing/${merchant.owner._id}`;
      // No packages. Item fetching
      if (
        !this.saleflowData.packages.length &&
        this.saleflowData.items.length
      ) {
        const saleflowItems = this.saleflowData.items.map((saleflowItem) => ({
          item: saleflowItem.item._id,
          customizer: saleflowItem.customizer?._id,
          index: saleflowItem.index,
        }));
        if (saleflowItems.some((item) => item.customizer))
          this.hasCustomizer = true;
        const items = await this.saleflow.listItems({
          findBy: {
            _id: {
              __in: ([] = saleflowItems.map((items) => items.item)),
            },
            /*
            tags: {
              __in: ['635ae0dd0d49fc05f04add6b'],
            },
            */
          },
          options: {
            sortBy: 'createdAt:desc',
            limit: 60,
          },
        });
        const selectedItems = orderData?.products?.length
          ? orderData.products.map((subOrder) => subOrder.item)
          : [];
        this.items = items.listItems.filter((item) => {
          return item.status === 'active' || item.status === 'featured';
        });
        this.filteredItems = this.items;

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
        }
        if (orderData?.products?.length) {
          let itemIDs: string[] = [];
          orderData.products.forEach((item) => {
            if (!this.items.some((product) => product._id === item.item)) {
              itemIDs.push(item.item);
              this.header.removeOrderProduct(this.saleflowData._id, item.item);
              this.header.removeItem(this.saleflowData._id, item.item);
            }
          });
          orderData.products = orderData.products.filter(
            (product) => !itemIDs.includes(product.item)
          );
        }
        await this.organizeItems(merchant);

        this.searchBar.valueChanges.subscribe((change) =>
          this.filterItemsBySearch(change)
        );

        this.status = 'complete';
        unlockUI();
      }
      if (
        !this.saleflowData.packages.length &&
        !this.saleflowData.items.length
      ) {
        this.status = 'complete';
        unlockUI();
      }
    });
    this.route.queryParams.subscribe((queries) => {
      if (queries.viewtype === 'preview') this.viewtype = 'preview';
    });
    if (this.header.customizerData) this.header.customizerData = null;
  }

  filterItemsBySearch(searchTerm: string) {
    if (searchTerm !== '' && searchTerm) {
      this.filteredItemsPerTag = JSON.parse(JSON.stringify(this.itemsPerTag));

      this.filteredItemsPerTag.forEach((group) => {
        group.items = group.items.filter((item) =>
          this.filterItemsPerSearchTerm(item, searchTerm)
        );
      });

      this.filteredItemsWithoutTags = this.itemsWithoutTags.filter((item) =>
        this.filterItemsPerSearchTerm(item, searchTerm)
      );

      this.filteredItems = this.items.filter((item) =>
        this.filterItemsPerSearchTerm(item, searchTerm)
      );
    } else {
      this.filteredItemsPerTag = this.itemsPerTag;
      this.filteredItems = this.items;
      this.filteredItemsWithoutTags = this.itemsWithoutTags;
    }
  }

  filterItemsPerSearchTerm(item: Item, searchTerm: string): boolean {
    let shouldIncludeItemInSearchResults = false;

    if (
      item.name &&
      typeof item.name === 'string' &&
      item.params.length === 0
    ) {
      if (item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        shouldIncludeItemInSearchResults = true;
      }
    }

    if (item.params.length > 0) {
      item.params[0].values.forEach((typeOfItem) => {
        if (typeOfItem.name && typeof typeOfItem.name === 'string') {
          if (
            typeOfItem.name.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            shouldIncludeItemInSearchResults = true;
          }
        }
      });
    }

    return shouldIncludeItemInSearchResults;
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
          this.items[index].isSelected = !this.items[index].isSelected;
          this.header.storeOrderProduct(this.saleflowData._id, {
            item: this.items[index]._id,
            amount: 1,
            saleflow: this.saleflowData._id,
          });
          this.header.storeItem(this.saleflowData._id, this.items[index]);
        }
      }
    }
  }

  seeCategories(index: number | string) {
    if (typeof index === 'string')
      this.router.navigate([
        `ecommerce/category-items/${this.saleflowData._id}/${index}`,
      ]);
    else
      this.router.navigate([
        `ecommerce/category-items/${this.saleflowData._id}/${
          this.itemsByCategory[index].items[0].category.find(
            (category) => category.name === this.itemsByCategory[index].label
          )._id
        }`,
      ]);
  }

  onItemClick(id: string, justRedirect: boolean = false) {
    const itemData = this.items.find((item) => item._id === id);
    if (!itemData) return;
    if (itemData.category.length)
      this.header.categoryId = itemData.category[0]?._id;
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
        amount: undefined,
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
    } else {
      if (!justRedirect) {
        if (!this.saleflowData.canBuyMultipleItems) {
          this.header.emptyOrderProducts(this.saleflowData._id);
          this.header.emptyItems(this.saleflowData._id);
        }
        this.header.storeOrderProduct(this.saleflowData._id, {
          item: itemData._id,
          amount: 1,
          saleflow: this.saleflowData._id,
        });
        this.header.storeItem(this.saleflowData._id, itemData);
      }
      this.router.navigate([
        `/ecommerce/item-detail/${this.saleflowData._id}/${itemData._id}`,
      ]);
    }
  }

  save(index?: number) {
    this.header.items = [];
    let products = [];
    let order;
  }

  goToItemDetail(id: string) {
    this.router.navigate([
      `/ecommerce/item-detail/${this.saleflowData._id}/${id}`,
    ]);
  }

  onShareClick = () => {
    this.onShareCallback(`/ecommerce/store/${this.saleflowData._id}`);
  };

  onShareCallback = (url: string) => {
    const list: StoreShareList[] = [
      {
        qrlink: `${this.URI}${url}`,
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}${url}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}${url}`,
          },
        ],
      },
    ];
    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  openDialog() {
    const list = [
      {
        text: 'Cerrar Sesión',
        callback: async () => {
          await this.authService.signout();
        },
      },
    ];

    if (!this.user) {
      list.pop();
      list.push({
        text: 'Iniciar sesión',
        callback: async () => {
          this.router.navigate(['auth/login']);
        },
      });
    }

    if (this.userDefaultMerchant) {
      list.unshift({
        text: 'Ir a mi Dashboard',
        callback: async () => {
          this.router.navigate(['admin/items-dashboard']);
        },
      });
    }

    this.dialog.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        optionsList: list,
        title: 'Sobre las facturas',
        cancelButton: {
          text: 'Cerrar',
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  back() {
    this.location.back();
  }

  async getTags() {
    const userTag = await this.tagsService.tags({
      findBy: {
        user: this.saleflowData.merchant.owner._id,
        status: 'active',
      },
      options: {
        limit: 60,
      },
    });
    this.tags = userTag.tags;
  }

  async selectTag(tag: ExtendedTag, tagIndex: number) {
    if (this.tags[tagIndex].selected) {
      this.tags[tagIndex].selected = false;
      this.selectedTagsCounter--;

      this.selectedTags = this.selectedTags.filter(
        (selectedTag) => selectedTag._id !== tag._id
      );
    } else {
      const selectedTagObject = { ...tag };

      this.tags[tagIndex].selected = true;

      delete selectedTagObject.selected;

      this.selectedTags.push(selectedTagObject);
      this.selectedTagsCounter++;
    }

    await this.getItems();
  }

  async getItems() {
    const selectedTagIds = this.selectedTags.map((tag) => tag._id);
    const orderData = this.header.getOrder(this.saleflowData._id);

    const saleflowItems = this.saleflowData.items.map((saleflowItem) => ({
      item: saleflowItem.item._id,
      customizer: saleflowItem.customizer?._id,
      index: saleflowItem.index,
    }));

    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.item)),
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: 60,
      },
    };

    if (this.selectedTags.length > 0) {
      pagination.findBy.tags = {
        __in: selectedTagIds,
      };
    }

    const items = await this.saleflow.listItems(pagination);
    this.items = items.listItems.filter((item) => {
      return item.status === 'active' || item.status === 'featured';
    });

    this.filteredItems = this.items;

    this.organizeItems(this.merchantService.merchantData);
  }

  getSelectedTagsNames(selectedTags: Array<Tag>) {
    return this.selectedTags.map((tag) => tag.name);
  }

  async resetSelectedTags() {
    this.selectedTags = [];
    this.selectedTagsCounter = 0;
    this.tags.forEach((tag) => (tag.selected = false));

    await this.getItems();
  }
}
