import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-merchant-dashboard',
  templateUrl: './merchant-dashboard.component.html',
  styleUrls: ['./merchant-dashboard.component.scss']
})
export class MerchantDashboardComponent implements OnInit {

  constructor(
    private auth: AuthService
  ) { }

  isLogged: boolean = false;

  ngOnInit(): void {
    this.auth.me().then(data =>{
      console.log(data);
      if (data) {
        this.isLogged = true;
      }
    })
  }

}
