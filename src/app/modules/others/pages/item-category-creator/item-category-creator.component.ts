import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemCategory } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { Tag } from 'src/app/core/models/tags';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-item-category-creator',
  templateUrl: './item-category-creator.component.html',
  styleUrls: ['./item-category-creator.component.scss'],
})
export class TagCategoryCreatorComponent implements OnInit {
  env: string = environment.assetsUrl;
  active: boolean;
  showDescription: boolean;
  name: string;
  description: string;
  merchant: Merchant;
  category: ItemCategory;
  tag: Tag;
  mode: 'category' | 'tag';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private itemsService: ItemsService,
    private tagsService: TagsService,
    private authService: AuthService,
    private merchantsService: MerchantsService
  ) {}

  async ngOnInit(): Promise<void> {
    const user = await this.authService.me();
    if (!user) {
      this.router.navigate([`others/error-screen/`]);
      return;
    }
    this.merchant = await this.merchantsService.merchantDefault();
    if (!this.merchant) {
      this.router.navigate([`others/error-screen/`]);
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (this.router.url.includes('category-creator')) {
      this.mode = 'category';
      if (!id) return;
      this.category = await this.itemsService.itemCategory(id);
      if (!this.category) return;
      this.active = this.category.active;
      this.name = this.category.name;
      this.description = this.category.description;
    }
    if (this.router.url.includes('tag-creator')) {
      this.mode = 'tag';
      if (!id) return;
      this.tag = (await this.tagsService.tag(id)).tag;
      if (!this.tag) return;
      this.name = this.tag.name;
      // this.description = this.tag.messageNotify;
    }
  }

  goBack() {
    //
  }

  toggleStatus() {
    const status = this.active;
    this.active = !status;
    this.itemsService.updateItemCategory(
      {
        active: !status,
      },
      this.category._id
    );
  }

  save() {
    if (this.mode === 'category') {
      if (this.category) {
        this.itemsService.updateItemCategory(
          {
            merchant: this.category.merchant._id,
            name: this.name,
            description: this.description,
          },
          this.category._id
        );
      } else {
        this.itemsService.createItemCategory({
          merchant: this.merchant._id,
          name: this.name,
          description: this.description,
        });
      }
    }
    if (this.mode === 'tag') {
      // if (this.tag) {
      //   this.tagsService.updateTag(
      //     {
      //       name: this.name,
      //       messageNotify: this.description,
      //     },
      //     this.tag._id
      //   );
      // } else {
      //   this.tagsService.createTag({
      //     name: this.name,
      //     messageNotify: this.description,
      //   });
      // }
    }
  }
}
