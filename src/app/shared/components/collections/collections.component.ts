import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss']
})
export class CollectionsComponent implements OnInit {
  image: string | SafeStyle = '';
  environment: string = environment.assetsUrl;
  merchantName:string = '';
  tags:Tag[] | any;

  constructor(
    private _MerchantsService: MerchantsService,
    private _TagsService: TagsService,
    private _DomSanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    (async () => {
      const { _id, name:merchantName, image, ...merchant } = await this._MerchantsService.merchantDefault();
      this.merchantName = merchantName;
      const pagination:PaginationInput = {
        options:{
          limit: 50
        }
      }
      const { tagsByMerchant } = await this._TagsService.tagsByMerchant(_id);
      this.image = this._DomSanitizer.bypassSecurityTrustStyle(`url(${image}) no-repeat center center / cover #e9e371`);
      this.tags = tagsByMerchant;
    })();
  }
}