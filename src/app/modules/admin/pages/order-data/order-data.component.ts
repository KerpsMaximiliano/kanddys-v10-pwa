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
    inProgress: {
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
    console.log(this.isArticle);

    this.orderStatusDelivery.inProgress = {
      ...this.orderStatusDelivery.inProgress,
      status: 'loading',
    };
    this.merchantsService
      .hotOrdersByMerchant(this.merchantsService.merchantData._id, {
        options: {
          limit: -1,
        },
        findBy: {
          orderStatusDelivery: 'in progress',
          orderStatus: [
            'started',
            'verifying',
            'in progress',
            'to confirm',
            'completed',
          ],
        },
      })
      .then(({ ordersByMerchant }) => {
        this.orderStatusDelivery.inProgress = {
          ...this.orderStatusDelivery.inProgress,
          orders: ordersByMerchant,
          length: ordersByMerchant.length,
        };
      });
    this.merchantsService
      .ordersByMerchant(this.merchantsService.merchantData._id, {
        options: {
          limit: 10,
          sortBy: 'createdAt:desc',
        },
        findBy: {
          orderStatusDelivery: 'in progress',
          orderStatus: [
            'started',
            'verifying',
            'in progress',
            'to confirm',
            'completed',
          ],
        },
      })
      .then(({ ordersByMerchant }) => {
        this.orderStatusDelivery.inProgress = {
          ...this.orderStatusDelivery.inProgress,
          status: 'complete',
          orders: ordersByMerchant,
        };
      });
    // En preparación
    // Listas para enviarse
    this.orderStatusDelivery.pending = {
      ...this.orderStatusDelivery.pending,
      status: 'loading',
    };
    this.merchantsService
      .hotOrdersByMerchant(this.merchantsService.merchantData._id, {
        options: {
          limit: -1,
        },
        findBy: {
          orderStatusDelivery: 'pending',
          orderStatus: [
            'started',
            'verifying',
            'in progress',
            'to confirm',
            'completed',
          ],
        },
      })
      .then(({ ordersByMerchant }) => {
        this.orderStatusDelivery.pending = {
          ...this.orderStatusDelivery.pending,
          length: ordersByMerchant.length,
          orders: ordersByMerchant,
        };
      });
    this.merchantsService
      .ordersByMerchant(this.merchantsService.merchantData._id, {
        options: {
          limit: 10,
          sortBy: 'createdAt:desc',
        },
        findBy: {
          orderStatusDelivery: 'pending',
          orderStatus: [
            'started',
            'verifying',
            'in progress',
            'to confirm',
            'completed',
          ],
        },
      })
      .then(({ ordersByMerchant }) => {
        this.orderStatusDelivery.pending = {
          ...this.orderStatusDelivery.pending,
          status: 'complete',
          orders: ordersByMerchant,
        };
      });
    // Listas para enviarse
    // Listas para Pick Up
    this.orderStatusDelivery.pickup = {
      ...this.orderStatusDelivery.pickup,
      status: 'loading',
    };
    this.merchantsService
      .hotOrdersByMerchant(this.merchantsService.merchantData._id, {
        options: {
          limit: -1,
        },
        findBy: {
          orderStatusDelivery: 'pickup',
          orderStatus: [
            'started',
            'verifying',
            'in progress',
            'to confirm',
            'completed',
          ],
        },
      })
      .then(({ ordersByMerchant }) => {
        this.orderStatusDelivery.pickup = {
          ...this.orderStatusDelivery.pickup,
          length: ordersByMerchant.length,
          orders: ordersByMerchant,
        };
      });
    this.merchantsService
      .ordersByMerchant(this.merchantsService.merchantData._id, {
        options: {
          limit: 10,
          sortBy: 'createdAt:desc',
        },
        findBy: {
          orderStatusDelivery: 'pickup',
          orderStatus: [
            'started',
            'verifying',
            'in progress',
            'to confirm',
            'completed',
          ],
        },
      })
      .then(({ ordersByMerchant }) => {
        this.orderStatusDelivery.pickup = {
          ...this.orderStatusDelivery.pickup,
          status: 'complete',
          orders: ordersByMerchant,
        };
      });
    // Listas para Pick Up
    // De camino a ser entregadas
    this.orderStatusDelivery.shipped = {
      ...this.orderStatusDelivery.shipped,
      status: 'loading',
    };
    this.merchantsService
      .hotOrdersByMerchant(this.merchantsService.merchantData._id, {
        options: {
          limit: -1,
        },
        findBy: {
          orderStatusDelivery: 'shipped',
          orderStatus: [
            'started',
            'verifying',
            'in progress',
            'to confirm',
            'completed',
          ],
        },
      })
      .then(({ ordersByMerchant }) => {
        this.orderStatusDelivery.shipped = {
          ...this.orderStatusDelivery.shipped,
          length: ordersByMerchant.length,
          orders: ordersByMerchant,
        };
      });
    this.merchantsService
      .ordersByMerchant(this.merchantsService.merchantData._id, {
        options: {
          limit: 10,
          sortBy: 'createdAt:desc',
        },
        findBy: {
          orderStatusDelivery: 'shipped',
          orderStatus: [
            'started',
            'verifying',
            'in progress',
            'to confirm',
            'completed',
          ],
        },
      })
      .then(({ ordersByMerchant }) => {
        this.orderStatusDelivery.shipped = {
          ...this.orderStatusDelivery.shipped,
          status: 'complete',
          orders: ordersByMerchant,
        };
      });
    // De camino a ser entregadas
    // Entregadas
    this.orderStatusDelivery.delivered = {
      ...this.orderStatusDelivery.delivered,
      status: 'loading',
    };
    this.merchantsService
      .hotOrdersByMerchant(this.merchantsService.merchantData._id, {
        options: {
          limit: -1,
        },
        findBy: {
          orderStatusDelivery: 'delivered',
          orderStatus: [
            'started',
            'verifying',
            'in progress',
            'to confirm',
            'completed',
          ],
        },
      })
      .then(({ ordersByMerchant }) => {
        this.orderStatusDelivery.delivered = {
          ...this.orderStatusDelivery.delivered,
          length: ordersByMerchant.length,
          orders: ordersByMerchant,
        };
      });
    this.merchantsService
      .ordersByMerchant(this.merchantsService.merchantData._id, {
        options: {
          limit: 10,
          sortBy: 'createdAt:desc',
        },
        findBy: {
          orderStatusDelivery: 'delivered',
          orderStatus: [
            'started',
            'verifying',
            'in progress',
            'to confirm',
            'completed',
          ],
        },
      })
      .then(({ ordersByMerchant }) => {
        this.orderStatusDelivery.delivered = {
          ...this.orderStatusDelivery.delivered,
          status: 'complete',
          orders: ordersByMerchant,
        };
      });
    // Entregadas

    console.log(this.orderStatusDelivery);

    if (this.articleId !== '') {
      const inProgressPagination: PaginationInput = {
        findBy: {
          item: this.articleId,
          orderStatusDelivery: 'in progress',
        },
        options: {
          limit: -1
        }
      };
      this.itemInProgressOrders = await this.ordersService.ordersByItem(
        inProgressPagination
      );
      console.log("this.itemInProgressOrders", this.itemInProgressOrders);

      const pendingPagination = {
        findBy: {
          item: this.articleId,
          orderStatusDelivery: 'pending',
        },
        options: {
          limit: -1
        }
      };
      this.itemPendingOrders = await this.ordersService.ordersByItem(
        pendingPagination
      );
      // console.log(this.itemPendingOrders);

      const pickupPagination = {
        findBy: {
          item: this.articleId,
          orderStatusDelivery: 'pickup',
        },
        options: {
          limit: -1
        }
      };
      this.itemPickupOrders = await this.ordersService.ordersByItem(
        pickupPagination
      );
      // console.log(this.itemPickupOrders);

      const shippedPagination = {
        findBy: {
          item: this.articleId,
          orderStatusDelivery: 'shipped',
        },
        options: {
          limit: -1
        }
      };
      this.itemShippedOrders = await this.ordersService.ordersByItem(
        shippedPagination
      );
      // console.log(this.itemShippedOrders);

      const deliveredPagination = {
        findBy: {
          item: this.articleId,
          orderStatusDelivery: 'delivered',
        },
        options: {
          limit: -1
        }
      };
      this.itemDeliveredOrders = await this.ordersService.ordersByItem(
        deliveredPagination
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
