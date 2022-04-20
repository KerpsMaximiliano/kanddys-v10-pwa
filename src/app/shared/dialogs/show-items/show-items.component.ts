import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-show-items',
  templateUrl: './show-items.component.html',
  styleUrls: ['./show-items.component.scss']
})
export class ShowItemsComponent implements OnInit {

  constructor(
    private ref: DialogRef,
    private header: HeaderService,
    private router: Router,
    private readonly app: AppService,
  ) { }

  @Input() products: any[] = [];
  @Input() orderFinished: boolean;
  @Input() headerButton: string = 'Ver mas Desayunos';
  @Input() footerButton: string = 'HACER TRANSFERENCIA PARA ORDENAR';
  price: number = 100;

  ngOnInit(): void {
    console.log(this.products);
    if(this.products.length === 0) {
      this.products = this.header.getItemProduct(this.header.saleflow._id);
    } else if(!this.products[0].description) this.products[0].description = "Un conjunto de cosas simples logran lo extraordinario."
  }

  seeAllItems() {
    this.router.navigate([`ecommerce/megaphone-v3/${this.header.saleflow._id}`])
    this.ref.close();
  }

  orderItems() {
    this.router.navigate([`ecommerce/provider-store`])
    this.ref.close();
  }

  deleteItem(i: number) {
    console.log('deleted item: ');
    console.log(this.products[i]._id);
    this.header.removeItem(this.header.saleflow._id, this.products[i]._id);
    this.header.removeItemProduct(this.header.saleflow._id, this.products[i]._id);
    const index = this.products.findIndex(product => product._id === this.products[i]._id);
    if(index >= 0) this.products.splice(index, 1);
    this.app.events.emit({ type: 'deleted-item'});
  }

  close(){
    this.ref.close();
  }

}
