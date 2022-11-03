import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SwiperComponent, SwiperConfig } from 'ngx-swiper-wrapper';
import { Item, ItemInput, ItemStatus } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { Tag } from 'src/app/core/models/tags';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import {
  HelperHeaderInput,
  Text,
} from 'src/app/shared/components/helper-headerv2/helper-headerv2.component';
import { SwiperOptions } from 'swiper';
import { environment } from 'src/environments/environment';
import { CalendarsService } from 'src/app/core/services/calendars.service';
import { Calendar } from 'src/app/core/models/calendar';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Reservation } from 'src/app/core/models/reservation';
import { OrderService } from 'src/app/core/services/order.service';
import { FormControl } from '@angular/forms';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import {
  SettingsComponent,
  SettingsDialogButton,
} from 'src/app/shared/dialogs/settings/settings.component';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { ToastrService } from 'ngx-toastr';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';

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

interface ExtendedTag extends Tag {
  selected?: boolean;
}

interface ExtendedItem extends Item {
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
  ];
  allItems: ExtendedItem[] = [];
  activeItems: Item[] = [];
  inactiveItems: Item[] = [];
  highlightedItems: ExtendedItem[] = [];
  filteredHighlightedItems: ExtendedItem[] = [];
  activeMenuOptionIndex: number = 0;
  tagsList: Array<ExtendedTag> = [];
  tagsLoaded: boolean;
  tagsHashTable: Record<string, Tag> = {};
  tagsByNameHashTable: Record<string, Tag> = {};
  selectedTags: Array<Tag> = [];
  selectedTagsCounter: number = 0;
  unselectedTags: Array<Tag> = [];
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
  paginationState: {
    pageSize: number;
    page: number;
    status: 'loading' | 'complete';
  } = {
    page: 1,
    pageSize: 5,
    status: 'complete',
  };

  @ViewChild('tagSwiper') tagSwiper: SwiperComponent;
  @ViewChild('highlightedItemsSwiper') highlightedItemsSwiper: SwiperComponent;

  @HostListener('window:scroll', [])
  async infinitePagination() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      if (this.paginationState.status === 'complete' && this.tagsLoaded) {
        await this.inicializeItems(false, true);
      }
    }
  }

  constructor(
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    private authService: AuthService,
    private tagsService: TagsService,
    private calendarsService: CalendarsService,
    private reservationsService: ReservationService,
    private ordersService: OrderService,
    private itemsService: ItemsService,
    private router: Router,
    private headerService: HeaderService,
    private route: ActivatedRoute,
    private ngNavigatorShareService: NgNavigatorShareService,
    private toastr: ToastrService,
    private dialog: DialogService
  ) {}

  async ngOnInit() {
    localStorage.removeItem('flowRoute');
    this.headerService.flowRoute = null;

    await this.verifyIfUserIsLogged();
    await this.inicializeTags();
    await this.inicializeItems(true);
    await this.inicializeHighlightedItems();
    await this.getOrdersTotal();
    await this.getMerchantBuyers();
    await this.inicializeSaleflowCalendar();

    this.itemSearchbar.valueChanges.subscribe((change) =>
      this.inicializeItems(true)
    );
  }

  async verifyIfUserIsLogged() {
    this.user = await this.authService.me();

    if (this.user) {
      const merchantDefault = await this.merchantsService.merchantDefault();

      if (merchantDefault) this.merchantDefault = merchantDefault;
      else {
        this.router.navigate(['others/error-screen']);
      }
    }
  }

  async inicializeTags() {
    const tagsList = await this.tagsService.tagsByUser();

    if (tagsList) {
      this.tagsList = tagsList;
      this.unselectedTags = this.tagsList;
      
      for (const tag of this.tagsList) {
        this.tagsHashTable[tag._id] = tag;
        this.tagsByNameHashTable[tag.name] = tag;
      }
    }

    this.tagsLoaded = true;
  }

  async inicializeHighlightedItems() {
    const saleflowItems = this.saleflowService.saleflowData.items.map(
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

    const { listItems: highlitedItems } = await this.saleflowService.listItems(
      pagination
    );

    if (highlitedItems) {
      this.highlightedItems = highlitedItems;

      for (const item of this.highlightedItems) {
        item.tagsFilled = [];

        if (item.tags.length > 0) {
          for (const tagId of item.tags) {
            if (this.tagsHashTable[tagId]) {
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

  async inicializeItems(
    restartPagination = false,
    triggeredFromScroll = false
  ) {
    const saleflowItems = this.saleflowService.saleflowData.items.map(
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
      this.paginationState.page = 1;
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

    const items = await this.saleflowService.listItems(pagination);
    const itemsQueryResult = items?.listItems;

    if (itemsQueryResult.length === 0 && this.paginationState.page !== 1)
      this.paginationState.page--;

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
            item.tagsFilled.push(this.tagsHashTable[tagId]);
          }
        }
      }

      this.paginationState.status = 'complete';
    }

    if (
      itemsQueryResult.length === 0 &&
      this.itemSearchbar.value !== '' &&
      !triggeredFromScroll
    ) {
      this.allItems = [];
    }
  }

  async inicializeSaleflowCalendar() {
    if (
      this.saleflowService.saleflowData &&
      'module' in this.saleflowService.saleflowData &&
      'appointment' in this.saleflowService.saleflowData.module &&
      this.saleflowService.saleflowData.module.appointment
    ) {
      this.saleflowCalendar = await this.calendarsService.getCalendar(
        this.saleflowService.saleflowData.module.appointment?.calendar?._id
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
        this.merchantsService.merchantData._id
      );

      const incomeMerchantResponse = await this.merchantsService.incomeMerchant(
        this.merchantsService.merchantData._id
      );

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
      this.saleflowBuyers = await this.merchantsService.usersOrderMerchant(
        this.merchantsService.merchantData._id
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

  goToCreateItem() {
    this.router.navigate([`admin/create-item/`]);
  }

  goToDetail(id: string) {
    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.headerService.flowRoute);
    this.router.navigate([`admin/item-display/${id}`]);
  }

  filterItemsBySearch(searchTerm: string) {
    if (searchTerm !== '' && searchTerm) {
      this.filteredHighlightedItems = this.highlightedItems.filter((item) =>
        this.filterItemsPerSearchTerm(item, searchTerm)
      );
    } else {
      this.filteredHighlightedItems = this.highlightedItems;
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

  goToCreateTag(tagId: string) {
    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);
    this.router.navigate([`/admin/create-tag/${tagId}`]);
  }

  itemMenuCallback = (id: string) => {
    const item = this.allItems.find((item) => item._id === id);
    const list: StoreShareList[] = [
      {
        title: item.name || 'Producto',
        titleStyles: {
          margin: '0px',
          marginTop: '15px',
          marginBottom: '25px',
        },
        options: [
          {
            text: 'DESTACAR',
            mode: 'func',
            func: async () => {
              try {
                const updatedItem = await this.itemsService.updateItem(
                  {
                    status: 'featured',
                  },
                  item._id
                );

                if (updatedItem) item.status = 'featured';
                this.highlightedItems.push(item);

                setTimeout(() => {
                  if (
                    this.highlightedItemsSwiper &&
                    this.highlightedItemsSwiper.directiveRef
                  )
                    this.highlightedItemsSwiper.directiveRef.update();
                }, 300);
              } catch (error) {
                console.log(error);
              }
            },
          },
          {
            text: item.status === 'disabled' ? 'MOSTRAR' : 'ESCONDER',
            mode: 'func',
            func: async () => {
              try {
                const updatedItem = await this.itemsService.updateItem(
                  {
                    status:
                      item.status === 'active' || item.status === 'featured'
                        ? 'disabled'
                        : item.status === 'disabled'
                        ? 'active'
                        : 'draft',
                  },
                  item._id
                );

                if (updatedItem) {
                  item.status =
                    item.status === 'active' || item.status === 'featured'
                      ? 'disabled'
                      : item.status === 'disabled'
                      ? 'active'
                      : 'draft';
                  if (item.status !== 'active') {
                    this.activeItems = this.activeItems.filter(
                      (listItem) => listItem._id !== item._id
                    );
                    this.highlightedItems = this.highlightedItems.filter(
                      (listItem) => listItem._id !== item._id
                    );
                    this.filteredHighlightedItems =
                      this.filteredHighlightedItems.filter(
                        (listItem) => listItem._id !== item._id
                      );
                    this.inactiveItems.push(item);

                    setTimeout(() => {
                      if (
                        this.highlightedItemsSwiper &&
                        this.highlightedItemsSwiper.directiveRef
                      )
                        this.highlightedItemsSwiper.directiveRef.update();
                    }, 300);
                  } else {
                    this.activeItems.push(item);
                    this.inactiveItems = this.inactiveItems.filter(
                      (listItem) => listItem._id !== item._id
                    );
                  }
                }
              } catch (error) {
                console.log(error);
              }
            },
          },
          {
            text: 'BORRAR (ELIMINA LA DATA)',
            mode: 'func',
            func: async () => {
              const removeItemFromSaleFlow =
                await this.saleflowService.removeItemFromSaleFlow(
                  item._id,
                  this.saleflowService.saleflowData._id
                );
              if (!removeItemFromSaleFlow) return;
              const deleteItem = await this.itemsService.deleteItem(item._id);
              if (!deleteItem) return;
              this.allItems = this.allItems.filter(
                (listItem) => listItem._id !== item._id
              );
              this.activeItems = this.activeItems.filter(
                (listItem) => listItem._id !== item._id
              );
              this.inactiveItems = this.inactiveItems.filter(
                (listItem) => listItem._id !== item._id
              );
              this.highlightedItems = this.highlightedItems.filter(
                (listItem) => listItem._id !== item._id
              );
              this.filteredHighlightedItems =
                this.filteredHighlightedItems.filter(
                  (listItem) => listItem._id !== item._id
                );

              setTimeout(() => {
                if (
                  this.highlightedItemsSwiper &&
                  this.highlightedItemsSwiper.directiveRef
                )
                  this.highlightedItemsSwiper.directiveRef.update();
              }, 300);
            },
          },
        ],
      },
    ];

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

  openItemManagementDialog = () => {
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
              this.router.navigate(['admin/create-item/']);
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
              this.router.navigate([`admin/merchant-items`], {
                queryParams: {
                  initialMode: 'hide',
                },
              });
            },
          },
          {
            text: 'BORRAR (ELIMINA LA DATA)',
            mode: 'func',
            func: () => {
              this.router.navigate([`admin/merchant-items`], {
                queryParams: {
                  initialMode: 'delete',
                },
              });
            },
          },
        ],
      },
    ];

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
          const link = `${this.URI}/ecommerce/store/${this.saleflowService.saleflowData._id}`;

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
      this.itemsService.updateItem(
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
    const itemsQueryResult = await this.itemsService.item(id);
    const item: ExtendedItem = itemsQueryResult;
    item.tagsFilled = [];

    if (item.tags.length > 0) {
      for (const tagId of item.tags) {
        if (this.tagsHashTable[tagId]) {
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
        color: '#FFFFFF',
        asyncCallback: toggleStatus,
      },
    ];

    const list: Array<SettingsDialogButton> = [
      {
        text: 'Vista del visitante',
        callback: async () => {
          this.router.navigate([
            `/ecommerce/item-detail/${this.saleflowService.saleflowData._id}/${item._id}`,
          ]);
        },
      },
      {
        text: 'Duplicar',
        callback: async () => {
          const imageFiles: Array<File> = [];

          const toDataURL = (url) =>
            fetch(url)
              .then((response) => response.blob())
              .then(
                (blob) =>
                  new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                  })
              );

          for (const imageURL of item.images) {
            const dataURL = await toDataURL(imageURL);
            if (dataURL) {
              const file = base64ToFile(dataURL as string);
              imageFiles.push(file);
            }
          }

          const itemInput: ItemInput = {
            name: item.name || null,
            description: item.description || null,
            pricing: item.pricing,
            images: imageFiles,
            merchant: item.merchant._id,
            content: [],
            currencies: [],
            hasExtraPrice: false,
            purchaseLocations: [],
            showImages: item.images.length > 0,
            status: item.status,
            tags: item.tags ? item.tags : [],
          };

          try {
            const { createItem } = await this.itemsService.createItem(
              itemInput
            );
            await this.saleflowService.addItemToSaleFlow(
              {
                item: createItem._id,
              },
              this.saleflowService.saleflowData._id
            );

            if (item.params && item.params.length > 0) {
              const { createItemParam } =
                await this.itemsService.createItemParam(
                  item.merchant._id,
                  createItem._id,
                  {
                    name: item.params[0].name,
                    formType: 'color',
                    values: [],
                  }
                );
              const paramValues = item.params[0].values.map((value) => {
                return {
                  name: value.name,
                  image: value.image,
                  price: value.price,
                  description: value.description,
                };
              });

              const result = await this.itemsService.addItemParamValue(
                paramValues,
                createItemParam._id,
                item.merchant._id,
                createItem._id
              );
            }

            const itemWithParams: ExtendedItem = await this.itemsService.item(
              createItem._id
            );

            if (itemWithParams.tags && itemWithParams.tags.length) {
              itemWithParams.tagsFilled = [];

              if (item.tags.length > 0) {
                for (const tagId of item.tags) {
                  if (this.tagsHashTable[tagId]) {
                    itemWithParams.tagsFilled.push(this.tagsHashTable[tagId]);
                  }
                }
              }
            }

            this.allItems = [itemWithParams].concat(this.allItems);
            this.toastr.info('¡Item duplicado exitosamente!');
          } catch (error) {
            console.log(error);
            this.toastr.error('Ocurrio un error al crear el item', null, {
              timeOut: 1500,
            });
          }
        },
      },
      {
        text: 'Archivar (Sin eliminar la data)',
        callback: async () => {
          try {
            const response = await this.itemsService.updateItem(
              {
                status: 'archived',
              },
              id
            );

            if (allItemIndex >= 0 && response) {
              this.allItems.splice(allItemIndex, 1);
            }

            if (highlightedItemsIndex >= 0 && response) {
              this.highlightedItems.splice(highlightedItemsIndex, 1);
            }
            if (visibleItemsIndex >= 0 && response) {
              this.activeItems.splice(visibleItemsIndex, 1);
            }
            if (invisibleItemsIndex >= 0 && response) {
              this.inactiveItems.splice(invisibleItemsIndex, 1);
            }
            this.toastr.info('¡Item archivado exitosamente!');
          } catch (error) {
            console.log(error);
            this.toastr.error('Ocurrio un error al archivar el item', null, {
              timeOut: 1500,
            });
          }
        },
      },
      {
        text: 'Eliminar',
        callback: async () => {
          try {
            const removeItemFromSaleFlow =
              await this.saleflowService.removeItemFromSaleFlow(
                item._id,
                this.saleflowService.saleflowData._id
              );
            if (!removeItemFromSaleFlow) return;
            const deleteItem = await this.itemsService.deleteItem(item._id);
            if (!deleteItem) return;
            this.allItems = this.allItems.filter(
              (listItem) => listItem._id !== item._id
            );
            this.activeItems = this.activeItems.filter(
              (listItem) => listItem._id !== item._id
            );
            this.inactiveItems = this.inactiveItems.filter(
              (listItem) => listItem._id !== item._id
            );
            this.highlightedItems = this.highlightedItems.filter(
              (listItem) => listItem._id !== item._id
            );

            setTimeout(() => {
              if (
                this.highlightedItemsSwiper &&
                this.highlightedItemsSwiper.directiveRef
              )
                this.highlightedItemsSwiper.directiveRef.update();
            }, 300);

            this.toastr.info('¡Item borrado exitosamente!');
          } catch (error) {
            console.log(error);
            this.toastr.error('Ocurrio un error al borrar el item', null, {
              timeOut: 1500,
            });
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
        title: item.name,
        cancelButton: {
          text: 'Cerrar',
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  async selectTag(tag: ExtendedTag, tagIndex: number) {
    this.menuOpened = false;
    if (this.tagsList[tagIndex].selected) {
      this.tagsList[tagIndex].selected = false;
      this.selectedTagsCounter--;

      this.selectedTags = this.selectedTags.filter(
        (selectedTag) => selectedTag._id !== tag._id
      );
    } else {
      const selectedTagObject = { ...tag };

      this.tagsList[tagIndex].selected = true;

      delete selectedTagObject.selected;

      this.selectedTags.push(selectedTagObject);
      this.selectedTagsCounter++;
    }

    if (this.selectedTagsCounter) {
      this.showSearchbar = false;
    } else {
      this.showSearchbar = true;
    }

    this.inicializeItems(true);
  }

  getSelectedTagsNames() {
    return this.selectedTags.map((tag) => tag.name);
  }

  async resetSelectedTags() {
    this.selectedTags = [];
    this.selectedTagsCounter = 0;
    this.tagsList.forEach((tag) => (tag.selected = false));
    this.showSearchbar = true;

    await this.inicializeItems(true);
  }

  makeSearchBarVisible() {
    this.showSearchbar = true;
  }
}
