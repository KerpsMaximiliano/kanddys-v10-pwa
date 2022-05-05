import { Component, OnInit, Input, HostListener } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
  query,
  group,
  animateChild,
} from '@angular/animations';
import { HeaderService } from 'src/app/core/services/header.service';
import { Router } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-item-card-amount-and-price',
  templateUrl: './item-card-amount-and-price.component.html',
  styleUrls: ['./item-card-amount-and-price.component.scss'],
  animations: [
    trigger('pageAnimations', [
      state("small", style({
        flexDirection: 'row'
      })),
      state("big", style({
        flexDirection: 'column'
      })),
      transition('* <=> *', [
        group([
          query('@imageAnimation', animateChild()),
          query('@priceAmountAnimation', animateChild()),
          animate('0.5s cubic-bezier(0.55, 0.31, 0.15, 0.93)'),
        ]),
      ]),
    ]),
    trigger('imageAnimation', [
      state("small", style({
        width: '84px',
        height: '88px',
        paddingBottom: '0px'
      })),
      state("big", style({
        width: '100%',
        paddingBottom: '100%'
      })),
      transition('* <=> *', [
        animate('0.5s cubic-bezier(0.55, 0.31, 0.15, 0.93)'),
      ]),
    ]),
    trigger('priceAmountAnimation', [
      state("small", style({
        marginLeft: '20px',
        padding: '10px 0',
      })),
      state("big", style({ 
        marginLeft: 0,
        padding: '10px',
      })),
      transition('* <=> *', [
        animate('0.5s cubic-bezier(0.55, 0.31, 0.15, 0.93)'),
      ]),
    ]),
  ]
})
export class ItemCardAmountAndPriceComponent implements OnInit {
  @HostListener('window:scroll', ['$event']) // for window scroll events
  onHostScroll() {
    if(this.applyAnimations) {
      if(document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
        if(this.animation === 'big') this.animation = 'small';
      } else {
        this.animation = 'big';
      }
    }
  }

  @Input() applyAnimations: boolean = false;
  @Input() itemData: any;
  showTitle: boolean;
  animation: string = 'small';
  price: number;
  currentUrl: string = '';

  constructor(
    public header: HeaderService, private router: Router
  ) { }

  ngOnInit(): void {
    console.log(this.itemData);
    this.price = this.itemData.pricing;
    this.router.events.pipe(distinctUntilChanged()).subscribe(value => {
      this.currentUrl = this.router.url.toString();
    });
  }

  minMax(bool: boolean) {
    //
    if(this.itemData.customizerId) {
      if (bool) this.header.order.products[0].amount += this.itemData.qualityQuantity.quantity;
      else if (this.header.order.products[0].amount !== this.itemData.qualityQuantity.quantity)
        this.header.order.products[0].amount -= this.itemData.qualityQuantity.quantity;
      // this.itemData.total = this.itemData.pricing + this.header.order.products[0].amount * this.itemData.params[0].values[0].price;
      const total = this.itemData.qualityQuantity.price + (this.header.order.products[0].amount * this.itemData.params[0].values[0].price)
      this.itemData.total = total + (total*0.18);
      this.header.emptyItems(this.header.saleflow._id);
      this.header.storeItem(this.header.saleflow._id, this.itemData);
    } else if (bool) {
      if (this.header.order.products[0].amount > 0) {
        this.header.order.products[0].amount = this.header.order.products[0].amount + 1; 
        this.itemData.pricing = this.price * this.header.order.products[0].amount;
      }
    } else {
      if (this.header.order.products[0].amount > 1) {
        this.header.order.products[0].amount = this.header.order.products[0].amount - 1;
        this.itemData.pricing = this.price * this.header.order.products[0].amount;
      }
    }
    this.header.storeAmount(this.header.saleflow._id, this.header.order.products[0].amount);
  }

  toggleAnimation() {
    this.animation = (this.animation === 'small' ? 'big' : 'small');
  }

  onAnimStart(event: any) {
    if(event.toState === 'small' && event.phaseName === 'done') this.showTitle = false;
    if(event.toState === 'big') this.showTitle = true;
  }

}
