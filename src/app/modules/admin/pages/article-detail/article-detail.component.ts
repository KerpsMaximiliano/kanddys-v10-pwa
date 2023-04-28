import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { completeImageURL } from 'src/app/core/helpers/strings.helpers';
import { SlideInput } from 'src/app/core/models/post';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { ItemsService } from 'src/app/core/services/items.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
})
export class ArticleDetailComponent implements OnInit {
  description = 'Lavado por fuera, aspiradora por dentro y brillo en las gomas';
  env: string = environment.assetsUrl;
  itemId:any ='';
  slides: SlideInput[];
  item:any = {}
  loadingSlides = true;
  option = 'facturas';
  id = "ID"
  totalItems = 0;
  totalPrice = 0;

  menuOptions = [

  ];
  constructor(  private _ItemsService: ItemsService,
                private _OrderService : OrderService,    
                private _Router: Router,
                private _Route: ActivatedRoute) {}

  async ngOnInit() {
    this.itemId = this._Route.snapshot.paramMap.get('articleId');
    await this.getItem();
    // this.getOrdersByItem();
    await this.getTotalByItem();
  }

  async getItem(){
    let item = await  this._ItemsService.item(this.itemId);
    this.item = item;
   console.log(this.item);
  this.slides = item.images
  .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
  .map(({ index, ...image }) => {
    return {
      url: image.value,
      index,
      type: 'poster',
      text: '',
    };
  });
  this.loadingSlides = false;
  }

  async getOrdersByItem(){
    const articleId = this.itemId;
    const pagination: PaginationInput = {
      // options: {
      //   sortBy: `${this.paginationSortByField}:${this.paginationSortByDirection}`,
      //   limit: Number(this.paginationState.pageSize),
      //   page: this.paginationState.page,
      // },
      findBy: {
        orderStatus:
          this.option === 'facturas'
            ? ['in progress', 'to confirm', 'completed']
            : ['draft'],
        article: articleId,
      },
    };
    let orders = await this._OrderService.ordersByItem(pagination);
    console.log(orders);
  }

  async getTotalByItem(){
    var result =  await this._ItemsService.totalByItem(this.item.merchant._id);
  this.totalItems = result.reduce((acc, curr) => acc + curr.itemUnits, 0);
  this.totalPrice = result.reduce((acc, curr) => acc + curr.total, 0);
  }
}
