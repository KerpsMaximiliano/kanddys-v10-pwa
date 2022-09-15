import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ItemParam } from 'src/app/core/models/item';

@Component({
  selector: 'app-saleflow-item',
  templateUrl: './saleflow-item.component.html',
  styleUrls: ['./saleflow-item.component.scss'],
})
export class SaleflowItemComponent implements OnInit {
  @Input() price: number;
  @Input() quantity: number;
  @Input() priceAlign: string = 'center';
  @Input() shaded: boolean = false;
  @Input() borderRadius: boolean = true;
  @Input() currentSelected: number;
  @Input() goToDetailsUrlId: string;
  @Input() index1: number;
  @Input() index2: number;
  @Input() index3: number;
  @Input() selecteds: [];
  @Input() itemExtra: any;
  @Input() type: 1 | 2 | 3 | 4 = 1;
  @Input() description: string;
  @Input() showPrice: boolean;
  @Input() showDescription: boolean;
  @Input() income: number;
  // new
  @Input() imgURL: string;
  @Input() name: string;
  @Input() limitScenarios: number;
  @Input() selectable: boolean;
  @Input() isSelected: boolean;
  @Input() showSelected: boolean;
  @Input() showBox: boolean;
  @Input() boxAmount: number;
  @Input() showIcon: boolean;
  @Input() displaying: boolean;
  @Input() inactive: boolean;
  @Input() itemParams: ItemParam[];
  @Input() big: boolean = false;
  @Input() backgroundSize: 'cover' | 'contain' = 'cover';
  @Input() icon: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    color?: string;
    cursor?: boolean;
  };
  @Input() icon2: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    color?: string;
    cursor?: boolean;
  };
  @Input() responsiveWidthVersion: boolean = false;
  @Input() itemId: string | number = null;
  @Input() itemIndex: number = null;
  @Input() dynamicStyles: {
    itemContainer?: Record<string, string | number>;
    simpleCard?: Record<string, string | number>;
    itemImg?: Record<string, string | number>;
    infoArea?: Record<string, string | number>;
  } = null;

  @Output() changeSelection = new EventEmitter();
  @Output() itemClicked = new EventEmitter();
  @Output() onItemSelectionClick = new EventEmitter();
  @Output() iconClicked = new EventEmitter();
  @Output() iconTwoClicked = new EventEmitter();
  @Output() action = new EventEmitter();

  env: string = environment.assetsUrl;

  toggleSelect(e) {
    if (!this.itemId && !this.itemIndex) {
      this.changeSelection.emit({
        item: this.itemExtra,
        isSelected: !this.isSelected,
      });
    } else {
      this.onItemSelectionClick.emit({
        id: this.itemId,
        index: this.itemIndex,
        selected: !this.isSelected,
      });
    }
  }

  onClick() {
    this.itemClicked.emit();
  }

  actionator(event) {
    this.action.emit(event);
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (this.itemParams?.length) {
      let lowest = 0;
      this.itemParams.forEach((params) => {
        params.values.forEach((values) => {
          if (lowest === 0) lowest = values.price;
          if (values.price < lowest) lowest = values.price;
        });
      });
      this.price = this.price + lowest;
    }
  }

  navigateDetails(): void {
    this.router.navigate([
      '/ecommerce/scenario-details/' + this.itemExtra._id,
      { idProduct: this.itemExtra.idProduct },
    ]);
  }

  spreadOperator(object1: Record<string, any>, object2: Record<string, any>) {
    return { ...object1, ...object2 };
  }

  onTopBoxClick() {
    // DoSomething
  }

  onBottomBoxClick() {
    // DoSomething
  }

  onIconClick() {
    // DoSomething
  }
}
