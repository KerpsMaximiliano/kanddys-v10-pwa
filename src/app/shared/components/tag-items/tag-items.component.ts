import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { timeStamp } from 'console';
import { Subscription } from 'rxjs';
import { Tag } from 'src/app/core/models/tags';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { environment } from 'src/environments/environment';
import { Button } from '../general-item/general-item.component';

@Component({
  selector: 'app-tag-items',
  templateUrl: './tag-items.component.html',
  styleUrls: ['./tag-items.component.scss'],
})
export class TagItemsComponent implements OnInit, OnDestroy {
  @Input() image: string | SafeStyle = '';
  environment: string = environment.assetsUrl;
  optional = true;
  slug:string;

  items: Array<any> = [];
  optionsButton: Array<Button> = [];
  sub: Subscription;
  name:string;
  description:string;
  merchantName:string = '';
  needsDescription:boolean;

  constructor(
    private _DomSanitizer: DomSanitizer,
    private _ActivatedRoute: ActivatedRoute,
    private _TagsService: TagsService,
    private _MerchantsService: MerchantsService,
    private _SaleFlowService: SaleFlowService,
    private _Router: Router
  ) {}

  async ngOnInit() {
    this.sub = this._ActivatedRoute.params.subscribe(({ tagId }) => {
      const path:string = 'collections';
      const needsDescription = this._Router.url.split('/').includes(path);
      this.needsDescription = needsDescription;
      (async () => {
        const { tag }:any = await this._TagsService.tag(tagId);
        const { name, description } = tag;
        this.name = name;
        this.description = description;
        if(needsDescription&&!description)
          this._Router.navigate([this._Router.url.replace(path ,'categories')]);
        const { _id, name:merchantName, image } = await this._MerchantsService.merchantDefault();
        const { merchant } = await this._SaleFlowService.saleflowDefault(_id);
        this.slug = merchant.slug;
        this.merchantName = merchantName;
        this.items = (await this._TagsService.itemsByTag(name)).filter(({notes}: any):boolean => this.needsDescription?notes:!notes);
        this.image = this._DomSanitizer.bypassSecurityTrustStyle(`url(${image}) no-repeat center center / cover #e9e371`);
      })();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
