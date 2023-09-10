import { Component, OnInit } from '@angular/core';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { UsersService } from 'src/app/core/services/users.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss']
})
export class UserSearchComponent implements OnInit {
  timeout : ReturnType<typeof setTimeout>;
  id: string;
  orders: any[] | null = null;
  manualOrderId: string;
  returnTo: string;
  constructor(
    private MerchantsService : MerchantsService,
    private UsersService : UsersService,
    private router : Router,
    private route : ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if(params.returnTo) {
        this.returnTo = params.returnTo;
      }
      if(params.manualOrderId) {
        this.manualOrderId = params.manualOrderId;
      }
    })
    this.MerchantsService.merchantDefault().then((data) => {
      this.id = data._id;
    });
  }

  goToUserEntry() {
    let params = {};
    if(this.returnTo) {
      params['returnTo'] = this.returnTo;
    }
    if(this.manualOrderId) {
      params['manualOrderId'] = this.manualOrderId;
    }
    this.router.navigate(['/admin/user-entry'], {queryParams: params});
  }

  goBack() {
    if(this.returnTo === 'manual-order-management') {
      this.router.navigate([`/ecommerce/manual-order-management/${this.manualOrderId}`]);
    } else {
      this.router.navigate(['/ecommerce/cart'])
    }
  }

  async searchHandler(event: any) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if(event.target.value) {
        this.UsersService.ordersByUserSearchParam(this.id, event.target.value, {sortBy: "createdAt:desc"}).then((data) => {
          this.orders = data;
        });
      }
    }, 1000);
  }

  selectUser(user) {
    console.log(user)
    if(this.returnTo) {
      this.router.navigate([`/ecommerce/manual-order-management/${this.manualOrderId}`], {queryParams: {userId: user._id}});
    }
  }

  dateHandler(datestring: string) {
    console.log(datestring)
    let date = new Date(datestring)
    console.log(date)
    let time = Math.ceil((new Date().getTime() - date.getTime())/(1000*60));
    console.log(time)
    if(time <= 1) {
      return '1 minuto';
    }
    if(time < 60) {
      return time + ' minutos';
    }
    if(time < 120) {
      return '1 hora';
    }
    if(time < 1440) {
      return Math.ceil(time/60) + ' horas';
    }
    if(time < 2880) {
      return '1 día';
    }
    if(time < 43800) {
      return Math.ceil(time/1440) + ' dias';
    }
    if(time < 87600) {
      return '1 mes';
    }
    if(time < 525600) {
      return Math.ceil(time/43800) + ' meses';
    }
    if(time < 1051200) {
      return '1 año';
    }
    return Math.ceil(time/525600) + ' años';
  }
}
