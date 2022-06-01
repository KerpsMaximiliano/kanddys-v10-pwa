import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Item, ItemPackage } from 'src/app/core/models/item';
import { environment } from '../../../../environments/environment';
import { HeaderService } from 'src/app/core/services/header.service';
import { ActivatedRoute } from '@angular/router';
import { SaleFlow } from 'src/app/core/models/saleflow';

@Component({
  selector: 'app-package-item',
  templateUrl: './package-item.component.html',
  styleUrls: ['./package-item.component.scss']
})
export class PackageItemComponent implements OnInit {

  @Input() buttonSize: 'normal' | 'small' = 'normal';
  @Input() package: ItemPackage;
  @Input() packageItems: Item;
  @Input() clickAble: boolean;
  @Input() item: Item;
  @Output() action = new EventEmitter();
  @Output() itemClicked = new EventEmitter();
  saleflowData: SaleFlow;
  @Input() inCart: boolean = false;
  env: string = environment.assetsUrl;

  constructor(private headerService: HeaderService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.saleflowData = await this.headerService.fetchSaleflow(params.id);
      if (this.saleflowData) this.inCart = this.itemInCart(this.item);

      if (!this.saleflowData) return new Error(`Saleflow doesn't exist`);
    })
  }

  addToCart(item: Item) {
    this.headerService.storeOrderProduct(this.saleflowData._id, {
      item: item._id,
      amount: 1,
      saleflow: this.saleflowData._id,
    });
    this.headerService.storeItem(this.saleflowData._id, item);
    this.inCart = this.itemInCart(item);

    this.itemClicked.emit(item);
  }

  itemInCart(itemData: Item) {
    const productData = this.headerService.getItems(this.saleflowData._id);
    if (productData && productData.length > 0)
      return productData.some((item) => item._id === itemData._id);
    else return false;
  }
}
