import { Component, OnInit, ViewChild } from '@angular/core';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { formatID, getDaysAgo } from 'src/app/core/helpers/strings.helpers';
import { ItemOrder, OrderSubtotal } from 'src/app/core/models/order';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SwiperOptions } from 'swiper';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from 'src/app/core/services/order.service';
import { PaginationInput } from 'src/app/core/models/saleflow';

interface OrderStatusDeliveryData {
  [key: string]: {
    status: 'idle' | 'loading' | 'complete' | 'error';
    orders: ItemOrder[];
    length: number;
  };
}

@Component({
  selector: 'app-order-data',
  templateUrl: './order-data.component.html',
  styleUrls: ['./order-data.component.scss'],
})
export class OrderDataComponent implements OnInit {
  @ViewChild('swiper') swiper: SwiperComponent;
  cardSwiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 2,
  };

  orderStatusDelivery: OrderStatusDeliveryData = {
    'in progress': {
      status: 'idle',
      orders: [],
      length: 0,
    },
    delivered: {
      status: 'idle',
      orders: [],
      length: 0,
    },
    pending: {
      status: 'idle',
      orders: [],
      length: 0,
    },
    shipped: {
      status: 'idle',
      orders: [],
      length: 0,
    },
    pickup: {
      status: 'idle',
      orders: [],
      length: 0,
    },
  };
  getDaysAgo = getDaysAgo;
  articleId: string = '';
  itemPendingOrders;
  itemDeliveredOrders;
  itemInProgressOrders;
  itemShippedOrders;
  itemPickupOrders;
  isArticle: boolean = false;

  constructor(
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
    private ordersService: OrderService
  ) {}

  async ngOnInit(): Promise<void> {
    // En preparación
    this.route.queryParams.subscribe((params) => {
      this.articleId = params.articleId;
      console.log(this.articleId);
    });
    if (this.articleId !== '') {
      this.isArticle = true;
    } else {
      this.isArticle = false;
    }

    const ordersGroupedByDeliveryStatus =
      await this.merchantsService.orderByStatusDelivery(
        this.merchantsService.merchantData._id
      );

    for (const orderDeliveryStatus of Object.keys(
      ordersGroupedByDeliveryStatus
    )) {
      this.orderStatusDelivery[orderDeliveryStatus] = {
        ...this.orderStatusDelivery[orderDeliveryStatus],
        orders: ordersGroupedByDeliveryStatus[orderDeliveryStatus],
        length: ordersGroupedByDeliveryStatus[orderDeliveryStatus].length,
        status: 'complete'
      };

      this.itemInProgressOrders = ordersGroupedByDeliveryStatus[
        'in progress'
      ];
      this.itemPendingOrders = ordersGroupedByDeliveryStatus['pending']; 
      this.itemPickupOrders = ordersGroupedByDeliveryStatus['pickup'];
      this.itemShippedOrders = ordersGroupedByDeliveryStatus['shipped'];
      this.itemDeliveredOrders = ordersGroupedByDeliveryStatus[
        'delivered'
      ];
    }

    if (this.articleId !== '' && this.articleId) {
      this.itemInProgressOrders = ordersGroupedByDeliveryStatus[
        'in progress'
      ].filter((order) =>
        order.items.some((item) => (item.item as any) === this.articleId)
      );

      this.itemPendingOrders = ordersGroupedByDeliveryStatus['pending'].filter(
        (order) => order.items.some((item) => (item.item as any) === this.articleId)
      );

      this.itemPickupOrders = ordersGroupedByDeliveryStatus['pickup'].filter(
        (order) => order.items.some((item) => (item.item as any) === this.articleId)
      );
      // console.log(this.itemPickupOrders);

      this.itemShippedOrders = ordersGroupedByDeliveryStatus['shipped'].filter(
        (order) => order.items.some((item) => (item.item as any) === this.articleId)
      );
      // console.log(this.itemShippedOrders);

      this.itemDeliveredOrders = ordersGroupedByDeliveryStatus[
        'delivered'
      ].filter((order) =>
        order.items.some((item) => (item.item as any) === this.articleId)
      );
      //  console.log(this.itemDeliveredOrders);
    }
  }

  orderTotal(subtotals: OrderSubtotal[]) {
    return subtotals?.reduce((prev, curr) => prev + curr.amount, 0) || 0;
  }

  formatId(id: string) {
    return formatID(id).split(/(?=N)/g)[1];
  }
}
