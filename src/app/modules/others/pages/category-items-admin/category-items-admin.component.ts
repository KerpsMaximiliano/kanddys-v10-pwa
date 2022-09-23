import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Item, ItemCategory } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment'

@Component({
	selector: 'app-category-items-admin',
	templateUrl: './category-items-admin.component.html',
	styleUrls: ['./category-items-admin.component.scss']
})
export class CategoryItemsAdminComponent implements OnInit {
	tabs: string[] = ['item']
	env: string = environment.assetsUrl;
	category: ItemCategory;
	items: Item[] = [];
	ordersTotal: {
    total: number,
    length: number
  };

	constructor(
		private route: ActivatedRoute,
		private itemsService: ItemsService,
		private orderService: OrderService,
	) { }

	ngOnInit(): void {
		this.route.params.subscribe(async (params) => {
			this.items = await this.itemsService.itemsByCategory(
				params.categoryId,
				{
          // options: {
          //   limit: 100,
          // },
        },
			);
			this.category = this.items[0].category.find((category) => category._id === params.categoryId);
			// Endpoint bugged, por terminar
			// this.ordersTotal = await this.orderService.ordersTotal(['completed', 'in progress', 'to confirm']);
		})
	}

}
