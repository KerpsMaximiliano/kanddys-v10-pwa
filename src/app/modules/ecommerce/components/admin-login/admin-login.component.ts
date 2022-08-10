import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent implements OnInit {
  admin: boolean;
  constructor(
    private authService: AuthService,
    private router: Router,
    ) {}

  merchantList = [
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
  ];

  ngOnInit(): void {}

  async adminLogin(index: number) {
    const session = await this.authService.signin(this.merchantList[index].phone, this.merchantList[index].password, false);
    if(session) this.router.navigate(['/ecommerce/entity-detail-metrics']);
  }

  async onSubmit(form?: NgForm) {
    if(!form.value.password?.trim()) return;
    const session = await this.authService.signin('19188156444', form.value.password, false);
    if(session) this.admin = true;
  }
}
