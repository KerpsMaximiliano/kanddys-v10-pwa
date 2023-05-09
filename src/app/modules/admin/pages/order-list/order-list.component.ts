import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import {
  formatID,
  formatPhoneNumber,
  getDaysAgo,
} from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Notification } from 'src/app/core/models/notification';
import { ItemOrder, OrderStatusDeliveryType } from 'src/app/core/models/order';
import { User } from 'src/app/core/models/user';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { OrderService } from 'src/app/core/services/order.service';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { environment } from 'src/environments/environment';

interface ExtendedOrder extends ItemOrder {
  total?: number;
  date?: string;
}

interface ExtendedUser extends User {
  income?: number;
  amount?: number;
}

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent implements OnInit {
  URI: string = environment.uri;
  env: string = environment.assetsUrl;
  // tag: Tag;
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  orders: ExtendedOrder[] = [];
  buyers: ExtendedUser[] = [];
  title: string;
  redirectTo: string = '../../';
  showSearchBar = false;
  searchText = '';
  deliveryStatus: OrderStatusDeliveryType;
  merchantNumber: string;
  notification: Notification;
  // orderStatus: string;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private orderService: OrderService,
    private merchantsService: MerchantsService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private _bottomSheet: MatBottomSheet,
    private notificationsService: NotificationsService
  ) {}

  async ngOnInit(): Promise<void> {
    lockUI();
    // const tagId = this.route.snapshot.paramMap.get('tagId');
    // let status = this.route.snapshot.paramMap.get('status');
    this.deliveryStatus = this.route.snapshot.paramMap.get(
      'deliveryStatus'
    ) as OrderStatusDeliveryType;
    let filter = this.route.snapshot.paramMap.get('filter') as 'recurrent';
    // if (tagId) {
    //   this.tag = (await this.tagsService.tag(tagId))?.tag;
    //   const orders = await this.tagsService.ordersByTag([], -1, [tagId]);
    //   this.orders = orders[0].orders.map((itemOrder: ExtendedOrder) => {
    //     return this.addInfoToOrder(itemOrder);
    //   });
    // }
    this.status = 'loading';
    this.merchantNumber = formatPhoneNumber(
      this.merchantsService.merchantData.owner.phone
    );
    if (this.deliveryStatus) {
      this.deliveryStatus = this.deliveryStatus.replace(
        '-',
        ' '
      ) as OrderStatusDeliveryType;
      const orders = (
        await this.merchantsService.ordersByMerchant(
          this.merchantsService.merchantData._id,
          {
            findBy: {
              orderStatusDelivery: this.deliveryStatus,
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
      this.title = this.orderService.orderDeliveryStatus(this.deliveryStatus);
      this.status = 'complete';
      unlockUI();

      const result = await this.notificationsService.notifications(
        {
          options: {
            limit: -1,
            sortBy: 'createdAt:desc',
          },
          findBy: {
            entity: 'order',
            type: 'standard',
            mode: 'default',
            active: true,
          },
        },
        this.merchantsService.merchantData._id
      );
      this.notification = result.find(
        (notification) =>
          notification.trigger[0].key === 'orderStatusDelivery' &&
          notification.trigger[0].value === this.deliveryStatus
      );
    } else if (filter) {
      if (filter === 'recurrent') {
        // Usuarios recurrentes
        this.title = '20% que mas facturan';
        this.merchantsService
          .recurringBuyersByMerchant({
            findBy: {
              merchant: this.merchantsService.merchantData._id,
            },
            options: {
              sortBy: 'count:desc',
              limit: -1,
            },
            filter: {
              percentageResult: 0.2,
            },
          })
          .then((result) => {
            this.buyers = result.map((value) => {
              (<ExtendedUser>value.user).amount = value.count;
              return value.user;
            });
            this.status = 'complete';
            unlockUI();
            this.getBuyersIncome();
          });
        // Usuarios recurrentes
      }
    } else {
      // Todos los compradores
      this.redirectTo = '../';
      this.title = 'Todos los compradores';
      this.merchantsService
        .buyersByMerchant({
          findBy: {
            merchant: this.merchantsService.merchantData._id,
          },
          options: {
            limit: -1,
          },
        })
        .then((result) => {
          this.buyers = result;
          this.status = 'complete';
          unlockUI();
          this.getBuyersIncome();
        });
      // Todos los compradores
    }
    // if (status) {
    //   status = status.replace('-', ' ');
    //   const orders = (
    //     await this.merchantsService.ordersByMerchant(
    //       this.merchantsService.merchantData._id,
    //       {
    //         findBy: {
    //           orderStatus: status,
    //         },
    //         options: {
    //           limit: -1,
    //           sortBy: 'createdAt:desc',
    //         },
    //       }
    //     )
    //   )?.ordersByMerchant;
    //   this.orders = orders.map((itemOrder: ExtendedOrder) => {
    //     return this.addInfoToOrder(itemOrder);
    //   });
    //   this.orderStatus = this.orderService.getOrderStatusName(
    //     status as OrderStatusType
    //   );
    // }
  }

  getBuyersIncome() {
    // Un array con todos los usuarios para obtener el income de cada uno
    const allUsers = [...new Set([...this.buyers.map((value) => value._id)])];
    allUsers.forEach(async (id) => {
      const incomeMerchant = await this.merchantsService.incomeMerchant({
        findBy: {
          user: id,
          merchant: this.merchantsService.merchantData._id,
        },
      });
      const buyerIndex = this.buyers.findIndex((user) => user._id === id);
      if (buyerIndex > -1) this.buyers[buyerIndex].income = incomeMerchant;
      // user.income = incomeMerchant;
    });
  }

  addInfoToOrder(itemOrder: ExtendedOrder) {
    itemOrder.total =
      itemOrder.subtotals?.reduce((prev, curr) => prev + curr.amount, 0) || 0;
    itemOrder.date = getDaysAgo(itemOrder.createdAt);
    return itemOrder;
  }

  formatId(id: string) {
    return formatID(id).split(/(?=N)/g)[1];
  }

  share() {
    const data = [
      {
        title: `Posibles acciones con las facturas que están en el progreso “${this.title}”`,
        options: [
          {
            title: 'Compartir el link con acceso a “la dirección de entrega” ',
            callback: () => {
              this.ngNavigatorShareService.share({
                title: '',
                url: `${this.URI}/ecommerce/order-process/${this.merchantsService.merchantData._id}?view=delivery`,
              });
            },
          },
          {
            title: 'Compartir el link con acceso a “los artículos” ',
            callback: () => {
              this.ngNavigatorShareService.share({
                title: '',
                url: `${this.URI}/ecommerce/order-process/${this.merchantsService.merchantData._id}?view=assistant`,
              });
            },
          },
          {
            title: 'Compartir el link con acceso a toda la data',
            callback: () => {
              this.ngNavigatorShareService.share({
                title: '',
                url: `${this.URI}${this.router.url}`,
              });
            },
          },
        ],
      },
    ];
    this._bottomSheet.open(LinksDialogComponent, {
      data,
    });
  }
}
