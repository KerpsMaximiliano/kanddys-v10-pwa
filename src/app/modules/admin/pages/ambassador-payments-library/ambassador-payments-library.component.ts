import { Component, OnInit } from '@angular/core';
import { Merchant } from 'src/app/core/models/merchant';
import { PaymentLog } from 'src/app/core/models/paymentLog';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PaymentLogsService } from 'src/app/core/services/paymentLogs.service';
import { UsersService } from 'src/app/core/services/users.service';
import * as moment from 'moment';
@Component({
  selector: 'app-ambassador-payments-library',
  templateUrl: './ambassador-payments-library.component.html',
  styleUrls: ['./ambassador-payments-library.component.scss']
})
export class AmbassadorPaymentsLibraryComponent implements OnInit {
  users= [];
  

  constructor(private mechantDefault: MerchantsService, 
              private paymentLogsService: PaymentLogsService,
              private userService: UsersService) { }

  async ngOnInit() {
    await this.getMerchant();
    
  }

  async getMerchant(){
    const merchant:Merchant = await this.mechantDefault.merchantDefault();
    await this.getPaymentLog(merchant._id);
  }

  async getPaymentLog(merchant:string){
    const paginationInput: PaginationInput = {
      findBy: {
        merchant: merchant,
        reason: "payment-affiliate-star"
      }
    }
    const paymentLog: PaymentLog = await this.paymentLogsService.paymentLogStarPaginate(paginationInput);
    const log =  Object.keys(paymentLog).map(key => {
      return paymentLog[key]
    });
    const users =  Object.keys(paymentLog).map(key => {
      return paymentLog[key].user
    });
    await this.getPaginateUsers(users, log);
  }

  async getPaginateUsers(user, paymentLog){
    const paginationInput: PaginationInput = {
        findBy: {
          _id: user
        }
    }
    const paginateUser = await this.userService.paginateUser(paginationInput);
    const paginateUsers =  Object.keys(paginateUser).map(key => {
      return paginateUser[key].results
    });
    const paginateUsersInfo = paginateUsers[0]
    this.parseUserInfo(paginateUsersInfo, paymentLog);
  }

  getTitle(user: any): string {
    return user.name ? user.name: user.phone ? user.phone: user.email;
  }

  parseUserInfo(user: Array<any>, paymentLog){
    let userInfo = [];
    const paymentLogInfo =  Object.keys(paymentLog).map(key => {
      return paymentLog[key]
    });
    paymentLogInfo.forEach(async (info) => {
      userInfo.push({
        amount: info.ammount,
        img: info.metadata.screenshot,
        createdAt: info.createdAt,
        user: user.filter(log => info.user === log._id)
      })
    });
    this.users = userInfo;
    console.log("🚀 ~ file: ambassador-payments-library.component.ts:82 ~ AmbassadorPaymentsLibraryComponent ~ parseUserInfo ~ userInfo:", userInfo)
  }

  getComission(ammount: string){
    return `$${ammount} de comisión pagada`;
  }

  formatDate(createdAt){
    return moment(createdAt).format("YYYY-MM-DD");
  }

}
