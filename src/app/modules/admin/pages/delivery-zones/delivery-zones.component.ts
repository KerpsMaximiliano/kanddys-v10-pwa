import { Component, OnInit } from '@angular/core';
import { DeliveryZone } from 'src/app/core/models/deliveryzone';
import { Merchant } from 'src/app/core/models/merchant';
import { Expenditure, ItemOrder } from 'src/app/core/models/order';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment';
import { ZoneDialogs } from './zone-dialogs';

@Component({
  selector: 'app-delivery-zones',
  templateUrl: './delivery-zones.component.html',
  styleUrls: ['./delivery-zones.component.scss']
})
export class DeliveryZonesComponent implements OnInit {

  env: string = environment.assetsUrl;
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

  constructor(
    private deliveryzonesService: DeliveryZonesService,
    private merchantsService: MerchantsService,
    private ordersService: OrderService,
    private dialogflowService: DialogFlowService,
  ) { }

  async ngOnInit() {
    await this.getMerchant();
    await this.getDeliveryZones();

    this.deliveryZones.forEach(async zone => {
      await this.getOrdersBydeliveryZone(zone);
    });

    await this.getExpenditures();

    console.log(this.deliveryIncomes);
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
            orderStatus: ["to confirm", "paid", "completed"]
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
    return new ZoneDialogs(
      this.dialogflowService,
      this.deliveryzonesService
    );
  }

  close() {

  }

}
