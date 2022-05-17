import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-redirections',
  templateUrl: './redirections.component.html',
  styleUrls: ['./redirections.component.scss'],
})
export class RedirectionsComponent implements OnInit {
  errored: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private header: HeaderService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    let storedRoute = JSON.parse(localStorage.getItem('currentRoute'));
    let redirectURL: { url: string; queryParams: Record<string, any> } = {
      url: '',
      queryParams: {},
    };

    if (localStorage.getItem('session-token')) {
      if (!this.header.user) {
        let sub = this.appService.events
          .pipe(filter((e) => e.type === 'auth')) 
          .subscribe((e) => {
            this.afterLoaderProcesses(redirectURL);

            sub.unsubscribe();
          });
      } else this.afterLoaderProcesses(redirectURL);
    } else this.afterLoaderProcesses(redirectURL);
  }

  afterLoaderProcesses(redirectURL: {
    url: string;
    queryParams: Record<string, any>;
  }) {
    lockUI();

    this.route.queryParams.subscribe(async (params) => {
      const { token, destinationRoute } = params;

      try {
        const { analizeMagicLink: session } =
          await this.authService.analizeMagicLink(token);

        localStorage.setItem('session-token', session.token);

        redirectURL.url = destinationRoute;
        redirectURL.queryParams = { token };

        unlockUI();

        this.router.navigate([redirectURL.url], {
          queryParams: redirectURL.queryParams,
        });
      } catch (error) {
        console.error(error);
      }
    });
  }
}
