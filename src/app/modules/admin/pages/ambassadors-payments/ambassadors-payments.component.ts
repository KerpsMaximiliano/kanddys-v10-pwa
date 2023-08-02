import { Component, OnInit, ViewChild } from '@angular/core';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-ambassadors-payments',
  templateUrl: './ambassadors-payments.component.html',
  styleUrls: ['./ambassadors-payments.component.scss']
})
export class AmbassadorsPaymentsComponent implements OnInit {
  merchantId: string;
  walletQuery: PaginationInput = {
    findBy: {
      currency: "",
      metadata: {
        isRedeemable: false
      },
    },
    options: {
      sortBy: "balance:desc"
    }
  };
  users : any[] | null = null;
  wallets : any[] | null = null;
  constructor(private MerchantsService : MerchantsService) { }

  ngOnInit(): void {
    this.getWallets();
  }

  async getWallets(){
    await this.MerchantsService.merchantDefault().then((data)=>{
      this.merchantId = data._id;
    })
    await this.MerchantsService.currencyStartByMerchant(this.merchantId).then((data)=>{
      this.walletQuery.findBy.currency = data.affiliate._id;
      console.log(this.walletQuery.findBy)
    })
    let walletUsers : string;
    await this.MerchantsService.walletsByCurrency(this.walletQuery).then((data)=>{
        console.log(data)
        this.wallets = data
        walletUsers = data.map((wallet) => wallet.owner._id)
        console.log(walletUsers)
    })
    this.MerchantsService.paginateUsers({
      findBy: {
        id: walletUsers
      }
    }).then((data)=>{
      this.users = data.results;
      console.log(this.users)
    })
  }

  async onPaymentImage(event: any, index: number) {
    setTimeout(() => {
      console.log(event)
      this.MerchantsService.payUserStarAffiliate(
        event.target.files[0],
        "bank-transfer",
        this.merchantId,
        this.wallets[index].owner._id,
        ).then((data)=>{
          console.log(data)
      })
    }, 5000)
  }
}
