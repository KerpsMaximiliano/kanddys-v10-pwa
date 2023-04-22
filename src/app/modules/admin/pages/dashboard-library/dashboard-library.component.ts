import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { Tag } from 'src/app/core/models/tags';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-dashboard-library',
  templateUrl: './dashboard-library.component.html',
  styleUrls: ['./dashboard-library.component.scss']
})
export class DashboardLibraryComponent implements OnInit {

  environment: string = environment.assetsUrl;

  swiperConfig: SwiperOptions = {
    slidesPerView: 4,
    freeMode: true,
    spaceBetween: 1,
  };

  merchant: Merchant;

  tags: Tag[] = [];
  selectedTags: Tag[] = [];

  redirectTo: string = null;
  dataToRequest: 'recent' | 'mostSold' | 'lessSold' = 'recent';

  items: Item[] = [];

  constructor(
    private _MerchantsService: MerchantsService,
    private _ItemsService: ItemsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { redirectTo, data } = queryParams;

      this.redirectTo = redirectTo;
      this.dataToRequest = data;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;
      if (typeof data === 'undefined') this.returnEvent();

      await this.getMerchant();
      await this.getTags();
      await this.getData();
    });
    
  }

  async getMerchant() {
    const result = await this._MerchantsService.merchantDefault()
    this.merchant = result;
  }

  async getTags() {
    const tagsByMerchant = (
      await this._MerchantsService.tagsByMerchant(
        this.merchant._id
      )
    )?.tagsByMerchant;
    this.tags = tagsByMerchant.map((value) => value.tags);
  }

  async getData() {
    switch (this.dataToRequest) {
      case 'recent':
        await this.getOrders();
        break;
      case 'mostSold':
        await this.getMostSoldItems();
        break;
      case 'lessSold':
        await this.getLessSoldItems();
        break;
    }
  }

  async getOrders() {
    try {
      const { ordersByMerchant } = await this._MerchantsService.ordersByMerchant(
        this.merchant._id,
        {
          options: {
            limit: 50,
            sortBy: 'createdAt:desc'
          }
        }
      );

      const itemIds = new Set<string>();

      ordersByMerchant.forEach((order) => {
        order.items.forEach((item) => {
          itemIds.add(item.item._id);
        });
      });

      const filteredItems = Array.from(itemIds);

      const { listItems } = await this._ItemsService.listItems(
        {
          findBy: {
            _id: {
              __in: filteredItems,
            },
          }
        }
      );

      this.items = listItems;

    } catch (error) {
      console.log(error);
    }
  }

  async getMostSoldItems() {
    try {
      const result = await this._ItemsService.bestSellersByMerchant(
        false,
        {
          findBy: {
            merchant: this.merchant._id,
          }
        }
      ) as any[];

      this.items = result.map((item) => item.item).filter((item) => item !== undefined);
      console.log(this.items);
    } catch (error) {
      console.log(error);
    }
  }

  async getLessSoldItems() {
    try {
      const result = await this._ItemsService.bestSellersByMerchant(
        false,
        {
          options: {
            page: 2
          },
          findBy: {
            merchant: this.merchant._id,
          }
        }
      ) as any[];

      this.items = result.map((item) => item.item);
    } catch (error) {
      console.log(error);
    }
  }

  shortenText(text, limit) {
    if (text.length > limit) return text.substring(0, limit) + "..."; 
    else return text;
  }

  filterTag(index: number) {
    const selectedTag = this.tags[index];
    if (this.selectedTags.find((tag) => tag._id === selectedTag._id)) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(selectedTag);
    }
  }

  isTagActive(tag: Tag) {
    return this.selectedTags.find((selectedTag) => selectedTag._id === tag._id);
  }

  returnEvent() {
    let queryParams = {};
    if (this.redirectTo.includes('?')) {
      const url = this.redirectTo.split('?');
      this.redirectTo = url[0];
      const queryParamList = url[1].split('&');
      for (const param in queryParamList) {
        const keyValue = queryParamList[param].split('=');
        queryParams[keyValue[0]] = keyValue[1];
      }
    }
    this.router.navigate([this.redirectTo], {
      queryParams,
    });
  }

}
