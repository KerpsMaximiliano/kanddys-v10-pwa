import { Component, OnInit } from '@angular/core';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { UsersService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.scss']
})
export class UserSearchComponent implements OnInit {
  timeout : ReturnType<typeof setTimeout>;
  id: string;
  orders: any[] | null = null;
  constructor(
    private MerchantsService : MerchantsService,
    private UsersService : UsersService
  ) {}
  ngOnInit(): void {
    this.MerchantsService.merchantDefault().then((data) => {
      this.id = data._id;
    });
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

  dateHandler(datestring: string) {
    let date = new Date(datestring)
    let time = Math.ceil((new Date().getTime() - date.getTime())/(1000*60));
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