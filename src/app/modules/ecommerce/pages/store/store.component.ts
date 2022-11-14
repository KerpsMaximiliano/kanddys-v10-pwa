import { Location } from '@angular/common';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import SwiperCore, { Virtual } from 'swiper/core';

SwiperCore.use([Virtual]);

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
  tags: ExtendedTag[] = [];
  tagsHashTable: Record<string, Tag> = {};
  tagsByNameHashTable: Record<string, Tag> = {};
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
  selectedTagsPermanent: Array<Tag> = [];
  unselectedTags: Array<Tag> = [];
  user: User = null;
  userDefaultMerchant: Merchant = null;
  showSearchbar: boolean = true;
  paginationState: {
    pageSize: number;
    page: number;
    status: 'loading' | 'complete';
  } = {
    page: 1,
    pageSize: 5,
    status: 'loading',
  };
  renderItemsPromise: Promise<any>;

  public swiperConfigTag: SwiperOptions = {
    slidesPerView: 'auto',
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

  async infinitePagination() {
    const page = document.querySelector('.store-page');
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;

    if (verticalScroll >= pageScrollHeight) {
      await this.getItems();
    }
  }

  @ViewChild('tagsSwiper') tagsSwiper: SwiperComponent;

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
    this.route.queryParams.subscribe(async (queryParams) => {
      let { startOnSnapshot } = queryParams;
      startOnSnapshot = Boolean(startOnSnapshot);

      if (!this.header.storeTemporalData || !startOnSnapshot)
        this.executeProcessesAfterLoading();
      else this.getPageSnapshot();
    });
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
            limit: this.paginationState.pageSize,
          },
        });
        const selectedItems = orderData?.products?.length
          ? orderData.products.map((subOrder) => subOrder.item)
          : [];
        this.items = items.listItems.filter((item) => {
          return item.status === 'active' || item.status === 'featured';
        });

        for (let i = 0; i < this.items.length; i++) {
          const saleflowItem = saleflowItems.find(
            (item) => item.item === this.items[i]._id
          );
          const item = this.header.saleflow.items.find(
            (saleflowItem) => saleflowItem.item._id === this.items[i]._id
          );
          item.item.status = this.items[i].status;
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

        this.searchBar.valueChanges.subscribe(async (change) => {
          await this.getItems(true);
          /*
          if (this.selectedTags.length === 0) await this.getItems(true);
          else {
            this.filterItemsBySearch(change);
          }
          */
        });

        this.status = 'complete';
        this.paginationState.status = 'complete';
        unlockUI();
      }
      if (
        !this.saleflowData.packages.length &&
        !this.saleflowData.items.length
      ) {
        this.status = 'complete';
        this.paginationState.status = 'complete';
        unlockUI();
      }
    });
    this.route.queryParams.subscribe((queries) => {
      if (queries.viewtype === 'preview') this.viewtype = 'preview';
    });
    if (this.header.customizerData) this.header.customizerData = null;
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
      this.savePageSnapshot();
      this.router.navigate(
        [
          `/ecommerce/${this.saleflowData._id}/article-detail/item/${itemData._id}`,
        ],
        {
          replaceUrl: this.header.checkoutRoute ? true : false,
          queryParams: {
            mode: 'saleflow',
            id: this.saleflowData._id,
          },
        }
      );
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

  //Same dialog as openUserManagementDialog() but with SettingsComponent
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
          this.router.navigate(['auth/login'], {
            queryParams: {
              redirect: 'ecommerce/store/' + this.saleflowData._id,
            },
          });
        },
      });
    }

    if (this.userDefaultMerchant) {
      list.unshift({
        text: 'Ir a mi Dashboard',
        callback: async () => {
          this.router.navigate(['admin/entity-detail-metrics']);
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

  //Same dialog as openDialog() but with StoreShare
  openUserManagementDialog = () => {
    const list: StoreShareList[] = [
      {
        title: 'Menu de opciones',
        options: [
          {
            text: 'Cerrar sesión',
            mode: 'func',
            func: async () => {
              await this.authService.signout();
            },
          },
        ],
      },
    ];

    if (!this.user) {
      list[0].options.pop();
      list[0].options.push({
        text: 'Iniciar sesión',
        mode: 'func',
        func: async () => {
          this.router.navigate(['auth/login'], {
            queryParams: {
              redirect: 'ecommerce/store/' + this.saleflowData._id,
            },
          });
        },
      });
    }

    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true,
        hideCancelButtton: true,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

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
    this.unselectedTags = [...this.tags];

    for (const tag of this.tags) {
      this.tagsHashTable[tag._id] = tag;
      this.tagsByNameHashTable[tag.name] = tag;
      tag.selected = false;
    }

    setTimeout(() => {
      this.tagsSwiper.directiveRef.update();
    }, 300);
  }

  async selectTag(tag: ExtendedTag, tagIndex: number) {
    if (this.selectedTags.length === 0) {
      this.showSearchbar = false;
    }

    if (this.tags[tagIndex].selected) {
      this.tags[tagIndex].selected = false;
      this.selectedTagsCounter--;

      this.selectedTags = this.selectedTags.filter(
        (selectedTag) => selectedTag._id !== tag._id
      );

      if (this.selectedTags.length === 0) {
        this.unselectedTags = [...this.tags];
        this.selectedTagsPermanent = [];
        this.showSearchbar = true;
      }
    } else {
      const selectedTagObject = { ...tag };

      this.tags[tagIndex].selected = true;

      delete selectedTagObject.selected;

      this.selectedTags.push(selectedTagObject);

      if (
        !this.selectedTagsPermanent.find(
          (tag) => tag._id === selectedTagObject._id
        )
      ) {
        this.selectedTagsPermanent.push(tag);
      }

      this.selectedTagsCounter++;

      const unselectedTagIndexToDelete = this.unselectedTags.findIndex(
        (unselectedTag) => unselectedTag._id === tag._id
      );

      if (unselectedTagIndexToDelete >= 0) {
        this.unselectedTags.splice(unselectedTagIndexToDelete, 1);
      }
    }

    await this.getItems(true);
  }

  async selectTagFromHeader(eventData: {
    selected: boolean;
    tag: ExtendedTag;
  }) {
    const tagIndex = this.tags.findIndex((tag) => {
      return tag._id === eventData.tag._id;
    });

    this.selectTag(eventData.tag, tagIndex);
  }

  async getItems(restartPagination = false) {
    this.paginationState.status = 'loading';
    const orderData = this.header.getOrder(this.saleflowData._id);

    const saleflowItems = this.saleflowData.items.map((saleflowItem) => ({
      item: saleflowItem.item._id,
      customizer: saleflowItem.customizer?._id,
      index: saleflowItem.index,
    }));

    if (restartPagination) {
      this.paginationState.page = 1;
    } else {
      this.paginationState.page++;
    }

    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.item)),
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
    };

    const selectedTagIds = this.selectedTags.map((tag) => tag._id);

    //Search tagids that match the searchbar value
    if (this.selectedTags.length === 0) {
      Object.keys(this.tagsByNameHashTable).forEach((tagName) => {
        if (
          tagName
            .toLowerCase()
            .includes((this.searchBar.value as string).toLowerCase()) &&
          (this.searchBar.value as string) !== ''
        ) {
          const tagId = this.tagsByNameHashTable[tagName]._id;

          if (!selectedTagIds.includes(tagId)) {
            selectedTagIds.push(tagId);
          }
        }
      });
    }

    if (this.selectedTags.length > 0) {
      pagination.findBy.tags = selectedTagIds;
    }

    if (this.searchBar.value !== '') {
      pagination.findBy = {
        ...pagination.findBy,
        $or: [
          {
            name: {
              __regex: {
                pattern: this.searchBar.value,
                options: 'gi',
              },
            },
          },
          {
            'params.values.name': {
              __regex: {
                pattern: this.searchBar.value,
                options: 'gi',
              },
            },
          },
        ],
      };

      //Happens when the searchbar value matches a tag name
      if (this.selectedTags.length === 0 && selectedTagIds.length > 0) {
        pagination.findBy['$or'][2] = {
          tags: {
            $in: selectedTagIds,
          },
        };
      }
    }

    this.renderItemsPromise = this.saleflow.listItems(pagination, true);
    this.renderItemsPromise
      .then((response) => {
        const items = response;
        const itemsQueryResult = items.listItems.filter((item) => {
          return item.status === 'active' || item.status === 'featured';
        });

        if (this.paginationState.page === 1) {
          this.items = itemsQueryResult;
        } else {
          this.items = this.items.concat(itemsQueryResult);
        }

        this.organizeItems(this.merchantService.merchantData);

        this.paginationState.status = 'complete';
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getSelectedTagsNames(selectedTags: Array<Tag>) {
    return this.selectedTags.map((tag) => tag.name);
  }

  async resetSelectedTags() {
    this.selectedTags = [];
    this.selectedTagsCounter = 0;
    this.selectedTagsPermanent = [];
    this.tags.forEach((tag) => (tag.selected = false));
    this.unselectedTags = [...this.tags];
    this.showSearchbar = true;

    setTimeout(() => {
      this.tagsSwiper.directiveRef.update();
    }, 300);

    await this.getItems(true);
  }

  getPageSnapshot() {
    for (const property of Object.keys(this.header.storeTemporalData)) {
      if (property !== 'searchBar') {
        this[property] = this.header.storeTemporalData[property];
      } else {
        this.searchBar.setValue(this.header.storeTemporalData[property]);
      }
    }

    this.searchBar.valueChanges.subscribe(async (change) => {
      await this.getItems(true);
    });

    this.header.storeTemporalData = null;
  }

  savePageSnapshot() {
    this.header.storeTemporalData = {
      saleflowData: this.saleflowData,
      items: this.items,
      tags: this.tags,
      tagsHashTable: this.tagsHashTable,
      tagsByNameHashTable: this.tagsByNameHashTable,
      highlightedItems: this.highlightedItems,
      searchBar: this.searchBar.value,
      selectedTagsCounter: this.selectedTagsCounter,
      selectedTags: this.selectedTags,
      selectedTagsPermanent: this.selectedTagsPermanent,
      unselectedTags: this.unselectedTags,
      user: this.user,
      userDefaultMerchant: this.userDefaultMerchant,
      showSearchbar: this.showSearchbar,
      paginationState: this.paginationState,
    };
  }

  getActiveTagsFromSelectedTagsPermantent(): Array<string> {
    return this.tags.filter((tag) => tag.selected).map((tag) => tag._id);
  }
}
