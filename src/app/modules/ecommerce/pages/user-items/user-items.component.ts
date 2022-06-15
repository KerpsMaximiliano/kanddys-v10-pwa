import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-user-items',
  templateUrl: './user-items.component.html',
  styleUrls: ['./user-items.component.scss']
})
export class UserItemsComponent implements OnInit {
  items: Item[] = [];
  // merchantID: string;
  ordersTotal: {
    total: number;
    length: number;
  };
  users: User[];

  constructor(
    private itemsService: ItemsService,
    private ordersService: OrderService,
    private merchantsService: MerchantsService,
    private authService: AuthService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {

    await this.authService.me().then(data => {
      if (!data || data === undefined) this.redirect;
      console.log(data)
    });

    // TODO: Replace this with a header service  call to get the merchant ID
    const merchantID = "616a13a527bcf7b8ba3ac312";
    
    await Promise.all([
      this.getOrderTotal(merchantID),
      this.getMerchantBuyers(merchantID),
      this.getItems(merchantID)
    ]);
  }

  async getOrderTotal(merchantID: string) {
    try {
      this.ordersTotal = await this.ordersService.ordersTotal(['in progress', 'to confirm', 'completed'], merchantID);
    } catch (error) {
      console.log(error);
    }
  }

  async getMerchantBuyers(merchantID: string) {
    try {
      this.users = await this.merchantsService.usersOrderMerchant(merchantID);
    } catch (error) {
      console.log(error);
    }
  }

  async getItems(merchantID: string) {
    try {
      this.items = (await this.itemsService.itemsByMerchant(merchantID)).itemsByMerchant;
    } catch (error) {
      console.log(error);
    }
  }

  redirect() {
    this.router.navigate(['/']);
  }

}