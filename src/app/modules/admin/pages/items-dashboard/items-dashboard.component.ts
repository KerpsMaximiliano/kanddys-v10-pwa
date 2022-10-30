import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SwiperComponent, SwiperConfig } from 'ngx-swiper-wrapper';
import { Item } from 'src/app/core/models/item';
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
import { SettingsComponent } from 'src/app/shared/dialogs/settings/settings.component';
import { NgNavigatorShareService } from 'ng-navigator-share';

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
  allItems: Item[] = [];
  activeItems: Item[] = [];
  inactiveItems: Item[] = [];
  itemsWithoutTags: Item[] = [];
  filteredItemsWithoutTags: Item[] = [];
  highlightedItems: Item[] = [];
  filteredHighlightedItems: Item[] = [];
  activeMenuOptionIndex: number = 0;
  tagsList: Array<Tag> = [];
  filteredTagsList: Array<Tag> = [];
  itemsPerTag: Array<{
    tag: Tag;
    items: Array<Item>;
  }> = [];
  filteredItemsPerTag: Array<{
    tag: Tag;
    items: Array<Item>;
  }> = [];
  user: User;
  merchantDefault: Merchant;
  menuNavigationSwiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 16,
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
  };
  saleflowCalendar: ExtendedCalendar;
  env: string = environment.assetsUrl;
  hasCustomizer: boolean;
  itemSearchbar: FormControl = new FormControl('');

  @ViewChild('tagSwiper') tagSwiper: SwiperComponent;

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
    private dialog: DialogService
  ) {}

  async ngOnInit() {
    await this.verifyIfUserIsLogged();
    await this.inicializeTags();
    await this.inicializeItems();
    await this.getOrdersTotal();
    await this.getMerchantBuyers();
    await this.inicializeSaleflowCalendar();

    this.itemSearchbar.valueChanges.subscribe((change) =>
      this.filterItemsBySearch(change)
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
    this.tagsList = await this.tagsService.tagsByUser();
    this.filteredTagsList = this.tagsList;
  }

  async inicializeItems() {
    const saleflowItems = this.saleflowService.saleflowData.items.map(
      (saleflowItem) => ({
        itemId: saleflowItem.item._id,
        customizer: saleflowItem.customizer?._id,
        index: saleflowItem.index,
      })
    );
    if (saleflowItems.some((item) => item.customizer))
      this.hasCustomizer = true;
    const { listItems: items } = await this.saleflowService.listItems({
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.itemId)),
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: 60,
      },
    });

    this.allItems = items;

    this.activeItems = this.allItems.filter(
      (item) => item.status === 'active' || item.status === 'featured'
    );
    this.inactiveItems = this.allItems.filter(
      (item) => item.status === 'disabled'
    );

    const tagsAndItemsHashtable: Record<string, Array<Item>> = {};

    //*************************FILLS EACH TAG SECTION WITH ITEMS THAT ARE BINDED TO THAT TAG***************//
    for (const item of this.allItems) {
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

    for (const tag of this.tagsList) {
      if (
        tagsAndItemsHashtable[tag._id] &&
        tagsAndItemsHashtable[tag._id].length > 0
      ) {
        this.itemsPerTag.push({
          tag,
          items: tagsAndItemsHashtable[tag._id],
        });
        this.filteredItemsPerTag = this.itemsPerTag;
      }
    }
    //*************************                        END                   *****************************//

    //sets the highlighted items
    for (const item of items) {
      if (item.status === 'featured') {
        this.highlightedItems.push(item);
      }
    }
    this.filteredHighlightedItems = this.highlightedItems;
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
      }, 3000);
    }

    if (!this.menuOpened) {
      setTimeout(() => {
        this.executingMenuClosingAnimation = false;
      }, 3000);
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

    console.log(this.activeMenuOptionIndex);
    console.log(this.menuNavigationOptions);
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
      this.filteredTagsList = this.tagsList.filter((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      this.filteredHighlightedItems = this.highlightedItems.filter((item) =>
        this.filterItemsPerSearchTerm(item, searchTerm)
      );

      this.filteredItemsPerTag = JSON.parse(JSON.stringify(this.itemsPerTag));

      this.filteredItemsPerTag.forEach((group) => {
        group.items = group.items.filter((item) =>
          this.filterItemsPerSearchTerm(item, searchTerm)
        );
      });

      this.filteredItemsWithoutTags = this.itemsWithoutTags.filter((item) =>
        this.filterItemsPerSearchTerm(item, searchTerm)
      );
    } else {
      this.filteredTagsList = this.tagsList;
      this.filteredHighlightedItems = this.highlightedItems;
      this.filteredItemsPerTag = this.itemsPerTag;
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
              this.itemsWithoutTags = this.itemsWithoutTags.filter(
                (listItem) => listItem._id !== item._id
              );
              this.highlightedItems = this.highlightedItems.filter(
                (listItem) => listItem._id !== item._id
              );
              this.filteredHighlightedItems =
                this.filteredHighlightedItems.filter(
                  (listItem) => listItem._id !== item._id
                );
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
    const list = [
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
        title: 'Sobre las facturas',
        cancelButton: {
          text: 'Cerrar',
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }
}
