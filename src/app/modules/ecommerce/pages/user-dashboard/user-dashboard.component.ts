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
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    lockUI(this.authService.me().then((user) => {
      if (!user) return this.redirect();
      this.userData = user;
    }));
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
