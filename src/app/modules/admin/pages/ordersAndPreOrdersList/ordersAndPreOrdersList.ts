import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { formatID, unformatID } from 'src/app/core/helpers/strings.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';
import { SwiperOptions } from 'swiper';
import * as moment from 'moment';
import { Tag } from 'src/app/core/models/tags';
import {
  ItemOrder,
  OrderStatusType2,
  OrderSubtotal,
} from 'src/app/core/models/order';
import { environment } from '../../../../../environments/environment';
import { OrderService } from 'src/app/core/services/order.service';
import {
  SettingsComponent,
  Button as SettingsDialogButton,
} from 'src/app/shared/dialogs/settings/settings.component';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import SwiperCore, { Virtual } from 'swiper/core';

SwiperCore.use([Virtual]);

interface TagGroup {
  tag: Tag;
  orders: ItemOrder[];
  income?: number;
}

@Component({
  selector: 'app-ordersAndPreOrdersList',
  templateUrl: './ordersAndPreOrdersList.component.html',
  styleUrls: ['./ordersAndPreOrdersList.component.scss'],
})
export class OrdersAndPreOrdersList implements OnInit {
  loadingStatus = 'loading';
  searchBar: FormControl = new FormControl();
  headerText: any = {
    text: 'Facturas y Pre-facturas',
    fontSize: '21px',
    fontFamily: 'SfProBold',
  };
  dots = {
    active: false,
  };
  typeOfList: string;
  tags: Array<Tag> = [];
  showSearchbar: boolean = true;
  selectedTags: Array<Tag> = [];
  selectedTagsPermanent: Array<Tag> = [];
  unselectedTags: Array<Tag> = [];
  tagGroups: Array<TagGroup> = [];
  highlightedOrders: Array<ItemOrder> = [];
  highlightedOrdersIncome: number = 0;
  tagsHashTable: Record<string, Tag> = {};
  ordersList: ItemOrder[] = [];
  ordersWithoutTags: ItemOrder[] = [];
  ordersWithoutTagsIncome: number = 0;
  defaultMerchant: Merchant;
  ordersByMerchantLimit: number = 6000;
  ordersByMerchantSortOrder: 'asc' | 'desc' = 'desc';
  ordersByMerchantSortField: string = 'createdAt';
  ordersIncomeForMatchingOrders: number = null;
  matchingOrdersTotalCounter: number = 0;
  optionIndexArray: any[] = [];
  list: StoreShareList[];
  text2: string = '';
  buttons: string[] = ['facturas', 'pre - facturas'];
  calendar: string = '';
  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: false,
    spaceBetween: 0,
  };
  tagsCarousell: any[] = [];
  multipleTags: boolean = true;
  phone: string = '';
  limit: number;
  sort: string;
  merchantIncome: number = 0;
  env = environment.assetsUrl;
  ordersAmount: number = 0;
  justShowHighlightedOrders: boolean;
  justShowUntaggedOrders: boolean;
  paginationState: {
    pageSize: number;
    page: number;
    status: 'loading' | 'complete';
  } = {
    page: 1,
    pageSize: 5,
    status: 'complete',
  };

  @ViewChild('highlightedOrdersSwiper')
  highlightedOrdersSwiper: SwiperComponent;

  @HostListener('window:scroll', [])
  async infinitePagination() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      if (
        this.paginationState.status === 'complete' &&
        this.selectedTags.length > 0 &&
        !this.justShowHighlightedOrders
      ) {
        this.loadOrdersAssociatedToTag(false, true);
      }

      if (
        this.paginationState.status === 'complete' &&
        this.selectedTags.length > 0 &&
        this.justShowHighlightedOrders
      ) {
        this.loadHighlightedOrders(false, true);
      }
    }
  }

  constructor(
    private merchantsService: MerchantsService,
    private router: Router,
    private dialogService: DialogService,
    private tagsService: TagsService,
    private route: ActivatedRoute,
    private headerService: HeaderService,
    private ordersService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadingStatus = 'loading';
    this.route.queryParams.subscribe(async (params) => {
      let {
        at = 'createdAt',
        type = 'facturas',
        limit = 50,
        sort = 'desc',
      } = params;
      this.typeOfList = type;
      this.ordersByMerchantLimit = limit;
      this.ordersByMerchantSortField = at;
      this.ordersByMerchantSortOrder = sort;

      this.loadingStatus = 'loading';
      let tags: Array<Tag> = (await this.tagsService.tagsByUser()) || [];
      this.tags = tags;
      this.unselectedTags = [...this.tags];

      await this.getOrdersWithoutTagsIncome();

      await this.getHighlightedOrdersIncome();

      //Fills an object or hash table for fast access to each tag by its id

      await this.organizeTagsGroups();

      this.typeOfList = type.replace('%20');

      this.defaultMerchant = this.merchantsService.merchantData;

      await this.loadOrders();

      this.searchBar.valueChanges.subscribe((change: string) => {
        this.loadOrdersAssociatedToTag(true);
      });
    });
  }

  async loadOrders() {
    const ordersByMerchantPerTagPromises = [];

    for (const tagGroup of this.tagGroups) {
      ordersByMerchantPerTagPromises.push(
        this.loadFirstsOrdersForTagGroup(tagGroup.tag)
      );
    }

    const highlightedOrders = await this.loadFirstsHighlightedOrders();

    if (highlightedOrders) {
      this.highlightedOrders = highlightedOrders;
    }

    this.tagGroups = [];
    for await (const orderByMerchantResponse of ordersByMerchantPerTagPromises) {
      if ('orders' in orderByMerchantResponse)
        this.tagGroups.push(orderByMerchantResponse);
    }

    await this.loadOrdersWithoutTags();

    this.loadingStatus = 'complete';
  }

  loadFirstsOrdersForTagGroup = async (tag: Tag): Promise<any> => {
    const ordersByMerchantPagination: PaginationInput = {
      options: {
        sortBy: `${this.ordersByMerchantSortField}:${this.ordersByMerchantSortOrder}`,
        limit: 10,
      },
      findBy: {
        orderStatus:
          this.typeOfList === 'facturas'
            ? ['in progress', 'to confirm', 'completed']
            : 'draft',
        tags: [tag._id],
      },
    };

    const { ordersByMerchant } = await this.merchantsService.ordersByMerchant(
      this.defaultMerchant._id,
      ordersByMerchantPagination
    );

    const income = await this.merchantsService.incomeMerchant({
      findBy: {
        merchant: this.merchantsService.merchantData._id,
        orderStatus:
          this.typeOfList === 'facturas'
            ? ['in progress', 'to confirm', 'completed']
            : 'draft',
        tags: [tag._id],
      },
    });

    return {
      tag: tag,
      orders: ordersByMerchant,
      income,
    };
  };

  loadFirstsHighlightedOrders = async (): Promise<Array<ItemOrder>> => {
    const ordersByMerchantPagination: PaginationInput = {
      options: {
        sortBy: `${this.ordersByMerchantSortField}:${this.ordersByMerchantSortOrder}`,
        limit: 10,
      },
      findBy: {
        orderStatus:
          this.typeOfList === 'facturas'
            ? ['in progress', 'to confirm', 'completed']
            : 'draft',
        'status.status': 'featured',
        'status.access': this.merchantsService.merchantData.owner._id,
      },
    };

    const { ordersByMerchant } = await this.merchantsService.ordersByMerchant(
      this.defaultMerchant._id,
      ordersByMerchantPagination
    );

    return ordersByMerchant;
  };

  async organizeTagsGroups() {
    this.tagGroups = [];
    for await (const tag of this.tags) {
      this.tagGroups.push({
        tag,
        orders: [],
      });

      const income = await this.merchantsService.incomeMerchant({
        findBy: {
          merchant: this.merchantsService.merchantData._id,
          orderStatus:
            this.typeOfList === 'facturas'
              ? ['in progress', 'to confirm', 'completed']
              : 'draft',
          tags: [tag._id],
        },
      });

      this.tagGroups[this.tagGroups.length - 1].income = income;

      this.tagsHashTable[tag._id] = tag;
    }
  }

  async loadOrdersWithoutTags() {
    const ordersByMerchantPagination: PaginationInput = {
      options: {
        sortBy: `${this.ordersByMerchantSortField}:${this.ordersByMerchantSortOrder}`,
        limit: 10,
      },
      findBy: {
        orderStatus:
          this.typeOfList === 'facturas'
            ? ['in progress', 'to confirm', 'completed']
            : 'draft',
        tags: {
          $size: 0,
        },
      },
    };

    const { ordersByMerchant } = await this.merchantsService.ordersByMerchant(
      this.defaultMerchant._id,
      ordersByMerchantPagination
    );

    if (ordersByMerchant) {
      this.ordersWithoutTags = ordersByMerchant;
    }
  }

  async loadOrdersAssociatedToTag(
    restartPagination = false,
    triggeredFromScroll = false
  ) {
    this.paginationState.status = 'loading';

    if (restartPagination) {
      this.paginationState.page = 1;
    } else {
      this.paginationState.page++;
    }

    const ordersByMerchantPagination: PaginationInput = {
      options: {
        sortBy: `${this.ordersByMerchantSortField}:${this.ordersByMerchantSortOrder}`,
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
      findBy: {
        orderStatus:
          this.typeOfList === 'facturas'
            ? ['in progress', 'to confirm', 'completed']
            : 'draft',
      },
    };

    if (this.selectedTags.length && !this.justShowUntaggedOrders) {
      ordersByMerchantPagination.findBy.tags = this.selectedTags.map(
        (tag) => tag._id
      );
    }

    if (this.justShowUntaggedOrders) {
      ordersByMerchantPagination.findBy.tags = {
        $size: 0,
      };
    }

    const selectedTagIds = this.selectedTags.map((tag) => tag._id);

    if (this.searchBar.value && this.searchBar.value !== '') {
      ordersByMerchantPagination.findBy = {
        ...ordersByMerchantPagination.findBy,
        $or: [
          {
            name: {
              __regex: {
                pattern: (this.searchBar.value as string).trim(),
                options: 'gi',
              },
            },
          },
          {
            'params.values.name': {
              __regex: {
                pattern: (this.searchBar.value as string).trim(),
                options: 'gi',
              },
            },
          },
          {
            email: {
              __regex: {
                pattern: (this.searchBar.value as string).trim(),
                options: 'gi',
              },
            },
          },
          {
            phone: {
              __regex: {
                pattern: (this.searchBar.value as string).trim(),
                options: 'gi',
              },
            },
          },
        ],
      };
    }

    //Happens when the searchbar value matches a tag name
    if (this.selectedTags.length === 0 && selectedTagIds.length > 0) {
      ordersByMerchantPagination.findBy['$or'][2] = {
        tags: {
          $in: selectedTagIds,
        },
      };
    }

    const orderRefereceRegex =
      /#?([0-9]{4})([0-9]{1,2})([0-9]{1,2})(N[0-9]{1,})/;

    if (orderRefereceRegex.test(this.searchBar.value)) {
      const [wholeDateId, year, month, day, number] = (
        this.searchBar.value as string
      ).match(orderRefereceRegex);

      ordersByMerchantPagination.findBy['$or'].push({
        dateId: unformatID(month, day, year, number),
      });
    }

    const { ordersByMerchant } = await this.merchantsService.ordersByMerchant(
      this.defaultMerchant._id,
      ordersByMerchantPagination
    );

    if (this.selectedTagsPermanent.length > 0 || this.searchBar.value !== '') {
      const paginationOptions = {
        ...ordersByMerchantPagination.options,
        limit: -1,
      };
      delete paginationOptions.page;

      const ordersIncomeForMatchingOrders =
        await this.merchantsService.incomeMerchant({
          ...ordersByMerchantPagination,
          options: paginationOptions,
          findBy: {
            ...ordersByMerchantPagination.findBy,
            merchant: this.merchantsService.merchantData._id,
            tags: selectedTagIds,
          },
        });

      if (typeof ordersIncomeForMatchingOrders === 'number')
        this.ordersIncomeForMatchingOrders = ordersIncomeForMatchingOrders;
    }

    if (
      this.selectedTagsPermanent.length > 0 ||
      (this.searchBar.value !== '' && this.searchBar.value !== null)
    ) {
      ordersByMerchantPagination.options.limit = -1;
      const { ordersByMerchant } =
        await this.merchantsService.hotOrdersByMerchant(
          this.defaultMerchant._id,
          ordersByMerchantPagination
        );

      if (ordersByMerchant)
        this.matchingOrdersTotalCounter = ordersByMerchant.length;
      else this.matchingOrdersTotalCounter = null;
    } else {
      this.matchingOrdersTotalCounter = null;
    }

    if (ordersByMerchant.length === 0 && this.paginationState.page !== 1)
      this.paginationState.page--;

    if (ordersByMerchant && ordersByMerchant.length > 0) {
      if (this.paginationState.page === 1) {
        this.ordersList = ordersByMerchant;
      } else {
        this.ordersList = this.ordersList.concat(ordersByMerchant);
      }
    }

    if (
      ordersByMerchant.length === 0 &&
      this.searchBar.value !== '' &&
      !triggeredFromScroll
    ) {
      this.ordersList = [];
    }

    this.paginationState.status = 'complete';
  }

  async loadHighlightedOrders(
    restartPagination = false,
    triggeredFromScroll = false
  ) {
    this.paginationState.status = 'loading';

    if (restartPagination) {
      this.paginationState.page = 1;
    } else {
      this.paginationState.page++;
    }

    const ordersByMerchantPagination: PaginationInput = {
      options: {
        sortBy: `${this.ordersByMerchantSortField}:${this.ordersByMerchantSortOrder}`,
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
      findBy: {
        orderStatus:
          this.typeOfList === 'facturas'
            ? ['in progress', 'to confirm', 'completed']
            : 'draft',
        'status.status': 'featured',
        'status.access': this.merchantsService.merchantData.owner._id,
      },
    };

    if (this.selectedTags.length > 0) {
      ordersByMerchantPagination.findBy.tags = this.selectedTags.map(
        (tag) => tag._id
      );
    }

    const { ordersByMerchant } = await this.merchantsService.ordersByMerchant(
      this.defaultMerchant._id,
      ordersByMerchantPagination
    );

    if (ordersByMerchant) {
      this.ordersList = ordersByMerchant;
    }

    if (ordersByMerchant.length === 0 && this.paginationState.page !== 1)
      this.paginationState.page--;

    if (ordersByMerchant && ordersByMerchant.length > 0) {
      if (this.paginationState.page === 1) {
        this.ordersList = ordersByMerchant;
      } else {
        this.ordersList = this.ordersList.concat(ordersByMerchant);
      }

      const tagsAndOrdersHashtable: Record<string, Array<ItemOrder>> = {};
    }

    if (
      ordersByMerchant.length === 0 &&
      this.searchBar.value !== '' &&
      !triggeredFromScroll
    ) {
      this.ordersList = [];
    }

    this.paginationState.status = 'complete';
  }

  getIdsOfSelectedTags() {
    return this.selectedTags.map((tag) => tag._id);
  }

  getTotalAmountOfMoneySpentInOrder(subtotals: Array<OrderSubtotal>): number {
    return subtotals
      .map(({ amount }) => amount)
      .reduce((accumulator, orderAmount) => accumulator + orderAmount);
  }

  getTotalAmountOfMoneySpentOnEachTagGroup(orders: Array<ItemOrder>): number {
    let total = 0;

    orders.forEach((order) => {
      total += this.getTotalAmountOfMoneySpentInOrder(order.subtotals);
    });

    return total;
  }

  getOrderTagList(tagsIds: Array<string>) {
    return tagsIds
      .filter(
        (tagId) =>
          this.tagsHashTable[tagId] && 'name' in this.tagsHashTable[tagId]
      )
      .map((tagId) => this.tagsHashTable[tagId].name)
      .join(', ');
  }

  handleInputValue(value, _Router, option): void {}

  navigate(): void {
    this.router.navigate([`/admin/items-dashboard`]);
  }

  async handleOption(option: string) {
    this.unselectedTags = [...this.tags];
    this.showSearchbar = true;
    this.selectedTags = [];
    this.selectedTagsPermanent = [];
    this.highlightedOrders = [];
    this.highlightedOrdersIncome = 0;
    this.tagsHashTable = {};
    this.ordersList = [];
    this.ordersWithoutTags = [];
    this.typeOfList = option;
    this.tagGroups = this.tagGroups.map((tagGroup) => ({
      orders: [],
      tag: tagGroup.tag,
      income: 0,
    }));
    this.ordersWithoutTags = [];
    this.selectedTags = [];
    this.ordersList = [];
    this.matchingOrdersTotalCounter = null;
    this.ordersIncomeForMatchingOrders = null;
    this.searchBar.setValue('');
    await this.organizeTagsGroups();
    await this.getHighlightedOrdersIncome();
    await this.getOrdersWithoutTagsIncome();
    await this.loadOrders();
  }

  handleTag(selectedTag: Tag): void {
    if (this.selectedTags.includes(selectedTag)) {
      this.selectedTags = this.selectedTags.filter(
        (tag) => tag !== selectedTag
      );

      if (this.selectedTags.length === 0) {
        this.unselectedTags = [...this.tags];
        this.selectedTagsPermanent = [];
        this.showSearchbar = true;
      }
    } else {
      const value = this.multipleTags
        ? [...this.selectedTags, selectedTag]
        : [selectedTag];
      this.selectedTags = value;

      if (
        !this.selectedTagsPermanent.find((tag) => tag._id === selectedTag._id)
      ) {
        this.selectedTagsPermanent.push(selectedTag);
      }

      const unselectedTagIndexToDelete = this.unselectedTags.findIndex(
        (unselectedTag) => {
          return unselectedTag._id === selectedTag._id;
        }
      );

      if (unselectedTagIndexToDelete >= 0) {
        this.unselectedTags.splice(unselectedTagIndexToDelete, 1);
      }
    }

    if (this.selectedTags.length === 1) {
      this.showSearchbar = false;
    }

    this.loadOrdersAssociatedToTag(true);
  }

  async selectTagFromHeader(eventData: { selected: boolean; tag: Tag }) {
    this.handleTag(eventData.tag);
  }

  showHighlightedOrders() {
    this.justShowHighlightedOrders = true;

    this.loadHighlightedOrders(true);
  }

  showOrdersUntagged() {
    this.justShowUntaggedOrders = true;

    this.loadOrdersAssociatedToTag(true);
  }

  resetSelectedTags(): void {
    this.selectedTags = [];
    this.selectedTagsPermanent = [];
    this.unselectedTags = [...this.tags];
    this.showSearchbar = true;
    this.justShowHighlightedOrders = false;
    this.justShowUntaggedOrders = false;
    this.ordersIncomeForMatchingOrders = null;
    this.matchingOrdersTotalCounter = 0;

    this.loadOrdersAssociatedToTag(true);
  }

  goToOrderInfo(orderId: string) {
    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);
    this.router.navigate([`ecommerce/order-info/${orderId}`]);
  }

  getCreationDateDifferenceAsItsSaid(dateISOString) {
    const dateObj = new Date(dateISOString);
    const year = dateObj.getFullYear();
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const hour = dateObj.getHours();

    moment.locale('es');
    return moment([year, month, day, hour]).fromNow();
  }

  formatDateID(dateid: string) {
    return formatID(dateid);
  }

  async highlightOrder(
    order: ItemOrder,
    ordersArray: Array<ItemOrder>,
    orderIndex: number
  ) {
    const list = [];

    order.status.forEach((userObject, statusIndex) => {
      if (
        userObject.access === this.merchantsService.merchantData.owner._id &&
        userObject.status !== 'featured'
      ) {
        list.push({
          text: 'Destacar orden',
          callback: async () => {
            const response = await this.ordersService.orderSetStatus(
              'featured',
              order._id
            );

            if (response) {
              ordersArray[orderIndex].status.forEach((userObject) => {
                if (
                  userObject.access ===
                  this.merchantsService.merchantData.owner._id
                ) {
                  userObject.status = 'featured';
                }
              });

              await this.getHighlightedOrdersIncome();
              this.highlightedOrders.push(order);
            }

            setTimeout(() => {
              this.highlightedOrdersSwiper.directiveRef.update();
            }, 300);
          },
        });
      }

      if (
        userObject.access === this.merchantsService.merchantData.owner._id &&
        userObject.status === 'featured'
      ) {
        list.push({
          text: 'Dejar de destacar orden',
          callback: async () => {
            const response = await this.ordersService.orderSetStatus(
              'active',
              order._id
            );

            if (response) {
              ordersArray[orderIndex].status.forEach((userObject) => {
                if (
                  userObject.access ===
                  this.merchantsService.merchantData.owner._id
                ) {
                  userObject.status = 'active';
                }
              });

              const indexToDelete = this.highlightedOrders.findIndex(
                (highlightedOrder) => highlightedOrder._id === order._id
              );

              await this.getHighlightedOrdersIncome();
              this.highlightedOrders.splice(indexToDelete, 1);
            }

            setTimeout(() => {
              this.highlightedOrdersSwiper.directiveRef.update();
            }, 300);
          },
        });
      }
    });

    this.dialogService.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        title: 'Orden ' + formatID(order.dateId),
        optionsList: list,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  async getHighlightedOrdersIncome() {
    const highlightedOrdersIncomeWithoutTags =
      await this.merchantsService.incomeMerchant({
        findBy: {
          merchant: this.merchantsService.merchantData._id,
          orderStatus:
            this.typeOfList === 'facturas'
              ? ['in progress', 'to confirm', 'completed']
              : 'draft',
          status: [{ status: 'featured' }],
        },
      });

    if (typeof highlightedOrdersIncomeWithoutTags === 'number')
      this.highlightedOrdersIncome = highlightedOrdersIncomeWithoutTags;
  }

  async getOrdersWithoutTagsIncome() {
    const ordersIncomeWithoutTags = await this.merchantsService.incomeMerchant({
      findBy: {
        merchant: this.merchantsService.merchantData._id,
        orderStatus:
          this.typeOfList === 'facturas'
            ? ['in progress', 'to confirm', 'completed']
            : 'draft',
        tags: [],
      },
    });

    if (typeof ordersIncomeWithoutTags === 'number')
      this.ordersWithoutTagsIncome = ordersIncomeWithoutTags;
  }

  changeOrderStatus(status: OrderStatusType2, order: ItemOrder) {
    order.status.forEach((userObject) => {
      if (userObject.access === this.merchantsService.merchantData.owner._id) {
        userObject.status = status;
      }
    });
  }
}
