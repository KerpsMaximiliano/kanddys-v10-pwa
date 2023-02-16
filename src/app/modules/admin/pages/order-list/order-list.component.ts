import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemOrder, OrderStatusDeliveryType } from 'src/app/core/models/order';
import { Tag } from 'src/app/core/models/tags';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { environment } from 'src/environments/environment';

interface ExtendedOrder extends ItemOrder {
  total?: number;
  date?: string;
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

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private merchantsService: MerchantsService,
    private tagsService: TagsService
  ) {}

  async ngOnInit(): Promise<void> {
    lockUI();
    const tagId = this.route.snapshot.paramMap.get('tagId');
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
            },
            options: {
              limit: -1,
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
    unlockUI();
  }

  addInfoToOrder(itemOrder: ExtendedOrder) {
    itemOrder.total = itemOrder.subtotals.reduce((a, b) => a + b.amount, 0);
    const temporalDate = new Date(itemOrder.createdAt);
    itemOrder.date = temporalDate
      .toLocaleString('es-MX', {
        hour12: true,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      .toLocaleUpperCase();
    return itemOrder;
  }
}
