import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Merchant } from 'src/app/core/models/merchant';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-laia-assistant',
  templateUrl: './laia-assistant.component.html',
  styleUrls: ['./laia-assistant.component.scss']
})
export class LaiaAssistantComponent implements OnInit {
  newArticle: string;
  merchantDefault: Merchant;
  user: User;
  assetsFolder: string = environment.assetsUrl;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public headerService: HeaderService,
    private merchantService: MerchantsService,
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    this.user = await this.authService.me();
    if (this.user) {
      this.merchantDefault = await this.merchantService.merchantDefault();
    }
    this.route.queryParams.subscribe((queryParams) => {
      this.newArticle = queryParams?.newArticle;
    });
  }

  goBack() {
    this.router.navigate(['/ecommerce/club-landing']);
  }

}
