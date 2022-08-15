import { Component, OnInit } from '@angular/core';
import { ItemOrder } from 'src/app/core/models/order';
import { Tag } from 'src/app/core/models/tags';
import { environment } from 'src/environments/environment';
import { ItemList } from '../../../../../shared/components/item-list/item-list.component';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { TagsService } from 'src/app/core/services/tags.service';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-user-orders',
  templateUrl: './user-orders.component.html',
  styleUrls: ['./user-orders.component.scss']
})
export class UserOrdersComponent implements OnInit {
  env: string = environment.assetsUrl;
  totalIncome: number;
  totalSales: number;
  tags: Tag[] = [];
  orders: ItemOrder[] = [];
  orderList: ItemList[] = [];
  showTags: boolean = false;
  

  constructor(
    private tagsService: TagsService,
    private orderService: OrderService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.getTags();
    this.getOrders();
    this.getOrdersTotal();
  }

  async getTags() {
    this.tags = await this.tagsService.tagsByUser();
  }

  async getOrders() {
    this.orders = (await this.orderService.ordersByUser({
      options: {
        sortBy: "createdAt:desc",
        limit: 10,
        page: 1,
        range: {}
      }
    }))?.ordersByUser;
    this.orders.forEach(order => {
      let today = moment()
      let daysAgo = today.diff(order.createdAt, 'days');
      let timeAgo = "Today"

      if (daysAgo > 0) {
        timeAgo = "Hace " + daysAgo + " dias."
      }
      //  let dateID = this.formatID(order.dateId)
      this.orderList.push({
        visible: true,
        id: order._id,
        image: order.items[0].item.images[0],
        eventImage: () => this.router.navigate([`ecommerce/order-info/${order._id}`]),
        title: '$' + order.subtotals[0].amount.toLocaleString('es-MX'),
        eventTitle: () => this.router.navigate([`ecommerce/order-info/${order._id}`]),
        subtitle: order.items[0].item.name,
        text_left: timeAgo,
        text_right: order.tags.length && order.tags.length + ' etiqueta(s)',
        text_style: true,
        phone: order.user.phone,
        add_tag: true,
        tag_function: () => this.router.navigate([`ecommerce/data-list/${order._id}`], { queryParams: { viewtype: 'user', mode: 'tag' } }),
      });
    });
  }

  async getOrdersTotal() {
    // const result = await this.orderService.ordersTotal(['to confirm', 'completed']);
    // if(!result) throw new Error('Error al obtener los resultados de las ordenes');
    // this.totalIncome = result.total;
    // this.totalSales = result.length;
  }
}
