import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ItemsService } from 'src/app/core/services/items.service';

@Component({
  selector: 'app-saleflow-item',
  templateUrl: './saleflow-item.component.html',
  styleUrls: ['./saleflow-item.component.scss'],
})
export class SaleflowItemComponent implements OnInit {
  @Input() price: number;
  @Input() quantity: string;
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
  @Input() type: number = 1
  @Input() description: string
  @Input() showPrice: boolean;
  @Input() showDescription: boolean;
  @Input() income: number;
  // new
  @Input() imgURL: string;
  @Input() limitScenarios: number;
  @Input() selectable: boolean;
  @Input() isSelected: boolean;
  @Input() showBox: boolean;
  @Input() showIcon: boolean;

  @Output() changeSelection = new EventEmitter();
  @Output() itemClicked = new EventEmitter();
  
  env: string = environment.assetsUrl;

  toggleSelect(e) {
    this.changeSelection.emit({
      item: this.itemExtra,
      isSelected: !this.isSelected,
    });
  }

  onClick() {
    this.itemClicked.emit()
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
  }

  navigateDetails(): void {
    this.router.navigate([
      '/ecommerce/scenario-details/' + this.itemExtra._id,
      { idProduct: this.itemExtra.idProduct },
    ]);
  }

  onBoxClick() {
    // DoSomething
  }

  onIconClick() {
    // DoSomething
  }
}
