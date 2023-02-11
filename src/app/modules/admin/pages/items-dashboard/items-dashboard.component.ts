import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { ToastrService } from 'ngx-toastr';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Calendar } from 'src/app/core/models/calendar';
import {
  Item,
  ItemImageInput,
  ItemInput,
  ItemStatus,
} from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { Reservation } from 'src/app/core/models/reservation';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { CalendarsService } from 'src/app/core/services/calendars.service';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { HelperHeaderInput } from 'src/app/shared/components/helper-headerv2/helper-headerv2.component';
import { ItemImagesComponent } from 'src/app/shared/dialogs/item-images/item-images.component';
import { ItemListSelectorComponent } from 'src/app/shared/dialogs/item-list-selector/item-list-selector.component';
import {
  SettingsComponent,
  SettingsDialogButton,
} from 'src/app/shared/dialogs/settings/settings.component';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';

interface MenuOption {
  name: string;
  active?: boolean;
}

interface ExtendedCalendar extends Calendar {
  pastReservations?: Array<Reservation>;
  futureReservations?: Array<Reservation>;
  slotsAvailable?: number;
  noLimitsMode?: boolean;
}

export interface ExtendedTag extends Tag {
  selected?: boolean;
}

export interface ExtendedItem extends Item {
  tagsFilled?: Array<Tag>;
}

