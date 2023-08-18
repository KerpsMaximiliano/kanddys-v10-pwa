import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  constructor(
    public merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    private headerService: HeaderService,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.authService.ready.subscribe(async (observer) => {
      if (observer == undefined) {
        this.headerService.flowRoute = this.router.url;
        this.router.navigate([`auth/login/`]);
        return;
      }

      this.merchantsService.merchantData =
        await this.merchantsService.merchantDefault();

      if (!this.merchantsService.merchantData) {
        this.headerService.flowRoute = this.router.url;

        const myMerchants = await this.merchantsService.myMerchants();

        console.log("MyMerchants", myMerchants);
        
        if (myMerchants.length === 0) this.router.navigate([`auth/login/`]);
        else {
          this.merchantsService.merchantData = myMerchants[0];
        }
        return;
      }
      setTimeout(() => {
        this.merchantsService.loadedMerchantData.next(true);
      }, 100);

      this.saleflowService.saleflowData =
        await this.saleflowService.saleflowDefault(
          this.merchantsService.merchantData._id
        );

      if (this.saleflowService.saleflowData) {
        this.saleflowService.saleflowLoaded.next(true);
      }
      /*
      Promise.all([
        this.merchantsService.incomeMerchant({
          findBy: {
            merchant: this.merchantsService.merchantData._id,
          },
        }),
        this.merchantsService.hotOrdersByMerchant(
          this.merchantsService.merchantData._id,
          {
            options: {
              limit: -1,
            },
          }
        ),
      ]).then(([incomeMerchantResponse, { ordersByMerchant }]) => {
        this.merchantsService.merchantIncome = {
          income: incomeMerchantResponse,
          orderAmount: ordersByMerchant.length,
        };
      });*/
    });
  }
}
