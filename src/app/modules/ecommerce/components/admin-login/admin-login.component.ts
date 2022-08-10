import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { Merchant } from 'src/app/core/models/merchant';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent implements OnInit {

  admin: boolean;
  merchantList: Array<Merchant>;
  merchantsMain: Array<Merchant>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private merchant: MerchantsService,
    ) {}

 /*  merchantList = [
    {
      name: 'Foto Davitte',
      phone: '19188156444',
      password: '123'
    },
    {
      name: 'Caffaro',
      phone: '18492203488',
      password: '123'
    },
    {
      name: 'Cecilia',
      phone: '18095636780',
      password: '123'
    },
  ]; */

  ngOnInit(): void {}

  async adminLogin(index: number) {
    const session = await this.authService.signin(this.merchantList[index].owner.phone, this.merchantList[index]._id, false);
    if(session) this.router.navigate(['/ecommerce/entity-detail-metrics']);
  }

  async onSubmit(form?: NgForm) {
    if(!form.value.password?.trim()) return;
    const session = await this.authService.signin('19188156444', form.value.password, false);
    if(session) this.admin = true;

    try{
        const merchAll = await this.merchant.merchants({options: {sortBy:'createdAt:desc', limit: 135}});
        merchAll.splice(1, 0, merchAll.splice(118, 1)[0], merchAll.splice(119, 1)[0]);
        this.merchantList = merchAll;
        // this.merchantList = [this.merchantsMain, ...merchAll];
        console.log(this.merchantList);
        
     } catch(error) {
        console.log(error)
     }
  }
}

//Fotodavite id:62ed55eecd8fc9d59c8d7b6b 0
//D'Licianthus id: 622662c9b510731e1329a1af 118
//Gift á Box ID: 62262b38b510731e13295be9 121