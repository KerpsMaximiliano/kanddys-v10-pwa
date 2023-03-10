import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { getDaysAgo } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import {
  ItemOrder,
  OrderStatusDeliveryType,
  OrderStatusType,
} from 'src/app/core/models/order';
import { Tag } from 'src/app/core/models/tags';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { environment } from 'src/environments/environment';

interface ExtendedOrder extends ItemOrder {
  total?: number;
  date?: string;
  transaction?: string;
}

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent implements OnInit {
  env: string = environment.assetsUrl;
  tag: Tag;
  orders: ExtendedOrder[] = [];
  orderDeliveryStatus: string;
  orderStatus: string;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private orderService: OrderService,
    private merchantsService: MerchantsService,
    private tagsService: TagsService
  ) {}

  async ngOnInit(): Promise<void> {
    lockUI();
    const tagId = this.route.snapshot.paramMap.get('tagId');
    let status = this.route.snapshot.paramMap.get('status');
    let deliveryStatus = this.route.snapshot.paramMap.get('deliveryStatus');
    if (tagId) {
      this.tag = (await this.tagsService.tag(tagId))?.tag;
      const orders = await this.tagsService.ordersByTag([], -1, [tagId]);
      this.orders = orders[0].orders.map((itemOrder: ExtendedOrder) => {
        return this.addInfoToOrder(itemOrder);
      });
    }
    if (deliveryStatus) {
      deliveryStatus = deliveryStatus.replace('-', ' ');
      const orders = (
        await this.merchantsService.ordersByMerchant(
          this.merchantsService.merchantData._id,
          {
            findBy: {
              orderStatusDelivery: deliveryStatus,
              orderStatus: [
                'started',
                'verifying',
                'in progress',
                'to confirm',
                'completed',
                'paid',
              ],
            },
            options: {
              limit: -1,
              sortBy: 'createdAt:desc',
            },
          }
        )
      )?.ordersByMerchant;
      this.orders = orders.map((itemOrder: ExtendedOrder) => {
        return this.addInfoToOrder(itemOrder);
      });
      this.orderDeliveryStatus = this.orderService.orderDeliveryStatus(
        deliveryStatus as OrderStatusDeliveryType
      );
    }
    if (status) {
      status = status.replace('-', ' ');
      const orders = (
        await this.merchantsService.ordersByMerchant(
          this.merchantsService.merchantData._id,
          {
            findBy: {
              orderStatus: status,
            },
            options: {
              limit: -1,
              sortBy: 'createdAt:desc',
            },
          }
        )
      )?.ordersByMerchant;
      this.orders = orders.map((itemOrder: ExtendedOrder) => {
        return this.addInfoToOrder(itemOrder);
      });
      this.orderStatus = this.orderService.getOrderStatusName(
        status as OrderStatusType
      );
    }
    unlockUI();
  }

  addInfoToOrder(itemOrder: ExtendedOrder) {
    itemOrder.total = itemOrder.subtotals.reduce((a, b) => a + b.amount, 0);
    itemOrder.date = getDaysAgo(itemOrder.createdAt);
    if (itemOrder.ocr?.platform) {
      itemOrder.transaction =
        {
          'bank-transfer': 'Transferencia Bancaria',
        }[itemOrder.ocr.platform] || itemOrder.ocr.platform;
    }
    return itemOrder;
  }
}
