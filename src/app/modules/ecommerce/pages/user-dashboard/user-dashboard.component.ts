import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user';
import { lockUI } from 'src/app/core/helpers/ui.helpers';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  tabs: string[] = ['Regalos', 'Tiendas', 'Eventos', 'NFTs'];
  userData: User;
  env: string = environment.assetsUrl;

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    lockUI(this.authService.me().then((user) => {
      if (!user) return this.redirect();
      this.userData = user;
    }));
  }

  redirect() {
    this.router.navigate([`ecommerce/error-screen/`], {
      queryParams: { type: 'item' },
    });
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
