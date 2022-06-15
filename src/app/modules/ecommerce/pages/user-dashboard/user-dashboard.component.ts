import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { OrderService } from 'src/app/core/services/order.service';
import { Item } from 'src/app/core/models/item';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  env: string = environment.assetsUrl;
  tabs: string[] = ['Regalos', 'Tiendas', 'Eventos', 'NFTs'];
  userData: User;
  merchantData: Merchant;
  items: Item[] = [];
  ordersTotal: {
    total: number;
    length: number;
  };
  users: User[] = [];

  content: Array<any> = [
    {
    question: 'Preguntas automatizadas a tu WhatsApp para facilitar el primer contacto.',
    answer: 'Esto es una muestra de prueba',
    hidden: false,
    line: true
    },
    {
    question: 'Patrocinio',
    answer: 'Si',
    hidden: false,
    line: true
    },
    {
    question: 'Data de analisis',
    answer: '',
    hidden: false,
    line: true
    },
    {
    question: 'Vende Online o por WhatsApp',
    answer: '',
    hidden: false,
    line: false
    }
    ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private itemsService: ItemsService,
    private orderService: OrderService,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit(): Promise<void> {
    lockUI();
    const user = await this.authService.me();
    unlockUI();
    if (!user) return this.redirect();
    this.userData = user;
    this.merchantData = await this.merchantsService.merchantDefault();
    if(this.merchantData) {
      const [items, total, users] = await Promise.all([
        this.itemsService.itemsByMerchant(this.merchantData._id),
        this.orderService.ordersTotal(['completed', 'in progress', 'to confirm'], this.merchantData._id),
        this.merchantsService.usersOrderMerchant(this.merchantData._id)
      ]);
      this.items = items?.itemsByMerchant;
      this. ordersTotal = total;
      this.users = users;
    }
  }

  redirect() {
    this.router.navigate([`ecommerce/error-screen/`]);
  }

  wichName(e: string) {
    switch (e) {
      case 'Regalos':
        console.log('Compradores');
        break;
      case 'Tiendas':
        this.router.navigate(['tiendas'], {relativeTo: this.route });
        break;
      case 'Eventos':
        console.log('Eventos');
        break;
      case 'NFTs':
        console.log('NFTs');
        break;
    }
  }
}
