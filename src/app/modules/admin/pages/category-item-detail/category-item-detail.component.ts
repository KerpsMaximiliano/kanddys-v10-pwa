import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment'
import { ActivatedRoute, Route } from '@angular/router';
import { Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Item, ItemCategory, ItemCategoryHeadline, ItemCategoryInput, ItemInput, ItemPackage } from 'src/app/core/models/item';
import { Location } from '@angular/common';

@Component({
  selector: 'app-category-item-detail',
  templateUrl: './category-item-detail.component.html',
  styleUrls: ['./category-item-detail.component.scss']
})
export class CategoryItemDetailComponent implements OnInit {
  imgUrl: string = 'https://i.imgur.com/SufVLiV.jpeg';
  categoryList: string[] = ['', '', '', '']
  env: string = environment.assetsUrl;
  item: Item = null;
  merchantCategories: ItemCategory[] = null;
  itemCategories: Record<string, boolean> = {};
  loggedIn: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private itemsService: ItemsService,
    private merchantsService: MerchantsService,
    private router: Router,
    private authService: AuthService,
    private location: Location,
    private headerService: HeaderService
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(async routeParams => {
      const { itemId } = routeParams;

      if (localStorage.getItem('session-token')) {
        const data = await this.authService.me()
        if (data) this.loggedIn = true;
      }

      if (this.loggedIn) {
        const merchantDefault = await this.merchantsService.merchantDefault();

        this.item = await this.itemsService.item(itemId);

        if(!this.item.category || !Array.isArray(this.item.category)) 
          this.item.category = [];

        this.item.category.forEach(category => {
          this.itemCategories[category._id] = true;
        });

        const { itemCategoriesList } = await this.itemsService.itemCategories(merchantDefault._id, { options: { limit: 1000 } });
        this.merchantCategories = itemCategoriesList;
      } else {
        this.router.navigate(['/']);
      }
    })
  }

  async addOrRemoveCategory(category: ItemCategory, isCategoryAssociatedToThisItem: boolean) {
    let newItemCategories;

    if (isCategoryAssociatedToThisItem) {
      newItemCategories = Object.keys(this.itemCategories).filter(itemId => itemId !== category._id);

      Object.keys(this.itemCategories).forEach(itemCategory => {
        if (!newItemCategories.includes(itemCategory)) delete this.itemCategories[itemCategory];
      })
    } else {
      newItemCategories = Object.keys(this.itemCategories);
      newItemCategories.push(category._id);

      this.itemCategories[category._id] = true;
    }

    console.log(this.itemCategories, newItemCategories)

    await this.itemsService.updateItem({
      category: newItemCategories
    }, this.item._id);
  }

  redirect() {
    this.location.back();
  }

  redirectToItemCreator = () => {
    this.headerService.flowRoute = this.router.url;
    this.router.navigate([`admin/create-item/${this.item._id}`]);
  }

  toData(){
    this.router.navigate([`others/data-list/${this.item._id}`],{ queryParams: {viewtype: "merchant", mode: "category"} });
  }
}
