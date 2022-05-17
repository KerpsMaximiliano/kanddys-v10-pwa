import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { analizeMagicLink } from 'src/app/core/graphql/auth.gql';

@Component({
  selector: 'app-redirections',
  templateUrl: './redirections.component.html',
  styleUrls: ['./redirections.component.scss'],
})
export class RedirectionsComponent implements OnInit, OnDestroy {
  errored: boolean = false;
  message = 'Autenticando tu identidad...';
  secondsLeft = 5;
  interval: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    let storedRoute = JSON.parse(localStorage.getItem('currentRoute'));
    let redirectURL: { url: string; queryParams: Record<string, any> } = {
      url: '',
      queryParams: {},
    };

    this.route.queryParams.subscribe(async (params) => {
      const { token, orderId, destinationRoute } = params;

      try {
        const { analizeMagicLink: session } =
          await this.authService.analizeMagicLink(token);

        localStorage.setItem('session-token', session.token);

        redirectURL.url = destinationRoute;
        redirectURL.queryParams = { token };

        this.interval = setInterval(() => {
          if (!this.errored)
            this.message = `Redirigiendo a ${redirectURL.url} en ${this.secondsLeft} segundos...`;

          console.log('Cambiando', this.secondsLeft);

          this.secondsLeft--;

          if (this.secondsLeft === -1) {
            this.router.navigate([redirectURL.url], {
              queryParams: redirectURL.queryParams,
            });
          }
        }, 1000);
      } catch (error) {
        console.error(error);
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }
}
