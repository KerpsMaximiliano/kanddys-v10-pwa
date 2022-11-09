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
import { ItemSubOrderParamsInput } from 'src/app/core/models/order';
import { PaginationInput, SaleFlow } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
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
import { Merchant } from 'src/app/core/models/merchant';
import { MerchantsService } from 'src/app/core/services/merchants.service';

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
    pageSize: 60,
    status: 'loading',
  };

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

  @HostListener('window:scroll', [])
  async infinitePagination() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      await this.getItems();
    }
  }

  @ViewChild('tagsSwiper') tagsSwiper: SwiperComponent;

  constructor(
    private dialog: DialogService,
    private router: Router,
    private merchantService: MerchantsService,
    public header: HeaderService,
    private saleflow: SaleFlowService,
    private item: ItemsService,
    private authService: AuthService,
    private appService: AppService,
    private orderService: OrderService,
    private tagsService: TagsService,
    private location: Location
  ) {}

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

  async organizeItems() {
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

  async ngOnInit(): Promise<void> {
    this.status = 'loading';
    lockUI();

    // Resetear status de la ultima orden creada
    this.header.orderId = null;

    this.getTags();
    // Obteniendo las categorias, el merchant de la tienda y el usuario actual
    const [itemCategories, headlines] = await Promise.all([
      this.item.itemCategories(this.header.saleflow.merchant._id, {
        options: {
          limit: 20,
        },
      }),
      this.item.itemCategoryHeadlineByMerchant(
        this.header.saleflow.merchant._id
      ),
    ]);
    if (this.header.user) {
      this.userDefaultMerchant = await this.merchantService.merchantDefault();
    }
    // Determina si el usuario actual es el dueño de la tienda
    if (this.header.user?._id === this.header.saleflow.merchant?.owner?._id) {
      this.admin = true;
    }
    this.categories = this.getCategories(
      itemCategories.itemCategoriesList,
      headlines[0]
    );
    this.contactLandingRoute = `user-contact-landing/${this.header.saleflow.merchant.owner._id}`;
    // Obteniendo el ID de los productos, los customizers y el orden
    const saleflowItems = this.header.saleflow.items.map((saleflowItem) => ({
      item: saleflowItem.item._id,
      customizer: saleflowItem.customizer?._id,
      index: saleflowItem.index,
    }));
    // Determina si la tienda maneja customizers
    if (saleflowItems.some((item) => item.customizer))
      this.hasCustomizer = true;
    // Fetching la data de los productos
    const items = await this.saleflow.listItems({
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.item)),
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
      },
    });
    // Obteniendo la lista de los items seleccionados
    const selectedItems =
      this.header.order?.products?.map((subOrder) => subOrder.item) || [];
    // Filtrando los productos activos y destacados
    this.items = items.listItems.filter((item) => {
      return item.status === 'active' || item.status === 'featured';
    });
    this.items.forEach((item) => {
      const saleflowItem = saleflowItems.find(
        (saleflowItem) => saleflowItem.item === item._id
      );
      // Asignando customizer e index a los productos correspondientes
      item.customizerId = saleflowItem.customizer;
      item.index = saleflowItem.index;
      // Si la tienda permite compra múltiple, marcar items seleccionados
      if (this.header.saleflow.canBuyMultipleItems)
        item.isSelected = selectedItems.includes(item._id);
      // Si el producto tiene precio extra, aplicar fórmula
      if (item.hasExtraPrice)
        item.totalPrice =
          item.fixedQuantity * item.params[0].values[0].price + item.pricing;
    });
    // Si todos los productos tienen un index, ordenar por index
    if (this.items.every((item) => item.index)) {
      this.items = this.items.sort((a, b) =>
        a.index > b.index ? 1 : b.index > a.index ? -1 : 0
      );
    }
    // Sacando productos del carrito que fueron eliminados de la tienda
    if (this.header.order?.products?.length) {
      let itemIDs: string[] = [];
      this.header.order.products.forEach((item) => {
        if (!this.items.some((product) => product._id === item.item)) {
          itemIDs.push(item.item);
          this.header.removeOrderProduct(item.item);
          this.header.removeItem(item.item);
        }
      });
      this.header.order.products = this.header.order.products.filter(
        (product) => !itemIDs.includes(product.item)
      );
    }
    // Organizando productos según su estado y categoría
    await this.organizeItems();
    if (this.header.customizerData) this.header.customizerData = null;
    // Marcar carga de la tienda como completada

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

  seeCategories(index: number | string) {
    if (typeof index === 'string')
      this.router.navigate([
        `/ecommerce/${this.header.saleflow._id}/category-items/${index}`,
      ]);
    else
      this.router.navigate([
        `/ecommerce/${this.header.saleflow._id}/category-items/${
          this.itemsByCategory[index].items[0].category.find(
            (category) => category.name === this.itemsByCategory[index].label
          )._id
        }`,
      ]);
  }

  onItemClick(id: string) {
    const itemData = this.items.find((item) => item._id === id);
    if (!itemData) return;
    if (itemData.category.length)
      this.header.categoryId = itemData.category[0]?._id;
    if (!this.header.saleflow.canBuyMultipleItems) {
      this.header.emptyOrderProducts();
      this.header.emptyItems();
    }
    if (itemData.customizerId) {
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
        saleflow: this.header.saleflow._id,
      };
      this.header.order = {
        products: [product],
      };
      this.header.storeOrderProduct(product);
      this.header.storeItem(itemData);
      this.router.navigate([
        `/ecommerce/${this.header.saleflow._id}/provider-store/${itemData._id}`,
      ]);
    } else {
      this.router.navigate(
        [
          `/ecommerce/${this.header.saleflow._id}/article-detail/item/${itemData._id}`,
        ],
        {
          replaceUrl: this.header.checkoutRoute ? true : false,
        }
      );
    }
  }

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
              redirect: 'ecommerce/store/' + this.header.saleflow._id,
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
              redirect: 'ecommerce/store/' + this.header.saleflow._id,
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
        user: this.header.saleflow.merchant.owner._id,
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

      if (unselectedTagIndexToDelete > 0) {
        this.unselectedTags.splice(unselectedTagIndexToDelete, 1);
      }
    }

    if (this.selectedTags.length === 1) {
      this.showSearchbar = false;
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
    this.header.getOrder();

    const saleflowItems = this.header.saleflow.items.map((saleflowItem) => ({
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

    const items = await this.saleflow.listItems(pagination);
    const itemsQueryResult = items.listItems.filter((item) => {
      return item.status === 'active' || item.status === 'featured';
    });

    if (this.paginationState.page === 1) {
      this.items = itemsQueryResult;
    } else {
      this.items = this.items.concat(itemsQueryResult);
    }

    this.organizeItems();

    this.paginationState.status = 'complete';
  }

  getSelectedTagsNames(selectedTags: Array<Tag>) {
    return this.selectedTags.map((tag) => tag.name);
  }

  async resetSelectedTags() {
    this.selectedTags = [];
    this.selectedTagsCounter = 0;
    this.selectedTagsPermanent = [];
    this.unselectedTags = this.tags;
    this.tags.forEach((tag) => (tag.selected = false));
    this.unselectedTags = this.tags;
    this.showSearchbar = true;

    await this.getItems(true);
  }
}
