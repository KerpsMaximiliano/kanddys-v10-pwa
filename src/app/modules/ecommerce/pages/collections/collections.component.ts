import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Tag } from 'src/app/core/models/tags';
import { HeaderService } from 'src/app/core/services/header.service';
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
  tags: Tag[];
  description: string;
  needsDescription: boolean;
  slug: string;
  title: string = '';

  constructor(
    private _TagsService: TagsService,
    private _DomSanitizer: DomSanitizer,
    private _Router: Router,
    private headerService: HeaderService
  ) {}

  ngOnInit(): void {
    (async () => {
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
      this.image = this._DomSanitizer.bypassSecurityTrustStyle(
        `url(${merchant.image}) no-repeat center center / cover #e9e371`
      );
      this.tags = tagsList
        .map((tags) => tags)
        .filter((tag) => (this.needsDescription ? tag.notes : !tag.notes));
    })();
  }
}
