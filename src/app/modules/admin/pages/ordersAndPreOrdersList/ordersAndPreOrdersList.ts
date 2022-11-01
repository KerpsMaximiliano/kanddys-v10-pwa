import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { formatID } from 'src/app/core/helpers/strings.helpers';
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
  selectedTags: Array<Tag> = [];
  tagGroups: Array<TagGroup> = [];
  tagsHashTable: Record<string, Tag> = {};
  ordersPerTagHashTable: Record<string, Array<ItemOrder>> = {};
  selectedTagGroups: Array<TagGroup> = [];
  nonRepeatingSelectedTagGroupOrders: Array<ItemOrder> = [];
  filteredNonRepeatingSelectedTagGroupOrders: Array<ItemOrder> = [];
  filteredTagGroups: Array<TagGroup> = [];
  tagGroupsToRender: 'ALL' | 'SELECTED_TAGS' = 'ALL';
  expandedTagOrders: {
    tag: Tag;
    orders: ItemOrder[];
  } = null;
  filteredExpandedTagOrders: {
    tag: Tag;
    orders: ItemOrder[];
  } = null;
  expandedOrdersWithoutTags: Array<ItemOrder> = null;
  filteredExpandedOrdersWithoutTags: Array<ItemOrder> = null;
  detailedOrdersWithoutTags: ItemOrder[] = [];
  ordersList: ItemOrder[] = [];
  ordersWithoutTags: ItemOrder[] = [];
  filteredOrdersWithoutTags: ItemOrder[] = [];
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
  facturasList: any[] = [];
  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: false,
    spaceBetween: 5,
  };
  tagsCarousell: any[] = [];
  multipleTags: boolean = true;
  phone: string = '';
  limit: number;
  sort: string;
  facturasTemp: any = [];
  merchantIncome: number = 0;
  env = environment.assetsUrl;
  ordersAmount: number = 0;

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
    this.facturasList = [];
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

      console.log('tipo', this.typeOfList);

      this.defaultMerchant = this.merchantsService.merchantData;

      await this.loadOrders();

      this.searchBar.valueChanges.subscribe((change: string) => {
        if (!this.selectedTagGroups.length) {
          this.filteredTagGroups.forEach((tagGroup) => {
            if (this.ordersPerTagHashTable[tagGroup.tag._id]) {
              tagGroup.orders = this.ordersPerTagHashTable[
                tagGroup.tag._id
              ].filter((order) => {
                const productNames = order.items.map((item) => item.item.name);
                const productNamesMatches = productNames.find((productName) => {
                  if (productName) {
                    return productName.toLowerCase().includes(change);
                  }

                  return false;
                });

                if (order.dateId) {
                  return (
                    order.dateId.toLowerCase().includes(change.toLowerCase()) ||
                    productNamesMatches
                  );
                }

                return false;
              });
            }
          });
        } else if (this.selectedTagGroups.length > 0) {
          this.filteredNonRepeatingSelectedTagGroupOrders =
            this.nonRepeatingSelectedTagGroupOrders.filter((order) => {
              const productNames = order.items.map((item) => item.item.name);
              const productNamesMatches = productNames.find((productName) => {
                if (productName) {
                  return productName.toLowerCase().includes(change);
                }

                return false;
              });

              if (order.dateId) {
                return (
                  order.dateId.toLowerCase().includes(change.toLowerCase()) ||
                  productNamesMatches
                );
              }

              return false;
            });
        }

        this.filteredOrdersWithoutTags = this.ordersWithoutTags.filter(
          (order) => {
            const productNames = order.items.map((item) => item.item.name);
            const productNamesMatches = productNames.find((productName) => {
              if (productName) {
                return productName.toLowerCase().includes(change);
              }

              return false;
            });

            if (order.dateId) {
              return (
                order.dateId.toLowerCase().includes(change.toLowerCase()) ||
                productNamesMatches
              );
            }

            return false;
          }
        );

        if (this.expandedTagOrders) {
          this.filteredExpandedTagOrders.orders =
            this.expandedTagOrders.orders.filter((order) => {
              const productNames = order.items.map((item) => item.item.name);
              const productNamesMatches = productNames.find((productName) => {
                if (productName) {
                  return productName.toLowerCase().includes(change);
                }

                return false;
              });

              if (order.dateId) {
                return (
                  order.dateId.toLowerCase().includes(change.toLowerCase()) ||
                  productNamesMatches
                );
              }

              return false;
            });
        }

        if (this.filteredOrdersWithoutTags) {
          this.filteredExpandedOrdersWithoutTags =
            this.filteredOrdersWithoutTags.filter((order) => {
              const productNames = order.items.map((item) => item.item.name);
              const productNamesMatches = productNames.find((productName) => {
                if (productName) {
                  return productName.toLowerCase().includes(change);
                }

                return false;
              });

              if (order.dateId) {
                return (
                  order.dateId.toLowerCase().includes(change.toLowerCase()) ||
                  productNamesMatches
                );
              }

              return false;
            });
        }
      });
    });
  }

  async loadOrders() {
    const ordersByMerchantPagination: PaginationInput = {
      options: {
        sortBy: `${this.ordersByMerchantSortField}:${this.ordersByMerchantSortOrder}`,
        limit: this.ordersByMerchantLimit,
      },
      findBy: {
        orderStatus:
          this.typeOfList === 'facturas'
            ? ['in progress', 'to confirm', 'completed']
            : ['draft'],
      },
    };

    const { ordersByMerchant } = await this.merchantsService.ordersByMerchant(
      this.defaultMerchant._id,
      ordersByMerchantPagination
    );

    this.ordersList = ordersByMerchant;

    this.organizeOrdersByTag();

    const ordersTotalResponse = await this.ordersService.ordersTotal(
      ['in progress', 'to confirm', 'completed'],
      this.merchantsService.merchantData._id
    );

    const incomeMerchantResponse = await this.merchantsService.incomeMerchant(
      this.merchantsService.merchantData._id
    );

    if (
      ordersTotalResponse &&
      ordersTotalResponse !== null &&
      incomeMerchantResponse &&
      incomeMerchantResponse !== null
    ) {
      this.ordersAmount = ordersTotalResponse.length;
      this.merchantIncome = incomeMerchantResponse;
    }

    if (this.ordersList.length === 0) this.loadingStatus = 'empty';
    else if (this.ordersList.length > 0) this.loadingStatus = 'complete';
  }

  organizeOrdersByTag() {
    this.ordersList.forEach((order) => {
      if (order.tags.length > 0) {
        order.tags.forEach((orderTagId) => {
          const tagGroupIndex = this.tagGroups.findIndex(
            (tagGroup) => tagGroup.tag._id === orderTagId
          );

          this.tagGroups[tagGroupIndex].orders.push(order);

          if (!this.ordersPerTagHashTable[orderTagId])
            this.ordersPerTagHashTable[orderTagId] = [order];
          else {
            this.ordersPerTagHashTable[orderTagId].push(order);
          }
        });
      } else {
        this.ordersWithoutTags.push(order);
      }
    });

    this.filteredOrdersWithoutTags = this.ordersWithoutTags;

    this.filteredTagGroups = this.tagGroups;
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
    this.selectedTagGroups = [];
    this.filteredTagGroups = [];
    this.selectedTags = [];
    this.ordersList = [];
    this.loadOrders();
  }

  returnScreen(): void {
    this.resetEdition();
  }

  handleTag(seletedTag: Tag): void {
    if (this.selectedTags.includes(seletedTag))
      this.selectedTags = this.selectedTags.filter((tag) => tag !== seletedTag);
    else {
      const value = this.multipleTags
        ? [...this.selectedTags, seletedTag]
        : [seletedTag];
      this.selectedTags = value;
    }

    const isTheClickedTagAlreadySelected = this.selectedTagGroups.find(
      (tagGroup) => tagGroup.tag._id === seletedTag._id
    );

    if (isTheClickedTagAlreadySelected)
      this.selectedTagGroups = this.selectedTagGroups.filter(
        (tagGroup) => tagGroup.tag._id !== seletedTag._id
      );
    else {
      const tagGroup = this.tagGroups.find(
        (tagGroup) => tagGroup.tag._id === seletedTag._id
      );

      if (tagGroup) {
        this.selectedTagGroups.push(tagGroup);
      }
    }

    if (this.selectedTagGroups.length > 0) {
      const alreadyFoundOrders = {};
      let ordersForEachTag: Array<ItemOrder> = [];
      this.selectedTagGroups.forEach((tagGroup) => {
        ordersForEachTag = ordersForEachTag.concat(tagGroup.orders);
      });

      const nonRepeatingOrders: Array<ItemOrder> = [];
      ordersForEachTag.forEach((order) => {
        if (!alreadyFoundOrders[order._id]) {
          alreadyFoundOrders[order._id] = true;
          nonRepeatingOrders.push(order);
        }
      });

      this.nonRepeatingSelectedTagGroupOrders = nonRepeatingOrders;
      this.filteredNonRepeatingSelectedTagGroupOrders =
        this.nonRepeatingSelectedTagGroupOrders;

      this.filteredTagGroups = this.selectedTagGroups;
    } else {
      this.filteredTagGroups = this.tagGroups;
    }
  }

  viewExpandedTagOrders(tagGroup: TagGroup) {
    this.selectedTags.push(tagGroup.tag);
    this.expandedTagOrders = tagGroup;
    this.filteredExpandedTagOrders = this.expandedTagOrders;
  }

  viewExpandedOrdersWithoutTags(ordersWithoutTags: Array<ItemOrder>) {
    this.expandedOrdersWithoutTags = ordersWithoutTags;
    this.filteredExpandedOrdersWithoutTags = ordersWithoutTags;
  }

  resetSelectedTags(): void {
    this.selectedTags = [];
    this.selectedTagGroups = [];
    this.filteredNonRepeatingSelectedTagGroupOrders = [];
    this.nonRepeatingSelectedTagGroupOrders = [];

    this.facturasTemp = this.facturasList;
    this.filteredTagGroups = this.tagGroups;

    if (this.expandedTagOrders) {
      this.expandedTagOrders = null;
    }

    if (this.expandedOrdersWithoutTags) {
      this.expandedOrdersWithoutTags = null;
    }
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
}
