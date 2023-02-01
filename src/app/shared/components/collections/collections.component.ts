import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
})
export class CollectionsComponent implements OnInit {
  image: string | SafeStyle = '';
  environment: string = environment.assetsUrl;
  merchantName: string = '';
  tags: Tag[] | any;
  description: string;
  needsDescription: boolean;
  slug: string;

  constructor(
    private _MerchantsService: MerchantsService,
    private _TagsService: TagsService,
    private _DomSanitizer: DomSanitizer,
    private _SaleFlowService: SaleFlowService,
    private _Router: Router
  ) {}

  ngOnInit(): void {
    (async () => {
      const path: string = 'collections';
      const needsDescription = this._Router.url.split('/').includes(path);
      this.needsDescription = needsDescription;
      const {
        _id,
        name: merchantName,
        image,
      } = await this._MerchantsService.merchantDefault();
      const { merchant } = await this._SaleFlowService.saleflowDefault(_id);
      this.slug = merchant.slug;
      this.merchantName = merchantName;
      const tagsByMerchant = await this._TagsService.tagsByMerchant(
        _id
      );
      this.image = this._DomSanitizer.bypassSecurityTrustStyle(
        `url(${image}) no-repeat center center / cover #e9e371`
      );
      this.tags = tagsByMerchant.filter(({ tags: tag }) =>
        this.needsDescription ? tag.notes : !tag.notes
      );
    })();
  }
}
