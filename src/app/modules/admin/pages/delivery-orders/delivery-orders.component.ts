import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { environment } from 'src/environments/environment';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeliveryZone } from 'src/app/core/models/deliveryzone';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';


@Component({
  selector: 'app-delivery-orders',
  templateUrl: './delivery-orders.component.html',
  styleUrls: ['./delivery-orders.component.scss']
})
export class DeliveryOrdersComponent implements OnInit {

  env: string = environment.assetsUrl;
  URI: string = environment.uri;

  redirectTo: string = null;

  deliveryZone: DeliveryZone;

  merchant: Merchant;
  orders: ItemOrder[] = [];
  facturasDisplayArray: Array<{
    image: string,
    username: string,
    total: number,
    date: Date
  }>;

  totalIncome: number;

  constructor(
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
    public router: Router,
    private _bottomSheet: MatBottomSheet,
    private ngNavigatorShareService: NgNavigatorShareService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private deliveryzoneService: DeliveryZonesService,
  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { redirectTo, deliveryZone } = queryParams;

      this.redirectTo = redirectTo;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;

      await this.getMerchant();
      if (deliveryZone) await this.getDeliveryZone(deliveryZone);
      await this.getOrders(this.merchant._id, deliveryZone);
      this.getTotalIncome(this.orders);
    });
  }

  async getMerchant() {
    try {
      const result = await this.merchantsService.merchantDefault();
      this.merchant = result;
    } catch (error) {
      console.log(error);
    }
  }

  async getDeliveryZone(deliveryZoneId: string) {
    try {
      const result = await this.deliveryzoneService.deliveryZone(deliveryZoneId);
      this.deliveryZone = result;
    } catch (error) {
      console.log(error);
    }
  }

  async getOrders(merchantId: string, deliveryzone?: string) {
    try {
      const result = await this.merchantsService.ordersByMerchant(
        merchantId,
        {
          options: {
            limit: -1,
            sortBy: 'createdAt:desc',
          },
          findBy: {
            orderStatusDelivery: [ 'in progress', 'pending'],
            deliveryZone: deliveryzone ? deliveryzone : undefined,
          }
        }
      );

      this.orders = result.ordersByMerchant;

      this.facturasDisplayArray = this.orders.map(order => {
        return {
          image: order?.user?.image ? order.user?.image : 'https://www.gravatar.com/avatar/0?s=250&d=mp',
          username: order?.user ? order?.user?.name : 'Usuario eliminado',
          total: order.subtotals.reduce((subtotalAccumulator, subtotal) => {
            return subtotalAccumulator + subtotal.amount;
          }, 0),
          date: new Date(order.createdAt)
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  getTotalIncome(orders: ItemOrder[]) {
    this.totalIncome = orders.reduce((accumulator, order) => {
      return accumulator + order.subtotals.reduce((subtotalAccumulator, subtotal) => {
        return subtotalAccumulator + subtotal.amount;
      }, 0);
    }, 0);
  }

  settings() {
    console.log('settings');
  }
  
  share() {
    const link = `${this.URI}/ecommerce/order-process/${this.merchant._id}`;
    const bottomSheetRef = this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          title: `Vista e interfaz con toda la info`,
          options: [
            {
              title: 'Compartir el Link para el asistente',
              callback: () => {
                this.ngNavigatorShareService.share({
                  title: '',
                  url: `${link}?view=assistant`,
                });
              },
            },
            {
              title: 'Compartir el Link para el mensajero',
              callback: () => {
                this.ngNavigatorShareService.share({
                  title: '',
                  url: `${link}?view=delivery`,
                });
              },
            },
            {
              title: 'Copiar el Link para el asistente',
              callback: () => {
                this.clipboard.copy(`${link}?view=assistant`);
                this.snackBar.open('Enlace copiado en el portapapeles', '', {
                  duration: 2000,
                });
              },
            },
            {
              title: 'Copiar el Link para el mensajero',
              callback: () => {
                this.clipboard.copy(`${link}?view=delivery`);
                this.snackBar.open('Enlace copiado en el portapapeles', '', {
                  duration: 2000,
                });
              },
            }
          ],
        }
      ],
    });
  }

  returnEvent() {
    let queryParams = {};
    if (this.redirectTo.includes('?')) {
      const url = this.redirectTo.split('?');
      this.redirectTo = url[0];
      const queryParamList = url[1].split('&');
      for (const param in queryParamList) {
        const keyValue = queryParamList[param].split('=');
        queryParams[keyValue[0]] = keyValue[1];
      }
    }
    this.router.navigate([this.redirectTo], {
      queryParams,
    });
  }

  returnToAdmin() {
    this.router.navigate([`admin/order-process/${this.merchant._id}`]);
  }

}