@Component({
  selector: 'app-items-dashboard',
  templateUrl: './items-dashboard.component.html',
  styleUrls: ['./items-dashboard.component.scss'],
})
export class ItemsDashboardComponent implements OnInit {
  URI: string = environment.uri;
  headerConfiguration: HelperHeaderInput = {
    mode: 'basic',
    fixed: true,
    bgColor: '#2874ad',
    mainText: {
      text: 'Simbolos',
      fontFamily: 'SfProBold',
      fontSize: '21px',
      color: '#FFF',
    },
    dots: {
      active: true,
    },
  };
  menuOpened: boolean;
  executingMenuOpeningAnimation: boolean;
  executingMenuClosingAnimation: boolean;
  menuNavigationOptions: Array<MenuOption> = [
    {
      name: 'Items',
      active: true,
    },
    {
      name: 'Facturas',
    },
    {
      name: 'Tags',
    },
  ];
  allItems: ExtendedItem[] = [];
  itemsTotalCounter = 0;
  activeItems: Item[] = [];
  inactiveItems: Item[] = [];
  inactiveItemsCounter: number = 0;
  totalItemsCounter: number = 0;
  activeItemsCounter: number = 0;
  featuredItemsCounter: number = 0;
  archivedItemsCounter: number = 0;
  highlightedItems: ExtendedItem[] = [];
  filteredHighlightedItems: ExtendedItem[] = [];
  activeMenuOptionIndex: number = 0;
  tagsList: Array<ExtendedTag> = [];
  tagsLoaded: boolean;
  tagsHashTable: Record<string, Tag> = {};
  tagsByNameHashTable: Record<string, Tag> = {};
  selectedTags: Array<Tag> = [];
  selectedTagsPermanent: Array<Tag> = [];
  selectedTagsCounter: number = 0;
  unselectedTags: Array<ExtendedTag> = [];
  user: User;
  merchantDefault: Merchant;
  menuNavigationSwiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
  };
  tagsSwiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 8,
  };
  public highlightedConfigSwiper: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 0,
  };
  saleflowBuyers: Array<User> = [];
  ordersTotal: {
    total: number;
    length: number;
    selled?: number;
  };
  saleflowCalendar: ExtendedCalendar;
  env: string = environment.assetsUrl;
  hasCustomizer: boolean;
  itemSearchbar: FormControl = new FormControl('');
  showSearchbar: boolean = true;
  renderItemsPromise: Promise<any>;
  paginationState: {
    pageSize: number;
    page: number;
    status: 'loading' | 'complete';
  } = {
    page: 1,
    pageSize: 15,
    status: 'complete',
  };
  windowWidth: number = 0;
  tagsMetrics: {
    inItems: number;
    inOrders: number;
    visible: number;
    hidden: number;
    featured: number;
    archived: number;
    total: number;
  } = {
    inItems: 0,
    inOrders: 0,
    visible: 0,
    hidden: 0,
    featured: 0,
    archived: 0,
    total: 0,
  };

  @ViewChild('tagSwiper') tagSwiper: SwiperComponent;
  @ViewChild('highlightedItemsSwiper') highlightedItemsSwiper: SwiperComponent;

  swiperConfig: SwiperOptions = {
    allowSlideNext: false,
  };
  openedDialogFlow: boolean = false;
  dialogs: Array<EmbeddedComponentWithId> = [];
  reachTheEndOfPagination: boolean = false;

  async infinitePagination() {
    const page = document.querySelector('.dashboard-page');
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;

    if (verticalScroll >= pageScrollHeight) {
      if (
        this.paginationState.status === 'complete' &&
        this.tagsLoaded &&
        !this.reachTheEndOfPagination
      ) {
        await this.inicializeItems(false, true);
      }
    }
  }

  constructor(
    private _MerchantsService: MerchantsService,
    private _SaleflowService: SaleFlowService,
    private authService: AuthService,
    private tagsService: TagsService,
    private calendarsService: CalendarsService,
    private reservationsService: ReservationService,
    private ordersService: OrderService,
    private _ItemsService: ItemsService,
    private router: Router,
    private headerService: HeaderService,
    private route: ActivatedRoute,
    private ngNavigatorShareService: NgNavigatorShareService,
    private _ToastrService: ToastrService,
    private dialog: DialogService,
    private dialogFlowService: DialogFlowService
  ) {}

  async ngOnInit() {
    setTimeout(() => {
      this.route.queryParams.subscribe(async (queryParams) => {
        let { startOnSnapshot } = queryParams;
        startOnSnapshot = Boolean(startOnSnapshot);
        localStorage.removeItem('flowRoute');
        this.headerService.flowRoute = null;

        await this.verifyIfUserIsLogged();

        if (!this.headerService.dashboardTemporalData || !startOnSnapshot) {
          await this.inicializeTags();
          await this.inicializeItems(true, false, true);
          await this.inicializeHighlightedItems();
          await this.inicializeArchivedItems();
          await this.getOrdersTotal();
          await this.getMerchantBuyers();
          await this.inicializeSaleflowCalendar();
        } else {
          this.getPageSnapshot();
        }
      });

      this.itemSearchbar.valueChanges.subscribe(
        async (change) => await this.inicializeItems(true, false)
      );

      this.windowWidth = window.innerWidth >= 500 ? 500 : window.innerWidth;

      window.addEventListener('resize', () => {
        this.windowWidth = window.innerWidth >= 500 ? 500 : window.innerWidth;
      });

      this.dialogs = [
        {
          component: ItemListSelectorComponent,
          componentId: 'itemPricing',
          inputs: {
            containerStyles: {},
            title: '¿Que monto te pagarán por el artículo?',
            inputs: [
              {
                dialogId: 'itemPricing',
                type: 'currency',
                name: 'pricing',
                innerLabel: 'Pesos Dominicanos',
              },
            ],
          },
          outputs: [
            {
              name: 'formOutput',
              callback: ({ pricing }: { pricing: number }) => {
                if (pricing > 0) this.swiperConfig.allowSlideNext = true;
                else this.swiperConfig.allowSlideNext = false;
                this._ItemsService.itemPrice = pricing;
                this.dialogFlowService.saveData(
                  pricing,
                  'flow1',
                  'itemPricing',
                  'pricing'
                );
              },
            },
          ],
        },
        {
          component: ItemImagesComponent,
          componentId: 'itemImages',
          inputs: {
            containerStyles: {},
          },
          outputs: [
            {
              name: 'enteredImages',
              callback: async (files: File[]) => {
                let images: ItemImageInput[] = files.map((file) => {
                  return {
                    file: file,
                    index: 0,
                    active: true,
                  };
                });
                if (!this._ItemsService.itemPrice) return;
                lockUI();
                const itemInput: ItemInput = {
                  name: null,
                  description: null,
                  pricing: this._ItemsService.itemPrice,
                  images,
                  merchant: this._MerchantsService.merchantData?._id,
                  content: [],
                  currencies: [],
                  hasExtraPrice: false,
                  purchaseLocations: [],
                  showImages: images.length > 0,
                };
                this._ItemsService.itemPrice = null;

                const { createItem } = await this._ItemsService.createItem(
                  itemInput
                );
                await this._SaleflowService.addItemToSaleFlow(
                  {
                    item: createItem._id,
                  },
                  this._SaleflowService.saleflowData._id
                );
                this._ToastrService.success(
                  'Producto creado satisfactoriamente!'
                );
                unlockUI();
                const reader = new FileReader();
                reader.onload = (e) => {
                  this._ItemsService.editingImageId = createItem.images[0]._id;
                  this.router.navigate([
                    `admin/article-editor/${createItem._id}`,
                  ]);
                };
                reader.readAsDataURL(images[0].file as File);
              },
            },
          ],
        },
      ];
    }, 1000);
  }

  closedDialog() {
    this._ItemsService.itemPrice = null;
  }

  async verifyIfUserIsLogged() {
    this.user = await this.authService.me();

    if (this.user) {
      const merchantDefault = await this._MerchantsService.merchantDefault();

      if (merchantDefault) this.merchantDefault = merchantDefault;
      else {
        this.router.navigate(['others/error-screen']);
      }
    }
  }

  async inicializeTags() {
    const tagsList = await this.tagsService.tagsByUser({
      findBy: {
        $or: [
          {
            entity: 'item',
          },
          {
            entity: 'order',
          },
        ],
      },
      options: {
        limit: -1,
      },
    });

    if (tagsList) {
      this.tagsList = tagsList
        .filter((tag) => tag.entity === 'item')
        .sort((a, b) => (a.index > b.index ? 1 : -1));
      this.unselectedTags = [...this.tagsList];

      for (const tag of this.tagsList) {
        this.tagsHashTable[tag._id] = tag;
        this.tagsByNameHashTable[tag.name] = tag;
      }

      for (const tag of tagsList) {
        if (tag.status === 'disabled') this.tagsMetrics.hidden++;
        else if (tag.status === 'active') this.tagsMetrics.visible++;
        else if (tag.status === 'featured') {
          this.tagsMetrics.visible++;
          this.tagsMetrics.featured++;
        }

        if (tag.entity === 'item') this.tagsMetrics.inItems++;
        if (tag.entity === 'order') this.tagsMetrics.inOrders++;
      }

      this.tagsMetrics.total = tagsList.length;
    }

    const tagsArchived = await this.tagsService.hotTagsArchived({
      options: { limit: -1 },
      findBy: {
        $or: [
          {
            entity: 'item',
          },
          {
            entity: 'order',
          },
        ],
      },
    });

    this.tagsMetrics.archived = tagsArchived.length;

    this.tagsLoaded = true;
  }

  async inicializeHighlightedItems() {
    const saleflowItems = this._SaleflowService.saleflowData.items.map(
      (saleflowItem) => ({
        itemId: saleflowItem.item._id,
        customizer: saleflowItem.customizer?._id,
        index: saleflowItem.index,
      })
    );
    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.itemId)),
        },
        status: 'featured',
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: 10,
      },
    };

    const { listItems: highlitedItems } = await this._SaleflowService.listItems(
      pagination
    );

    if (highlitedItems) {
      this.highlightedItems = highlitedItems;

      for (const item of this.highlightedItems) {
        item.tagsFilled = [];

        if (item.tags.length > 0) {
          for (const tagId of item.tags) {
            if (tagId && this.tagsHashTable[tagId]) {
              item.tagsFilled.push(this.tagsHashTable[tagId]);
            }
          }
        }
      }
    }

    setTimeout(() => {
      if (
        this.highlightedItemsSwiper &&
        this.highlightedItemsSwiper.directiveRef
      )
        this.highlightedItemsSwiper.directiveRef.update();
    }, 300);
  }

  async inicializeArchivedItems() {
    const saleflowItems = this._SaleflowService.saleflowData.items.map(
      (saleflowItem) => ({
        itemId: saleflowItem.item._id,
        customizer: saleflowItem.customizer?._id,
        index: saleflowItem.index,
      })
    );
    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.itemId)),
        },
        status: 'archived',
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: -1,
      },
    };

    const response = await this._ItemsService.itemsArchived(pagination);

    if (response && Array.isArray(response)) {
      this.archivedItemsCounter = response.length;
    }
  }

  async inicializeItems(
    restartPagination = false,
    triggeredFromScroll = false,
    getTotalNumberOfItems = false
  ) {
    const saleflowItems = this._SaleflowService.saleflowData.items.map(
      (saleflowItem) => ({
        itemId: saleflowItem.item._id,
        customizer: saleflowItem.customizer?._id,
        index: saleflowItem.index,
      })
    );
    if (saleflowItems.some((item) => item.customizer))
      this.hasCustomizer = true;

    this.paginationState.status = 'loading';

    if (restartPagination) {
      this.reachTheEndOfPagination = false;
      this.paginationState.page = 1;
      this.allItems = [];
    } else {
      this.paginationState.page++;
    }

    const selectedTagIds = this.selectedTags.map((tag) => tag._id);

    //Search tagids that match the searchbar value
    Object.keys(this.tagsByNameHashTable).forEach((tagName) => {
      if (
        tagName
          .toLowerCase()
          .includes((this.itemSearchbar.value as string).toLowerCase()) &&
        (this.itemSearchbar.value as string) !== ''
      ) {
        const tagId = this.tagsByNameHashTable[tagName]._id;

        if (!selectedTagIds.includes(tagId)) {
          selectedTagIds.push(tagId);
        }
      }
    });

    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.itemId)),
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
    };

    if (this.selectedTags.length > 0) {
      pagination.findBy.tags = selectedTagIds;
    }

    if (this.itemSearchbar.value !== '') {
      pagination.findBy = {
        ...pagination.findBy,
        $or: [
          {
            name: {
              __regex: {
                pattern: this.itemSearchbar.value,
                options: 'gi',
              },
            },
          },
          {
            'params.values.name': {
              __regex: {
                pattern: this.itemSearchbar.value,
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

    this.renderItemsPromise = this._SaleflowService.listItems(pagination, true);
    this.renderItemsPromise.then(async (response) => {
      const items = response;
      const itemsQueryResult = items?.listItems;

      if (getTotalNumberOfItems) {
        pagination.options.limit = -1;
        const { listItems: allItems } =
          await this._SaleflowService.hotListItems(pagination);

        allItems.forEach((item) => {
          if (item.status === 'featured') {
            this.featuredItemsCounter++;
            this.activeItemsCounter++;
          } else if (item.status === 'active') {
            this.activeItemsCounter++;
          } else if (item.status === 'disabled') {
            this.inactiveItemsCounter++;
          }
        });

        this.totalItemsCounter = allItems.length;
      }

      if (itemsQueryResult.length === 0 && this.paginationState.page === 1) {
        this.allItems = [];
      }

      if (itemsQueryResult.length === 0 && this.paginationState.page !== 1) {
        this.paginationState.page--;
        this.reachTheEndOfPagination = true;
      }

      if (itemsQueryResult && itemsQueryResult.length > 0) {
        if (this.paginationState.page === 1) {
          this.allItems = itemsQueryResult;
        } else {
          this.allItems = this.allItems.concat(itemsQueryResult);
        }

        this.activeItems = this.allItems.filter(
          (item) => item.status === 'active' || item.status === 'featured'
        );
        this.inactiveItems = this.allItems.filter(
          (item) => item.status === 'disabled'
        );

        const tagsAndItemsHashtable: Record<string, Array<Item>> = {};

        //*************************FILLS EACH TAG SECTION WITH ITEMS THAT ARE BINDED TO THAT TAG***************//
        for (const item of this.allItems) {
          item.tagsFilled = [];

          if (item.tags && Array.isArray(item.tags) && item.tags.length > 0) {
            for (const tagId of item.tags) {
              if (tagId && this.tagsHashTable[tagId]) {
                item.tagsFilled.push(this.tagsHashTable[tagId]);
              }
            }
          }
        }
      }
      this.paginationState.status = 'complete';

      if (
        itemsQueryResult.length === 0 &&
        this.itemSearchbar.value !== '' &&
        !triggeredFromScroll
      ) {
        this.allItems = [];
      }
    });
  }

  async inicializeSaleflowCalendar() {
    if (
      this._SaleflowService.saleflowData &&
      'module' in this._SaleflowService.saleflowData &&
      'appointment' in this._SaleflowService.saleflowData.module &&
      this._SaleflowService.saleflowData.module.appointment
    ) {
      this.saleflowCalendar = await this.calendarsService.getCalendar(
        this._SaleflowService.saleflowData.module.appointment?.calendar?._id
      );

      if (this.saleflowCalendar) {
        this.menuNavigationOptions.push({
          name: 'Citas',
        });
      }

      const today = new Date();
      const params: PaginationInput = {
        findBy: { calendar: this.saleflowCalendar?._id },
        options: {
          limit: 7000,
        },
      };
      const result: Array<Reservation> =
        await this.reservationsService.getReservationByCalendar(params);
      if (result) {
        const past = result.filter(({ date }) => {
          const { from } = date;
          const _date = new Date(from);
          const flag = _date <= today;
          const result = flag;
          return result;
        });

        const future = result.filter(({ date }) => {
          const { from } = date;
          const _date = new Date(from);
          const flag = _date > today;
          const result = flag;
          return result;
        });

        const numWeeks = 1;
        const from = new Date();
        const until = new Date();
        until.setDate(from.getDate() + numWeeks * 7);

        const reservationSpacesAvailableQueryResult =
          await this.reservationsService.reservationSpacesAvailable(
            until,
            from,
            this.saleflowCalendar._id
          );

        if (reservationSpacesAvailableQueryResult) {
          const { reservationSpacesAvailable } =
            reservationSpacesAvailableQueryResult;
          this.saleflowCalendar.slotsAvailable = reservationSpacesAvailable;
        } else {
          this.saleflowCalendar.noLimitsMode = true;
        }

        this.saleflowCalendar.pastReservations = past;
        this.saleflowCalendar.futureReservations = future;
      }
    }
  }

  async getOrdersTotal() {
    try {
      const ordersTotalResponse = await this.ordersService.ordersTotal(
        ['in progress', 'to confirm', 'completed'],
        this._MerchantsService.merchantData._id
      );

      const incomeMerchantResponse =
        await this._MerchantsService.incomeMerchant({
          findBy: {
            merchant: this._MerchantsService.merchantData._id,
          },
        });

      this.ordersTotal = { length: null, total: null };
      if (ordersTotalResponse) {
        this.ordersTotal.length = ordersTotalResponse.length;
        this.ordersTotal.selled = ordersTotalResponse.items;
      }

      if (incomeMerchantResponse) {
        this.ordersTotal.total = incomeMerchantResponse;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getMerchantBuyers() {
    try {
      this.saleflowBuyers = await this._MerchantsService.usersOrderMerchant(
        this._MerchantsService.merchantData._id
      );
    } catch (error) {
      console.log(error);
    }
  }

  openOrCloseMenu() {
    this.executingMenuClosingAnimation = this.menuOpened ? true : false;
    this.executingMenuOpeningAnimation = !this.menuOpened ? true : false;

    this.menuOpened = !this.menuOpened;

    if (this.menuOpened) {
      setTimeout(() => {
        this.executingMenuOpeningAnimation = false;
      }, 1750);
    }

    if (!this.menuOpened) {
      setTimeout(() => {
        this.executingMenuClosingAnimation = false;
      }, 900);
    }
  }

  changeToMenuOption(index: number) {
    if (this.activeMenuOptionIndex !== null) {
      this.menuNavigationOptions[this.activeMenuOptionIndex].active = false;
    }

    this.activeMenuOptionIndex = index;
    this.menuNavigationOptions[this.activeMenuOptionIndex].active = !Boolean(
      this.menuNavigationOptions[this.activeMenuOptionIndex].active
    );
  }

  goToDetail(id: string) {
    this.savePageSnapshot();
    this.router.navigate([`admin/article-editor/${id}`]);
    this._ItemsService.itemImages = [];
  }

  savePageSnapshot() {
    this.headerService.dashboardTemporalData = {
      allItems: this.allItems,
      itemsTotalCounter: this.itemsTotalCounter,
      activeItems: this.activeItems,
      inactiveItems: this.inactiveItems,
      inactiveItemsCounter: this.inactiveItemsCounter,
      totalItemsCounter: this.totalItemsCounter,
      activeItemsCounter: this.activeItemsCounter,
      featuredItemsCounter: this.featuredItemsCounter,
      archivedItemsCounter: this.archivedItemsCounter,
      highlightedItems: this.highlightedItems,
      filteredHighlightedItems: this.filteredHighlightedItems,
      activeMenuOptionIndex: this.activeMenuOptionIndex,
      tagsList: this.tagsList,
      tagsLoaded: this.tagsLoaded,
      tagsHashTable: this.tagsHashTable,
      tagsByNameHashTable: this.tagsByNameHashTable,
      selectedTags: this.selectedTags,
      selectedTagsPermanent: this.selectedTagsPermanent,
      selectedTagsCounter: this.selectedTagsCounter,
      unselectedTags: this.unselectedTags,
      user: this.user,
      merchantDefault: this.merchantDefault,
      menuNavigationSwiperConfig: this.menuNavigationSwiperConfig,
      tagsSwiperConfig: this.tagsSwiperConfig,
      highlightedConfigSwiper: this.highlightedConfigSwiper,
      ordersTotal: this.ordersTotal,
      saleflowCalendar: this.saleflowCalendar,
      env: this.env,
      hasCustomizer: this.hasCustomizer,
      itemSearchbar: this.itemSearchbar.value,
      showSearchbar: this.showSearchbar,
      paginationState: this.paginationState,
    };
  }

  getPageSnapshot() {
    for (const property of Object.keys(
      this.headerService.dashboardTemporalData
    )) {
      if (property !== 'itemSearchbar') {
        this[property] = this.headerService.dashboardTemporalData[property];
      } else {
        this.itemSearchbar.setValue(
          this.headerService.dashboardTemporalData[property]
        );
      }
    }

    this.headerService.dashboardTemporalData = null;
  }

  goToCreateTag(tagId: string) {
    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);
    this.router.navigate([`/admin/create-tag/${tagId}`]);
  }

  openItemManagementDialog = (
    section: 'featured' | 'all-items' = 'all-items'
  ) => {
    const list: StoreShareList[] = [
      {
        title: 'GESTIÓN DE ITEMS',
        titleStyles: {
          margin: '0px',
          marginTop: '15px',
          marginBottom: '25px',
        },
        options: [
          {
            text: 'ADICIONAR',
            mode: 'func',
            func: () => {
              this.openedDialogFlow = !this.openedDialogFlow;
            },
          },
          {
            text: 'DESTACAR',
            mode: 'func',
            func: () => {
              this.router.navigate([`admin/merchant-items`], {
                queryParams: {
                  initialMode: 'highlight',
                },
              });
            },
          },
          {
            text: 'ESCONDER',
            mode: 'func',
            func: () => {
              const routerConfig: any = {
                queryParams: {
                  initialMode: 'hide',
                  actionFromDashboard: true,
                },
              };

              if (section === 'featured')
                routerConfig.queryParams.status = 'featured';

              this.router.navigate([`admin/merchant-items`], routerConfig);
            },
          },
          {
            text: 'BORRAR (ELIMINA LA DATA)',
            mode: 'func',
            func: () => {
              const routerConfig: any = {
                queryParams: {
                  initialMode: 'delete',
                  actionFromDashboard: true,
                },
              };

              if (section === 'featured')
                routerConfig.queryParams.status = 'featured';

              this.router.navigate([`admin/merchant-items`], routerConfig);
            },
          },
        ],
      },
    ];

    if (section === 'featured') {
      list[0].options.splice(1, 1);
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

  openHeaderDialog() {
    const list: Array<SettingsDialogButton> = [
      {
        text: 'Vende online. Comparte el link',
        callback: async () => {
          const link = `${this.URI}/ecommerce/${this._SaleflowService.saleflowData.merchant.slug}/store`;

          await this.ngNavigatorShareService
            .share({
              title: '',
              url: link,
            })
            .then((response) => {
              console.log(response);
            })
            .catch((error) => {
              console.log(error);
            });
        },
      },
      {
        text: 'Adiciona un artículo',
        callback: () => {
          this.openedDialogFlow = !this.openedDialogFlow;
        },
      },
      {
        text: 'Cerrar Sesión',
        callback: async () => {
          await this.authService.signout();
        },
      },
    ];

    this.dialog.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        optionsList: list,
        title: 'Menu de opciones',
        cancelButton: {
          text: 'Cerrar',
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  toggleActivateItem = async (item: Item): Promise<string> => {
    try {
      this._ItemsService.updateItem(
        {
          status:
            item.status === 'disabled'
              ? 'active'
              : item.status === 'active'
              ? 'featured'
              : 'disabled',
        },
        item._id
      );

      item.status =
        item.status === 'disabled'
          ? 'active'
          : item.status === 'active'
          ? 'featured'
          : 'disabled';

      return item.status;
    } catch (error) {
      console.log(error);
    }
  };

  openItemOptionsDialog = async (id: string) => {
    const itemsQueryResult = await this._ItemsService.item(id);
    const item: ExtendedItem = itemsQueryResult;
    item.tagsFilled = [];

    if (item.tags.length > 0) {
      for (const tagId of item.tags) {
        if (tagId && this.tagsHashTable[tagId]) {
          item.tagsFilled.push(this.tagsHashTable[tagId]);
        }
      }
    }

    const allItemIndex = this.allItems.findIndex((item) => item._id === id);
    const highlightedItemsIndex = this.highlightedItems.findIndex(
      (item) => item._id === id
    );
    const visibleItemsIndex = this.activeItems.findIndex(
      (item) => item._id === id
    );
    const invisibleItemsIndex = this.inactiveItems.findIndex(
      (item) => item._id === id
    );

    const toggleStatus = () => {
      return new Promise((resolve, reject) => {
        this.toggleActivateItem(item).then((newStatus) => {
          newStatus === 'disabled'
            ? (number = 2)
            : newStatus === 'active'
            ? (number = 0)
            : (number = 1);

          this.allItems[allItemIndex].status = newStatus as ItemStatus;

          if (newStatus === 'disabled' && visibleItemsIndex >= 0) {
            this.activeItems.splice(visibleItemsIndex, 1);
            this.inactiveItems.push(item);
          }

          if (newStatus === 'disabled' && highlightedItemsIndex >= 0) {
            this.highlightedItems.splice(highlightedItemsIndex, 1);
            this.inactiveItems.push(item);
          }

          if (newStatus === 'active' && invisibleItemsIndex >= 0) {
            this.inactiveItems.splice(invisibleItemsIndex, 1);
            this.activeItems.push(item);
          }

          if (newStatus === 'featured' && invisibleItemsIndex >= 0) {
            this.inactiveItems.splice(invisibleItemsIndex, 1);
            this.highlightedItems.push(item);

            setTimeout(() => {
              if (
                this.highlightedItemsSwiper &&
                this.highlightedItemsSwiper.directiveRef
              )
                this.highlightedItemsSwiper.directiveRef.update();
            }, 300);
          }

          if (newStatus === 'featured' && visibleItemsIndex >= 0) {
            this.highlightedItems.push(item);

            setTimeout(() => {
              if (
                this.highlightedItemsSwiper &&
                this.highlightedItemsSwiper.directiveRef
              )
                this.highlightedItemsSwiper.directiveRef.update();
            }, 300);
          }

          resolve(true);
        });
      });
    };

    let number: number =
      item.status === 'disabled' ? 2 : item.status === 'active' ? 0 : 1;
    const statuses = [
      {
        text: 'VISIBLE (NO DESTACADO)',
        backgroundColor: '#82F18D',
        color: '#174B72',
        asyncCallback: toggleStatus,
      },
      {
        text: 'VISIBLE (Y DESTACADO)',
        backgroundColor: '#82F18D',
        color: '#174B72',
        asyncCallback: toggleStatus,
      },
      {
        text: 'INVISIBLE',
        backgroundColor: '#B17608',
        color: 'white',
        asyncCallback: toggleStatus,
      },
    ];

    const list: Array<SettingsDialogButton> = [
      {
        text: 'Duplicar',
        callback: async () => {
          try {
            const createdItem: ExtendedItem =
              await this._ItemsService.duplicateItem(item._id);

            await this._SaleflowService.addItemToSaleFlow(
              {
                item: createdItem._id,
              },
              this._SaleflowService.saleflowData._id
            );

            // this._SaleflowService.saleflowData =
            //   await this._SaleflowService.saleflowDefault(
            //     this._MerchantsService.merchantData._id
            //   );
            // if (item.params && item.params.length > 0) {
            //   const { createItemParam } =
            //     await this._ItemsService.createItemParam(
            //       item.merchant._id,
            //       createItem._id,
            //       {
            //         name: item.params[0].name,
            //         formType: 'color',
            //         values: [],
            //       }
            //     );
            //   const paramValues = item.params[0].values.map((value) => {
            //     return {
            //       name: value.name,
            //       image: value.image,
            //       price: value.price,
            //       description: value.description,
            //     };
            //   });

            //   const result = await this._ItemsService.addItemParamValue(
            //     paramValues,
            //     createItemParam._id,
            //     item.merchant._id,
            //     createItem._id
            //   );
            // }

            // const itemWithParams: ExtendedItem = await this._ItemsService.item(
            //   createItem._id
            // );

            if (createdItem.tags && createdItem.tags.length) {
              createdItem.tagsFilled = [];

              if (item.tags.length > 0) {
                for (const tagId of item.tags) {
                  if (this.tagsHashTable[tagId]) {
                    createdItem.tagsFilled.push(this.tagsHashTable[tagId]);
                  }
                }
              }
            }

            this.totalItemsCounter++;

            if (createdItem.status === 'featured') {
              this.activeItemsCounter++;
              this.featuredItemsCounter++;
            }

            if (createdItem.status === 'active') {
              this.activeItemsCounter++;
            }

            if (createdItem.status === 'disabled') {
              this.inactiveItemsCounter++;
            }
            this.allItems = [createdItem].concat(this.allItems);
            this._ToastrService.info('¡Item duplicado exitosamente!');
          } catch (error) {
            console.log(error);
            this._ToastrService.error(
              'Ocurrio un error al crear el item',
              null,
              {
                timeOut: 1500,
              }
            );
          }
        },
      },
      {
        text: 'Archivar (Sin eliminar la data)',
        callback: async () => {
          try {
            const response = await this._ItemsService.updateItem(
              {
                status: 'archived',
              },
              id
            );

            if (allItemIndex >= 0 && response) {
              this.allItems.splice(allItemIndex, 1);
              this.totalItemsCounter--;
            }

            if (highlightedItemsIndex >= 0 && response) {
              this.highlightedItems.splice(highlightedItemsIndex, 1);
              this.activeItemsCounter--;
              this.featuredItemsCounter--;
            }
            if (visibleItemsIndex >= 0 && response) {
              this.activeItems.splice(visibleItemsIndex, 1);
              this.activeItemsCounter--;
            }
            if (invisibleItemsIndex >= 0 && response) {
              this.inactiveItems.splice(invisibleItemsIndex, 1);
              this.inactiveItemsCounter--;
            }

            this.archivedItemsCounter++;

            this._ToastrService.info('¡Item archivado exitosamente!');
          } catch (error) {
            console.log(error);
            this._ToastrService.error(
              'Ocurrio un error al archivar el item',
              null,
              {
                timeOut: 1500,
              }
            );
          }
        },
      },
      {
        text: 'Eliminar',
        callback: async () => {
          try {
            const removeItemFromSaleFlow =
              await this._SaleflowService.removeItemFromSaleFlow(
                item._id,
                this._SaleflowService.saleflowData._id
              );
            if (!removeItemFromSaleFlow) return;
            const deleteItem = await this._ItemsService.deleteItem(item._id);
            if (!deleteItem) return;

            let typeOfItem;

            this.allItems = this.allItems.filter(
              (listItem) => listItem._id !== item._id
            );
            this.activeItems = this.activeItems.filter((listItem) => {
              if (listItem._id === item._id) typeOfItem = 'active';

              return listItem._id !== item._id;
            });
            this.inactiveItems = this.inactiveItems.filter((listItem) => {
              if (listItem._id === item._id) typeOfItem = 'disabled';

              return listItem._id !== item._id;
            });
            this.highlightedItems = this.highlightedItems.filter((listItem) => {
              if (listItem._id === item._id) typeOfItem = 'featured';

              return listItem._id !== item._id;
            });

            this.totalItemsCounter--;

            if (typeOfItem === 'active') this.activeItemsCounter--;
            else if (typeOfItem === 'disabled') this.inactiveItemsCounter--;
            else if (typeOfItem === 'featured') {
              this.activeItemsCounter--;
              this.featuredItemsCounter--;
            }

            setTimeout(() => {
              if (
                this.highlightedItemsSwiper &&
                this.highlightedItemsSwiper.directiveRef
              )
                this.highlightedItemsSwiper.directiveRef.update();
            }, 300);

            this._ToastrService.info('¡Item borrado exitosamente!');
          } catch (error) {
            console.log(error);
            this._ToastrService.error(
              'Ocurrio un error al borrar el item',
              null,
              {
                timeOut: 1500,
              }
            );
          }
        },
      },
    ];

    this.dialog.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        optionsList: list,
        statuses,
        //qr code in the xd's too small to scanning to work
        indexValue: number,
        title: item.name ? item.name : 'Producto sin nombre',
        cancelButton: {
          text: 'Cerrar',
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  async selectTag(tag: ExtendedTag, tagIndex: number) {
    if (!this.selectedTagsCounter) {
      this.showSearchbar = false;
    }

    this.menuOpened = false;
    if (this.tagsList[tagIndex].selected) {
      this.tagsList[tagIndex].selected = false;
      this.selectedTagsCounter--;

      this.selectedTags = this.selectedTags.filter(
        (selectedTag) => selectedTag._id !== tag._id
      );

      if (this.selectedTags.length === 0) {
        this.unselectedTags = [...this.tagsList];
        this.selectedTagsPermanent = [];
        this.showSearchbar = true;
        this.itemSearchbar.setValue('');
      }
    } else {
      const selectedTagObject = { ...tag };

      this.tagsList[tagIndex].selected = true;

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

    this.inicializeItems(true);
  }

  async selectTagFromHeader(eventData: {
    selected: boolean;
    tag: ExtendedTag;
  }) {
    const tagIndex = this.tagsList.findIndex((tag) => {
      return tag._id === eventData.tag._id;
    });

    this.selectTag(eventData.tag, tagIndex);
  }

  getSelectedTagsNames() {
    return this.selectedTags.map((tag) => tag.name);
  }

  async resetSelectedTags() {
    this.selectedTags = [];
    this.selectedTagsCounter = 0;
    this.selectedTagsPermanent = [];
    this.tagsList.forEach((tag) => (tag.selected = false));
    this.unselectedTags = [...this.tagsList];
    this.showSearchbar = true;
    this.itemSearchbar.setValue('');

    setTimeout(() => {
      this.tagSwiper.directiveRef.update();
    }, 300);

    await this.inicializeItems(true);
  }

  makeSearchBarVisible() {
    this.showSearchbar = true;
  }

  getActiveTagsFromSelectedTagsPermantent(): Array<string> {
    return this.tagsList.filter((tag) => tag.selected).map((tag) => tag._id);
  }

  redirectTo(route: string, queryParams: Record<string, any>) {
    this.headerService.flowRoute = window.location.href
      .split('/')
      .slice(3)
      .join('/');
    localStorage.setItem('flowRoute', this.headerService.flowRoute);

    this.router.navigate([route], {
      queryParams,
    });
  }
}
