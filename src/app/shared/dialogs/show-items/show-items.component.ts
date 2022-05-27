import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-show-items',
  templateUrl: './show-items.component.html',
  styleUrls: ['./show-items.component.scss'],
})
export class ShowItemsComponent implements OnInit {
  constructor(
    private ref: DialogRef,
    private header: HeaderService,
    private router: Router,
    private readonly app: AppService
  ) {}

  @Input() products: any[] = [];
  @Input() orderFinished: boolean;
  @Input() headerButton: string;
  @Input() footerButton: string = 'CONTINUAR CON LA ORDEN';
  @Input() public headerCallback: () => void;
  @Input() public footerCallback: () => void;
  price: number = 0;
  env: string = environment.assetsUrl;

  ngOnInit(): void {
    if (this.products.length === 0) {
      this.products = this.header.getItems(this.header.saleflow?._id ?? this.header.getSaleflow()?._id);
    }
    if(!this.products) return;
    this.price = this.products.reduce((prev, curr) => {
      const itemPrice = curr.total ?? curr.pricing ?? curr.price;
      return prev + itemPrice;
    }, 0);
  }

  seeAllItems() {
    this.headerCallback();
    this.ref.close();
  }

  orderItems() {
    //this.router.navigate([`ecommerce/provider-store`])
    //this.ref.close();
    this.footerCallback();
    this.ref.close();
  }

  deleteItem(i: number) {
    let deletedID = this.products[i]._id;
    this.header.removeOrderProduct(
      this.header.saleflow?._id || this.header.getSaleflow()?._id,
      this.products[i]._id
    );
    this.header.removeItem(this.header.saleflow?._id || this.header.getSaleflow()?._id, this.products[i]._id);
    const index = this.products.findIndex(
      (product) => product._id === this.products[i]._id
    );
    if (index >= 0) this.products.splice(index, 1);
    this.app.events.emit({ type: 'deleted-item', data: deletedID });

    this.price = this.products.reduce((prev, curr) => {
      const itemPrice = curr.total ?? curr.pricing ?? curr.price;
      return prev + itemPrice;
    }, 0);
  }

  close() {
    this.ref.close();
  }
}
