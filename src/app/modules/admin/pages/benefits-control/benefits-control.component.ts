import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { shortFormatID } from 'src/app/core/helpers/strings.helpers';
import { ItemOrder } from 'src/app/core/models/order';

@Component({
  selector: 'app-benefits-control',
  templateUrl: './benefits-control.component.html',
  styleUrls: ['./benefits-control.component.scss']
})
export class BenefitsControlComponent implements OnInit {

  orders: Array<ItemOrder> = []
  isSearch = false
  merchant: any | null = null
  isSearchToConf = false;
  searchStr = ""
  incomeMerchant = 0
  incomeMerchantLoading = false;
  toConfTotal: {
    total?: number;
    length?: number;
    items?: number;
  };
  toConfTotalLoading = false;
  toConfComTotal: {
    total?: number;
    length?: number;
    items?: number;
  };
  toConfComTotalLoading = false;

  constructor(
    private merchantsService: MerchantsService,
    private orderService: OrderService,
  ) { }

  async ngOnInit(): Promise<void> {
    lockUI()

    const merchant = await this.merchantsService.merchantDefault()
    this.merchant = merchant
    console.log(merchant)
    
    const pagination: PaginationInput = {
      findBy: {
        merchant: this.merchant._id
      },
      options: {
        sortBy: "createdAt:desc",
        limit: 50
      }
    }
    const data = await this.orderService.orderPaginate(pagination);
    const orders = data.orderPaginate;
    this.orders = orders;
    console.log("all orders", orders)

    unlockUI()
    
    const incomeMerchant = await this.merchantsService.incomeMerchant({
      findBy: {
        merchant: merchant._id,
      },
    });
    this.incomeMerchant = incomeMerchant
    this.incomeMerchantLoading = true
    console.log(incomeMerchant)

    const toConfTotal = await this.orderService.ordersTotal(['to confirm'], this.merchant._id);
    this.toConfTotal = toConfTotal
    this.toConfTotalLoading = true;
    console.log(toConfTotal)

    const toConfComTotal = await this.orderService.ordersTotal(['to confirm', 'completed'], this.merchant._id);
    this.toConfComTotal = toConfComTotal
    this.toConfComTotalLoading = true;
    console.log(toConfComTotal)
    
  }

  async getAllOrders() {
    if (this.isSearchToConf) {
      lockUI()
      this.isSearchToConf = false;
      const pagination: PaginationInput = {
        findBy: {
          merchant: this.merchant._id
        },
        options: {
          sortBy: "createdAt:desc",
          limit: 50
        }
      }
      const data = await this.orderService.orderPaginate(pagination);
      const orders = data.orderPaginate;
      this.orders = orders;
      console.log("all orders", orders)
      unlockUI()
    }
  }

  async getToConfOrders() {
    if (!this.isSearchToConf) {
      lockUI()
      this.isSearchToConf = true;
      const pagination: PaginationInput = {
        findBy: {
          merchant: this.merchant._id,
          orderStatus: "to confirm"
        },
        options: {
          sortBy: "createdAt:desc",
          limit: 50
        }
      }
      const data = await this.orderService.orderPaginate(pagination);
      const orders = data.orderPaginate;
      this.orders = orders;
      console.log("to confirm", orders)
      unlockUI()
    }
  }

  filterOrders() {
    const filterOrders = this.orders.filter(order => {
      return this.nameFormat(order.user).toLowerCase().indexOf(this.searchStr.toLowerCase()) > -1;
    })
    return filterOrders;
  }

  async cancelSearch () {
    this.isSearch = false;
    this.searchStr = "";
    if (this.isSearchToConf) {
      await this.getAllOrders()
      this.isSearchToConf = false;
    }
  }

  calcTotal (subtotals){
    let sum = 0;
    subtotals.map(item => {
      sum += item.amount
    })
    return this.amountFormat(sum)
  }
  
  formatID (dateID) {
    return shortFormatID(dateID)
  }

  isSameYearAndMonth(index1: number, index2: number) {
    const date1 = new Date(this.orders[index1].createdAt)
    const date2 = new Date(this.orders[index2].createdAt)
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );
  }

  isCurYearMonth(index) {
    const now = new Date()
    const date = new Date(this.orders[index].createdAt)
    return (
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth()
    );
  }

  getDateFormat(index: number) {
    const date = new Date(this.orders[index].createdAt);
    const options = { day: 'numeric' as const, month: 'short' as const, year: 'numeric' as const};
    const dateString = date.toLocaleDateString('en-GB', options);
    return dateString;
  }
  amountFormat(amount) {
    const formattedAmount = Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedAmount;
  }

  nameFormat(user: any) {
    return user?.name || user?.email || user?.phone || "NULL"
  }

  getTimeDifferenceString(index) {
    const now = new Date().getTime();
    const date = new Date(this.orders[index].createdAt).getTime()
    const diffInMilliseconds = now - date;
    
    const seconds = Math.floor(diffInMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    
    if (years > 0) {
      return years + ((years === 1) ? ' year ago' : ' years ago');
    } else if (months > 0) {
      return months + ((months === 1) ? ' month ago' : ' months ago');
    } else if (days > 0) {
      return days + ((days === 1) ? ' day ago' : ' days ago');
    } else if (hours > 0) {
      return hours + ((hours === 1) ? ' hour ago' : ' hours ago');
    } else if (minutes > 0) {
      return minutes + ((minutes === 1) ? ' minute ago' : ' minutes ago');
    } else {
      return seconds + ((seconds === 1) ? ' second ago' : ' seconds ago');
    }
}

}
