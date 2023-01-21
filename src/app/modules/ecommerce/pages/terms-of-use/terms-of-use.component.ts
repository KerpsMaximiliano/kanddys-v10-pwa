import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { environment } from 'src/environments/environment';
import { marked } from 'marked';

@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TermsOfUseComponent implements OnInit {
  description: string;
  numeration = [];
  env: string = environment.assetsUrl;
  parsedMarkdown: string;
  titlesObject = {
    refund: 'Políticas de reembolsos',
    'delivery-politics': 'Políticas de entregas',
    security: 'Políticas de seguridad',
    privacy: 'Políticas de privacidad',
  };
  title: string = 'Titulo';

  constructor(
    private _MerchantsService: MerchantsService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    public _HeaderService: HeaderService
  ) {}

  ngOnInit(): void {
    this._ActivatedRoute.params.subscribe(async ({ viewsMerchantId }) => {
      (async () => {
        const { description, numeration, type } =
          (await this._MerchantsService.viewsMerchant(viewsMerchantId)) || {
            description: '',
            numeration: [],
          };
        this.title = this.titlesObject[type];
        this.description = description;

        const markedjs = marked.setOptions({});
        this.parsedMarkdown = markedjs.parse(this.description);
      })();
    });
  }

  goBack() {
    const flowRoute = this._HeaderService.flowRoute
      ? this._HeaderService.flowRoute
      : localStorage.getItem('flowRoute');

    if (flowRoute && flowRoute.length > 0) {
      const [baseRoute, paramsString] = flowRoute.split('?');
      const paramsArray = paramsString ? paramsString.split('&') : [];
      const queryParams = {};

      paramsArray.forEach((param) => {
        const [key, value] = param.split('=');

        queryParams[key] = value;
      });

      console.log(queryParams, baseRoute);

      localStorage.removeItem('flowRoute');
      this._Router.navigate([baseRoute], {
        queryParams,
      });
    }
  }
}
