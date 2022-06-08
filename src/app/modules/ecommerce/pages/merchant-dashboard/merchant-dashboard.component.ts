import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-merchant-dashboard',
  templateUrl: './merchant-dashboard.component.html',
  styleUrls: ['./merchant-dashboard.component.scss']
})
export class MerchantDashboardComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private merchantService: MerchantsService,
  ) { }

  tabs: string[] = ['items', 'items']
  userData: User;
  myMerchant: Merchant;
  orders: ItemOrder[];

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      lockUI();
      const user = await this.authService.me();
      if (!user) return this.redirect();
      this.userData = user;
      const merchants = await this.merchantService.myMerchants({});
      if(!merchants || !merchants.length) return this.redirect();
      this.myMerchant = merchants.find((merchant) => merchant._id === params.merchantId);
      if(!this.myMerchant) return this.redirect();
      this.orders = (await this.merchantService.ordersByMerchant(this.myMerchant._id, {options: { limit: 100 }}))?.ordersByMerchant;
      unlockUI();
    });
    
  }

  redirect() {
    unlockUI();
    this.router.navigate([`ecommerce/error-screen/`], {
      queryParams: { type: 'item' },
    });
  }

  whichName(e){
      switch(e){
          case 'items':
          console.log('cambio de pestaña');
          break;
          case 'items':
          console.log('pestaña2');
          break;
      }
  }
}
