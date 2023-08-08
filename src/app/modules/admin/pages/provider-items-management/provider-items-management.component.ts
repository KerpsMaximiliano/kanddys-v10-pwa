import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { ItemsService } from 'src/app/core/services/items.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-provider-items-management',
  templateUrl: './provider-items-management.component.html',
  styleUrls: ['./provider-items-management.component.scss'],
})
export class ProviderItemsManagementComponent implements OnInit {
  URI: string = environment.uri;
  assetsURL: string = environment.assetsUrl;
  drawerOpened: boolean = false;
  items: Array<Item> = [];

  constructor(private itemsService: ItemsService, private router: Router) {}

  async ngOnInit() {
    const pagination: PaginationInput = {
      findBy: {
        type: 'supplier',
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: -1,
        page: 1,
      },
    };

    this.items = (await this.itemsService.listItems(pagination))?.listItems;
    this.items = this.items.filter((item) => !item.parentItem);

    this.items.forEach((item, itemIndex) => {
      item.images.forEach((image) => {
        if (!image.value.includes('http'))
          image.value = 'https://' + image.value;
      });

      this.items[itemIndex].images = item.images;
    });
  }

  redirectToItemEdition(item: Item) {
    this.router.navigate(['/ecommerce/item-management/', item._id]);
  }

  addProviderItem() {
    this.router.navigate(['/ecommerce/inventory-creator']);
  }
}
