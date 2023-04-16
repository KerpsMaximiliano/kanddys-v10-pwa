import { Component, OnInit, Input } from '@angular/core';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';

export interface PositionCss {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
}

export interface MenuOptions {
  text: string;
  icon?: string;
  callback: () => void;
}

@Component({
  selector: 'app-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['./menu-button.component.scss'],
})
export class MenuButtonComponent implements OnInit {
  uri: string = environment.uri;
  env: string = environment.assetsUrl;

  @Input() size: 'normal' | 'mini' = 'normal';
  @Input() position: PositionCss;
  @Input() phone: string;
  @Input() link: string;
  @Input() options: MenuOptions[] = [];
  @Input() merchantName: string;

  constructor(
    private ngNavigatorShareService: NgNavigatorShareService,
    public headerService: HeaderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  goToWhatsapp() {
    window.location.href = `https://wa.me/${this.phone}?text=Hola`;
  }

  shareStore() {
    this.ngNavigatorShareService
      .share({
        title: '',
        url: this.link,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  logout() {
    this.authService.signoutThree();
  }
}
