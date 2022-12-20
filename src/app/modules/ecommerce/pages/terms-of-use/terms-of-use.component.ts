import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.scss'],
})
export class TermsOfUseComponent implements OnInit {
  description: string;
  numeration = [];
  env: string = environment.assetsUrl;
  constructor(
    private _MerchantsService: MerchantsService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    public _HeaderService: HeaderService
  ) {}

  ngOnInit(): void {
    this._ActivatedRoute.params.subscribe(async ({ viewsMerchantId }) => {
      (async () => {
        const { description, numeration } =
          (await this._MerchantsService.viewsMerchant(viewsMerchantId)) || {
            description: '',
            numeration: [],
          };
        this.description = description;
        this.numeration = numeration;
      })();
    });
  }

  goBack() {
    if (this._HeaderService.flowRoute) {
      this._Router.navigate([this._HeaderService.flowRoute]);
    }
  }
}
