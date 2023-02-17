import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';

interface PositionCss {
  left?: string;
  right?: string;
  top?: string;
  bottom?: string;
}

@Component({
  selector: 'app-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['./menu-button.component.scss'],
})
export class MenuButtonComponent implements OnInit {
  uri: string = environment.uri;
  env: string = environment.assetsUrl;

  @Input() mode: 'basic' | 'array' = 'basic';
  @Input() size: 'normal' | 'mini' = 'normal';
  @Input() position: PositionCss;
  @Input() phone: string;
  @Input() link: string;
  @Input() options = [
    {
      text: 'Nueva Pregunta',
    },
    {
      text: 'Edita el formulario',
    },
    {
      text: 'Preview de Compradores',
    },
  ];
  @Input() merchantName: string;

  constructor(
    private ngNavigatorShareService: NgNavigatorShareService,
    public headerService: HeaderService,
    private authService: AuthService,
    private routerService: Router
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

  goToProfile() {
    return this.routerService.navigate([
      'ecommerce/' +
        this.headerService.saleflow.merchant.slug +
        '/contact-landing/' +
        this.headerService.user._id,
    ]);
  }
}
