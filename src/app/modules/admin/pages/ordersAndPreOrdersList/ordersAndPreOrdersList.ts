import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { formatID, unformatID } from 'src/app/core/helpers/strings.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { CalendarService } from 'src/app/core/services/calendar.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ReservationService } from 'src/app/core/services/reservations.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { SwiperOptions } from 'swiper';
import * as moment from 'moment';
import { Tag } from 'src/app/core/models/tags';
import { ItemOrder, OrderSubtotal } from 'src/app/core/models/order';
import { environment } from '../../../../../environments/environment';
import { OrderService } from 'src/app/core/services/order.service';

interface TagGroup {
  tag: Tag;
  orders: ItemOrder[];
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
  showSearchbar: boolean;
  selectedTags: Array<Tag> = [];
  selectedTagsPermanent: Array<Tag> = [];
  unselectedTags: Array<Tag> = [];
  tagGroups: Array<TagGroup> = [];
  highlightedOrders: Array<ItemOrder> = [];
  tagsHashTable: Record<string, Tag> = {};
  ordersList: ItemOrder[] = [];
  ordersWithoutTags: ItemOrder[] = [];
  defaultMerchant: Merchant;
  ordersByMerchantLimit: number = 6000;
  ordersByMerchantSortOrder: 'asc' | 'desc' = 'desc';
  ordersByMerchantSortField: string = 'createdAt';
  optionIndexArray: any[] = [];
  editable: boolean = false;
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
      this.ordersByMerchantLimit = limit;
      this.ordersByMerchantSortField = at;
      this.ordersByMerchantSortOrder = sort;

      this.loadingStatus = 'loading';
      let tags: Array<Tag> = (await this.tagsService.tagsByUser()) || [];
      this.tags = tags;

      //Fills an object or hash table for fast access to each tag by its id
      this.tags.forEach((tag) => {
        this.tagGroups.push({
          tag,
          orders: [],
        });

        this.tagsHashTable[tag._id] = tag;
      });

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

    return {
      tag: tag,
      orders: ordersByMerchant,
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

    if (ordersByMerchant) {
      this.ordersWithoutTags = ordersByMerchant;
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
    return tagsIds.map((tagId) => this.tagsHashTable[tagId].name).join(', ');
  }

  handleInputValue(value, _Router, option): void {}

  navigate(): void {
    if (this.editable) {
      this.resetEdition();
    } else this.router.navigate([`/admin/items-dashboard`]);
  }

  resetEdition(): void {
    this.editable = false;
    this.dots = { active: !this.editable };
    this.optionIndexArray = [];
    this.text2 = '';
  }

  handleOption(option: string): void {
    this.typeOfList = option;
    this.tagGroups = this.tagGroups.map((tagGroup) => ({
      tag: tagGroup.tag,
      orders: [],
    }));
    this.ordersWithoutTags = [];
    // this.tagGroups = [];
    this.selectedTags = [];
    this.ordersList = [];
    this.loadOrders();
  }

  returnScreen(): void {
    this.resetEdition();
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
        (unselectedTag) => unselectedTag._id === selectedTag._id
      );

      if (unselectedTagIndexToDelete > 0) {
        this.unselectedTags.splice(unselectedTagIndexToDelete, 1);
      }
    }

    if (this.selectedTags.length === 1) {
      this.showSearchbar = false;
    }

    this.loadOrdersAssociatedToTag(true);
  }

  async selectTagFromHeader(eventData: { selected: boolean; tag: Tag }) {
    const tagIndex = this.tags.findIndex((tag) => {
      return tag._id === eventData.tag._id;
    });

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
    this.tags = [...this.tags];

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
}
