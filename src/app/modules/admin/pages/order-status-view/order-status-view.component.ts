import { Component, OnInit } from '@angular/core';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemOrder } from 'src/app/core/models/order';
import { Tag } from 'src/app/core/models/tags';
import { MerchantsService } from 'src/app/core/services/merchants.service';
// import { OrderService } from 'src/app/core/services/order.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { environment } from 'src/environments/environment';

interface ExtendedTag extends Tag {
  orderAmount?: number;
}

@Component({
  selector: 'app-order-status-view',
  templateUrl: './order-status-view.component.html',
  styleUrls: ['./order-status-view.component.scss'],
})
export class OrderStatusViewComponent implements OnInit {
  env: string = environment.assetsUrl;
  // orderDeliveryStatus = this.orderService.orderDeliveryStatus;
  tags: ExtendedTag[] = [];
  orders: ItemOrder[] = [];
  draftOrders: ItemOrder[] = [];
  orderStatusDelivery = {
    inProgress: [],
    delivered: [],
    pending: [],
    shipped: [],
    pickup: [],
  };

  constructor(
    // private orderService: OrderService,
    private merchanstService: MerchantsService,
    private tagsService: TagsService
  ) {}

  async ngOnInit(): Promise<void> {
    lockUI();
    Promise.all([
      this.merchanstService.hotOrdersByMerchant(
        this.merchanstService.merchantData._id,
        {
          options: {
            limit: -1,
          },
        }
      ),
      this.tagsService.tagsByUser({
        findBy: {
          entity: 'order',
        },
        options: {
          limit: -1,
        },
      }),
    ]).then((result) => {
      const [{ ordersByMerchant }, tags] = result;
      this.orders = ordersByMerchant.filter(
        (itemOrder) => itemOrder.orderStatus !== 'draft'
      );
      this.draftOrders = ordersByMerchant.filter(
        (itemOrder) => itemOrder.orderStatus === 'draft'
      );
      this.orderStatusDelivery.inProgress = this.orders.filter(
        (itemOrder) => itemOrder.orderStatusDelivery === 'in progress'
      );
      this.orderStatusDelivery.pending = this.orders.filter(
        (itemOrder) => itemOrder.orderStatusDelivery === 'pending'
      );
      this.orderStatusDelivery.pickup = this.orders.filter(
        (itemOrder) => itemOrder.orderStatusDelivery === 'pickup'
      );
      this.orderStatusDelivery.shipped = this.orders.filter(
        (itemOrder) => itemOrder.orderStatusDelivery === 'shipped'
      );
      this.orderStatusDelivery.delivered = this.orders.filter(
        (itemOrder) => itemOrder.orderStatusDelivery === 'delivered'
      );

      this.tags = tags.map((tag: ExtendedTag) => {
        tag.orderAmount = this.orders.filter((itemOrder) =>
          itemOrder.tags.includes(tag._id)
        ).length;
        return tag;
      });
      unlockUI();
    });
  }
}
