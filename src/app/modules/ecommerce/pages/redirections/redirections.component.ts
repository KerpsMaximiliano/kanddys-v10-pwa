import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { filter } from 'rxjs/operators';
import { analizeMagicLink } from 'src/app/core/graphql/auth.gql';
import { Session } from 'src/app/core/models/session';
import { from } from 'rxjs';
import { Observable } from 'apollo-link';

@Component({
  selector: 'app-redirections',
  templateUrl: './redirections.component.html',
  styleUrls: ['./redirections.component.scss'],
})
export class RedirectionsComponent implements OnInit {
  errored: boolean = false;
  public session: Session;

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
      const { authCode } = params;
      const redirectURL: { url: string; queryParams: Record<string, string> } =
        { url: null, queryParams: {} };

      try {
        const { redirectionRoute } = await this.authService.analizeMagicLink(
          authCode
        );

        if (redirectionRoute.includes('?')) {
          const routeParts = redirectionRoute.split('?');
          const redirectionURL = routeParts[0];
          const routeQueryStrings = routeParts[1]
            .split('&')
            .map((queryString) => {
              const queryStringElements = queryString.split('=');

              return { [queryStringElements[0]]: queryStringElements[1] };
            });

          redirectURL.url = redirectionURL;
          redirectURL.queryParams = {};

          routeQueryStrings.forEach((queryString) => {
            const key = Object.keys(queryString)[0];
            redirectURL.queryParams[key] = queryString[key];
          });

          unlockUI();

          this.router.navigate([redirectURL.url], {
            queryParams: redirectURL.queryParams,
          });
        } else {
          this.router.navigate([redirectionRoute]);

          unlockUI();
        }
      } catch (error) {
        this.router.navigate([`admin/items-dashboards`]);
        unlockUI();
        // console.error(error);
      }
    });
  }
}
