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

  windowWidth: number = 0;

  async infinitePagination() {
    const page = document.querySelector('.store-page');
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;

    if (verticalScroll >= pageScrollHeight) {
      await this.getItems();
    }
  }

  @ViewChild('tagsSwiper') tagsSwiper: SwiperComponent;
  terms: any[] = [];

  constructor(
    private dialog: DialogService,
    private router: Router,
    private route: ActivatedRoute,
    private merchantService: MerchantsService,
    public header: HeaderService,
    private saleflow: SaleFlowService,
    private authService: AuthService,
    private tagsService: TagsService
  ) {}

  async ngOnInit(): Promise<void> {
    setTimeout(() => {
      this.route.queryParams.subscribe(async (queryParams) => {
        let { startOnSnapshot } = queryParams;
        startOnSnapshot = Boolean(startOnSnapshot);
        localStorage.removeItem('flowRoute');
        this.header.flowRoute = null;

        if (
          !this.header.storeTemporalData &&
          localStorage.getItem('storeTemporalData')
        ) {
          this.header.storeTemporalData = JSON.parse(
            localStorage.getItem('storeTemporalData')
          );
        }

        if (!this.header.storeTemporalData || !startOnSnapshot)
          this.executeProcessesAfterLoading();
        else this.getPageSnapshot();
      });

      this.windowWidth = window.innerWidth >= 500 ? 500 : window.innerWidth;

      window.addEventListener('resize', () => {
        this.windowWidth = window.innerWidth >= 500 ? 500 : window.innerWidth;
      });
      const viewsMerchants = (async () => {
        const pagination: PaginationInput = {
          findBy: {
            type: 'refund',
          },
        };
        const types: any[] = [
          { type: 'refund', text: 'Políticas de reembolsos' },
          { type: 'delivery-politics', text: 'Políticas de entregas' },
          { type: 'security', text: 'Políticas de seguridad' },
          { type: 'privacy', text: 'Políticas de privacidad' },
        ];
        for (const { type, text } of types) {
          pagination.findBy.type = type;
          const [{ _id, description }] =
            ((await this.merchantService.viewsMerchants(
              pagination
            )) as any) || { _id: '' };

          this.terms.push({ _id, text });
        }
      })();
    }, 300);
  }

  async getHighlightedItems() {
    const saleflowItems = this.header.saleflow.items.map((saleflowItem) => ({
      item: saleflowItem.item._id,
      customizer: saleflowItem.customizer?._id,
      index: saleflowItem.index,
    }));

    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.item)),
        },
        status: 'featured',
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: 10,
        page: 1,
      },
    };

    const { listItems: highlightedItems } = await this.saleflow.listItems(
      pagination
    );

    for (const item of highlightedItems) {
      if (item.status === 'featured') {
        this.highlightedItems.push(item);
      }
    }
  }

  async organizeItems(preventFetchingHighlightedItems = false) {
    // .sort((a, b) => a.pricing - b.pricing);
    this.highlightedItems = [];

    if (!preventFetchingHighlightedItems) {
      //Sets highlightedItems array
      await this.getHighlightedItems();
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

  async executeProcessesAfterLoading() {
    this.status = 'loading';
    lockUI();

    // Resetear status de la ultima orden creada
    this.header.orderId = null;
    this.getTags();
    this.header.merchantInfo = await this.merchantService.merchant(
      this.header.saleflow.merchant._id
    );
    if (this.header.user)
      this.userDefaultMerchant = await this.merchantService.merchantDefault();
    // Determina si el usuario actual es el dueño de la tienda
    if (this.header.user?._id === this.header.saleflow.merchant?.owner?._id)
      this.admin = true;
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

    const { listItems: allItems } = await this.saleflow.hotListItems({
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.item)),
        },
        $or: [
          {
            status: 'active',
          },
          {
            status: 'featured',
          },
        ],
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: -1,
      },
    });

    // Obteniendo la lista de los items seleccionados
    const selectedItems = this.header.order?.products?.length
      ? this.header.order.products.map((subOrder) => subOrder.item)
      : [];
    // Filtrando los productos activos y destacados
    this.items = items.listItems.filter(
      (item) => item.status === 'active' || item.status === 'featured'
    );

    for (let i = 0; i < this.items.length; i++) {
      const saleflowItem = saleflowItems.find(
        (item) => item.item === this.items[i]._id
      );
      // Asignando el status a los items del saleflow
      const item = this.header.saleflow.items.find(
        (saleflowItem) => saleflowItem.item._id === this.items[i]._id
      );
      item.item.status = this.items[i].status;
      // Asignando customizer e index a los productos correspondientes
      this.items[i].customizerId = saleflowItem.customizer;
      this.items[i].index = saleflowItem.index;
      // Si la tienda permite compra múltiple, marcar items seleccionados
      if (this.header.saleflow.canBuyMultipleItems)
        this.items[i].isSelected = selectedItems.includes(this.items[i]._id);
      if (this.items[i].hasExtraPrice)
        // Si el producto tiene precio extra, aplicar fórmula
        this.items[i].totalPrice =
          this.items[i].fixedQuantity *
            this.items[i].params[0].values[0].price +
          this.items[i].pricing;
    }
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
        if (!allItems.some((product) => product._id === item.item)) {
          itemIDs.push(item.item);
          this.header.removeOrderProduct(item.item);
          this.header.removeItem(item.item);
        }
      });
      this.header.order.products = this.header.order.products.filter(
        (product) => !itemIDs.includes(product.item)
      );
    }
    await this.organizeItems();

    // Detectando cambios en la barra de búsqueda
    this.searchBar.valueChanges.subscribe(async (change) => {
      await this.getItems(true);
    });

    this.status = 'complete';
    this.paginationState.status = 'complete';
    unlockUI();
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
          this.header.storeOrderProduct({
            item: itemData._id,
            customizer: itemData.customizerId,
            params: itemParams,
            amount: itemData.customizerId ? undefined : 1,
            saleflow: this.header.saleflow._id,
          });
          this.header.storeItem(itemData);
        } else {
          this.items[index].isSelected = !this.items[index].isSelected;
          this.header.storeOrderProduct({
            item: this.items[index]._id,
            amount: 1,
            saleflow: this.header.saleflow._id,
          });
          this.header.storeItem(this.items[index]);
        }
      }
    }
  }

  onItemClick(id: string) {
    const itemData = this.items.find((item) => item._id === id);
    if (itemData?.customizerId) {
      if (!this.header.saleflow.canBuyMultipleItems) {
        this.header.emptyOrderProducts();
        this.header.emptyItems();
      }
      if (itemData.category.length)
        this.header.categoryId = itemData.category[0]?._id;
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
      this.header.items = [itemData];
      this.header.order = {
        products: [product],
      };
      this.header.storeOrderProduct(product);
      this.header.storeItem(itemData);
      this.router.navigate([`../provider-store/${itemData._id}`], {
        relativeTo: this.route,
      });
      return;
    }
    this.savePageSnapshot();
    this.router.navigate([`../article-detail/item/${id}`], {
      replaceUrl: this.header.checkoutRoute ? true : false,
      relativeTo: this.route,
      queryParams: {
        mode: 'saleflow',
        id: this.header.saleflow._id,
      },
    });
  }

  //Same dialog as openDialog() but with StoreShare
  openUserManagementDialog = () => {
    const list: StoreShareList[] = [
      {
        title: 'Menu de opciones',
        options: [
          {
            text: 'Ir a mi perfil',
            mode: 'func',
            func: async () => {
              await this.router.navigate([
                `/others/user-contact-landing/${this.header.user._id}`,
              ]);
            },
          },
          {
            text: 'Cerrar sesión',
            mode: 'func',
            func: async () => {
              await this.authService.signoutThree();
            },
          },
        ],
      },
    ];

    if (!this.header.user) {
      list[0].options.pop();
      list[0].options.push({
        text: 'Iniciar sesión',
        mode: 'func',
        func: async () => {
          this.router.navigate(['auth/login'], {
            queryParams: {
              redirect: `ecommerce/${this.header.saleflow.merchant.slug}/store`,
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

  async getTags() {
    const { tags: tagsList } = await this.tagsService.tags({
      findBy: {
        entity: 'item',
        status: 'active',
        user: this.header.saleflow.merchant.owner._id,
      },
      options: {
        limit: -1,
      },
    });

    if (tagsList) {
      this.tags = tagsList;
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
  }

  async selectTag(tag: ExtendedTag, tagIndex: number) {
    if (this.selectedTags.length === 0) {
      this.showSearchbar = false;
    }

    console.log(this.tags[tagIndex].selected, 'seleccionado');

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
    // this.header.getOrder();

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

        this.organizeItems(true);

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
    localStorage.removeItem('storeTemporalData');
  }

  savePageSnapshot() {
    this.header.storeTemporalData = {
      saleflowData: this.header.saleflow,
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
      user: this.header.user,
      userDefaultMerchant: this.userDefaultMerchant,
      showSearchbar: this.showSearchbar,
      paginationState: this.paginationState,
    };

    localStorage.setItem(
      'storeTemporalData',
      JSON.stringify(this.header.storeTemporalData)
    );

    this.header.flowRoute = this.router.url + '?startOnSnapshot=true';
    localStorage.setItem('flowRoute', this.header.flowRoute);
  }

  getActiveTagsFromSelectedTagsPermantent(): Array<string> {
    return this.tags.filter((tag) => tag.selected).map((tag) => tag._id);
  }

  redirectToTermsOfUse(term: any) {
    this.header.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.header.flowRoute);

    this.savePageSnapshot();

    this.router.navigate(['/ecommerce/terms-of-use/' + term._id]);
  }
}
