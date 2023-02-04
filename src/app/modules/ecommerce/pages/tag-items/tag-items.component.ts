import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Item } from 'src/app/core/models/item';
import { Tag } from 'src/app/core/models/tags';
import { HeaderService } from 'src/app/core/services/header.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { environment } from 'src/environments/environment';
import { Button } from '../../../../shared/components/general-item/general-item.component';

@Component({
  selector: 'app-tag-items',
  templateUrl: './tag-items.component.html',
  styleUrls: ['./tag-items.component.scss'],
})
export class TagItemsComponent implements OnInit {
  @Input() image: string | SafeStyle = '';
  environment: string = environment.assetsUrl;
  slug: string;

  items: Item[] = [];
  optionsButton: Array<Button> = [];
  sub: Subscription;
  name: string;
  notes: string;
  merchantName: string = '';
  needsDescription: boolean;
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';

  constructor(
    public _DomSanitizer: DomSanitizer,
    private _ActivatedRoute: ActivatedRoute,
    private _TagsService: TagsService,
    private _Router: Router,
    public headerService: HeaderService
  ) {}

  async ngOnInit() {
    this._ActivatedRoute.params.subscribe(({ tagId }) => {
      const path: string = 'collections';
      const needsDescription = this._Router.url.split('/').includes(path);
      this.needsDescription = needsDescription;
      (async () => {
        this.status = 'loading';
        const { tag }: { tag: Tag } = await this._TagsService.tag(tagId);
        const { name, notes } = tag;
        this.name = name;
        this.notes = notes;
        if (needsDescription && !notes)
          this._Router.navigate([this._Router.url.replace(path, 'categories')]);
        const { merchant } = this.headerService.saleflow;
        this.slug = merchant.slug;
        this.merchantName = merchant.name;
        this.items = await this._TagsService.itemsByTag(name);
        this.image = this._DomSanitizer.bypassSecurityTrustStyle(
          `url(${merchant.image}) no-repeat center center / cover #e9e371`
        );
        this.status = 'complete';
      })();
    });
  }
}
