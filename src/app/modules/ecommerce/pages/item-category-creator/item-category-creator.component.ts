import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemCategory } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-item-category-creator',
  templateUrl: './item-category-creator.component.html',
  styleUrls: ['./item-category-creator.component.scss']
})
export class ItemCategoryCreatorComponent implements OnInit {
  env: string = environment.assetsUrl;
  active: boolean;
  showDescription: boolean;
  name: string;
  description: string;
  merchant: Merchant;
  category: ItemCategory;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private itemsService: ItemsService,
    private authService: AuthService,
    private merchantsService: MerchantsService,
  ) { }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.me();
    if(!user) {
      this.router.navigate([`ecommerce/error-screen/`]);
      return;
    }
    this.merchant = await this.merchantsService.merchantDefault();
    if(!this.merchant) {
      this.router.navigate([`ecommerce/error-screen/`]);
      return;
    }
    this.route.params.subscribe(async params => {
      if(!params || !params.id) return;
      this.category = await this.itemsService.itemCategory(params.id);
      if(!this.category) return;
      this.active = this.category.active;
      this.name = this.category.name;
      this.description = this.category.description;
    })
  }

  goBack() {
    //
  }

  toggleStatus() {
    const status = this.active;
    this.active = !status;
    this.itemsService.updateItemCategory({
      active: !status
    }, this.category._id);
  }

  save() {
    if(this.category) {
      this.itemsService.updateItemCategory({
        merchant: this.category.merchant._id,
        name: this.name,
        description: this.description,
      }, this.category._id);
    } else {
      this.itemsService.createItemCategory({
        merchant: this.merchant._id,
        name: this.name,
        description: this.description
      });
    }
  }

}
