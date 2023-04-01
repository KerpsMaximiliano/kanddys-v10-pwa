import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { DeliveryZone } from 'src/app/core/models/deliveryzone';
import { Merchant } from 'src/app/core/models/merchant';
import { Expenditure, ItemOrder } from 'src/app/core/models/order';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { ZoneDialogs } from './zone-dialogs';

@Component({
  selector: 'app-delivery-zones',
  templateUrl: './delivery-zones.component.html',
  styleUrls: ['./delivery-zones.component.scss']
})
export class DeliveryZonesComponent implements OnInit {

  env: string = environment.assetsUrl;
  URI: string = environment.uri;
  deliveryZones: DeliveryZone[] = [];
  merchant: Merchant;

  deliveryIncomes: Array<{
    deliveryZone: DeliveryZone,
    orders: string[],
    income: number
  }> = [];

  expenditures: Expenditure[] = [];

  totalDeliveries: number = 0;
  totalIncome: number = 0;
  totalExpenditures: number = 0;

  // Dialog flow variables
  swiperConfig: SwiperOptions = null;
  dialogs: Array<EmbeddedComponentWithId> = [];
  dialogFlowFunctions: Record<string, any> = {};
  isDialogOpen: boolean = false;

  constructor(
    private deliveryzonesService: DeliveryZonesService,
    private merchantsService: MerchantsService,
    private ordersService: OrderService,
    private dialogflowService: DialogFlowService,
    private _bottomSheet: MatBottomSheet,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {

    this.createDialogs();

    setTimeout(() => {
      this.dialogFlowFunctions.moveToDialogByIndex(0);
    }, 500);

    await this.getMerchant();
    await this.getDeliveryZones();

    this.deliveryZones.forEach(async zone => {
      await this.getOrdersBydeliveryZone(zone);
    });

    await this.getExpenditures();
  }

  async getDeliveryZones() {
    try {
      const result = await this.deliveryzonesService.deliveryZones(
        {
          options: {
            limit: -1,
            sortBy: "createdAt:desc"
          },
          findBy: {
            merchant: this.merchant._id,
            active: true
          }
        }
      );
      this.deliveryZones = result; 
    } catch (error) {
      console.log(error);
    }
  }

  async getMerchant() {
    try {
      const result = await this.merchantsService.merchantDefault();
      this.merchant = result;

      this.merchantsService.merchantData = result;
    } catch (error) {
      console.log(error);
    }
  }

  async getOrdersBydeliveryZone(deliveryZone: DeliveryZone) {

    try {
      const result = await this.merchantsService.ordersByMerchant(
        this.merchant._id,
        {
          findBy: {
            deliveryZone: deliveryZone._id,
            orderStatus: ["to confirm", "paid", "completed"],
          }
        }
      )
      
      this.deliveryIncomes.push({
        deliveryZone,
        orders: result.ordersByMerchant.map(order => order._id),
        income: this.calculateIncomeByDeliveries(result.ordersByMerchant)
      });

      this.totalDeliveries = this.calculateTotalDeliveries(this.deliveryIncomes);
      this.totalIncome = this.calculateTotalIncome(this.deliveryIncomes);
      
    } catch (error) {
      console.log(error);
    }
  }

  async getExpenditures() {
    try {
      const result = await this.ordersService.expenditures(
        {
          options: {
            limit: -1,
            sortBy: "createdAt:desc"
          },
          findBy: {
            merchant: this.merchant._id
          }
        }
      );
      
      this.expenditures = result;
      this.totalExpenditures = this.calculateTotalExpenditures(this.expenditures);

    } catch (error) {
      console.log(error);
    }
  }

  calculateTotalIncome(deliveryIncomes: Array<{ deliveryZone: DeliveryZone, orders: string[], income: number }>) {
    let total = 0;
    deliveryIncomes.forEach(income => {
      total += income.income;
    });
    return total;
  }

  calculateTotalExpenditures(expenditures: Expenditure[]) {
    let total = 0;
    expenditures.forEach(expenditure => {
      total += expenditure.amount;
    });
    return total;
  }

  calculateTotalDeliveries(deliveryIncomes: Array<{ deliveryZone: DeliveryZone, orders: string[], income: number }>) {
    let total = 0;
    deliveryIncomes.forEach(income => {
      total += income.orders.length;
    });

    return total;
  }

  calculateIncomeByDeliveries(orders: ItemOrder[]) {
    const totalAmount = orders.reduce((accumulator, order) => {
      const subtotalAmount = order.subtotals.reduce((subtotalAccumulator, subtotal) => {
        return subtotalAccumulator + subtotal.amount;
      }, 0);
      return accumulator + subtotalAmount;
    }, 0);

    return totalAmount;
  }

  createDialogs() {
    this.dialogs = new ZoneDialogs(
      this.dialogFlowFunctions,
      this.merchantsService,
      this.deliveryzonesService,
      this.dialogflowService
    ).inject();
  }

  openDialogFlow() {
    console.log("Abriendo dialog");
    this.isDialogOpen = true;
  }

  openSettingsDialogByZone(deliveryZone: DeliveryZone) {
    const link = `${this.URI}/ecommerce/${this.merchant.slug}/store`;
    const bottomSheetRef = this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          title: 'Settings de Zona de Entrega',
          options: [
            {
              title: 'Editar zona de entrega',
              callback: () => {
                // this.seedDialogFlow('flow1', deliveryZone);
                // this.isDialogOpen = true;
              },
            },
            {
              title: 'Eliminar zona de entrega',
              callback: async () => {
                let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                  data: {
                    title: `Eliminando zona de entrega '${deliveryZone.zona}'`,
                    description: `¿Estás seguro que deseas eliminar la zona de entrega '${deliveryZone.zona}'?`,
                  },
                });

                dialogRef.afterClosed().subscribe(async (result) => {
                  if (result === 'confirm') {
                    try {
                      await this.deliveryzonesService.delete(deliveryZone._id);
                      const index = this.deliveryIncomes.map(deliveryIncome => deliveryIncome.deliveryZone._id).indexOf(deliveryZone._id);
                      if (index !== -1) this.deliveryIncomes.splice(index, 1);

                      this.snackBar.open('Zona de entrega eliminada', '', {
                        duration: 2000,
                      });
                    } catch (error) {
                      console.log(error);
                    }
                  }
                });
              },
            }
          ],
        }
      ],
    });
  }

  close() {
    this.isDialogOpen = false;
    console.log("Cerrando dialogo");
  }

  goToOrders(deliveryZone: string) {
    this.router.navigate(
      [`/admin/order-process`, this.merchant._id],
      { queryParams: { deliveryZone: deliveryZone, redirectTo: this.router.url } }
    );
  }

  async seedDialogFlow(flowId: string, deliveryZone: DeliveryZone) {
    this.dialogflowService.resetDialogFlow(flowId);

    switch (deliveryZone.type) {
      case 'zone':
        // this.dialogflowService.dialogsFlows[flowId]['start'].dialogId = 'start';
        // this.dialogflowService.dialogsFlows[flowId]['start'].fields = [
        //   {

        //   }
        // ]
        break;
      case 'lesser':

        break;
      case 'lesser':

        break;
    }
  }

}
