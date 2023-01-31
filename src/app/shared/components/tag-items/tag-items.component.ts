import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { timeStamp } from 'console';
import { Subscription } from 'rxjs';
import { Tag } from 'src/app/core/models/tags';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
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

  items: Array<any> = [];
  optionsButton: Array<Button> = [];
  sub: Subscription;
  name:string;
  merchantName:string;

  constructor(
    private _DomSanitizer: DomSanitizer,
    private _ActivatedRoute: ActivatedRoute,
    private _TagsService: TagsService,
    public _MerchantsService: MerchantsService,
  ) {}

  async ngOnInit() {
    this.sub = this._ActivatedRoute.params.subscribe(({ tagId }) => {
      (async () => {
        const { name:merchantName } = await this._MerchantsService.merchantDefault();
        this.merchantName = merchantName;
        const { tag } = await this._TagsService.tag(tagId);
        const { name } = tag;
        this.name = name;
        this.items = await this._TagsService.itemsByTag(name);
        this.image = this._DomSanitizer.bypassSecurityTrustStyle(`url(${this.image}) no-repeat center center / cover #e9e371`);
      })();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
