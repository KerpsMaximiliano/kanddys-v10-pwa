import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Tag } from 'src/app/core/models/tags';
import { HeaderService } from 'src/app/core/services/header.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { environment } from 'src/environments/environment';

interface ExtendedTag extends Tag {
  priceMin?: number;
  priceMax?: number;
}

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
})
export class CollectionsComponent implements OnInit {
  URI: string = environment.uri;
  environment: string = environment.assetsUrl;
  merchantName: string = '';
  tags: ExtendedTag[];
  description: string;
  needsDescription: boolean;
  slug: string;
  title: string = '';
  link: string;
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';

  constructor(
    private _TagsService: TagsService,
    public _DomSanitizer: DomSanitizer,
    private _Router: Router,
    public headerService: HeaderService
  ) {}

  ngOnInit(): void {
    (async () => {
      this.status = 'loading';
      const dict = {
        collections: 'Colecciones',
        categories: 'Categorías',
      };
      const list = this._Router.url.split('/');
      const path: string = 'collections';
      this.title = dict[list[list.length - 1]];
      const needsDescription = list.includes(path);
      this.needsDescription = needsDescription;
      const { merchant } = this.headerService.saleflow;
      this.slug = merchant.slug;
      this.merchantName = merchant.name;
      // const tagsByMerchant = await this._TagsService.tagsByMerchant(
      //   merchant._id
      // );
      const { tags: tagsList } = await this._TagsService.tags({
        findBy: {
          entity: 'item',
          status: 'active',
          user: this.headerService.saleflow.merchant.owner._id,
        },
        options: {
          limit: -1,
        },
      });
      let tagsItemPrices = await this._TagsService.itemTagRangePrice({
        options: {
          limit: -1,
          sortBy: 'priceMax.price:desc',
        },
      });
      this.tags = tagsList
        .map((tags) => tags)
        .filter((tag) => (this.needsDescription ? tag.notes : !tag.notes));
      tagsItemPrices = tagsItemPrices.filter((tagPrices) =>
        this.tags.some((tag) => tag._id === tagPrices.tag)
      );
      this.tags = this.tags.map((tag: ExtendedTag) => {
        const tagPrices = tagsItemPrices.find(
          (tagPrice) => tagPrice.tag === tag._id
        );
        if (tagPrices) {
          tag.priceMin = tagPrices.priceMin.price;
          tag.priceMax = tagPrices.priceMax.price;
        }
        return tag;
      });
      this.status = 'complete';
      this.link = `${this.URI}/ecommerce/${this.headerService.saleflow.merchant.slug}/collections`;
    })();
  }
}
