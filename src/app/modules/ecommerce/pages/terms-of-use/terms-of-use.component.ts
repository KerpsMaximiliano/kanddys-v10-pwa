import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    private _ActivatedRoute: ActivatedRoute
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
}
