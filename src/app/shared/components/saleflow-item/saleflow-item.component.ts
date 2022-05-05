import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';

@Component({
  selector: 'app-saleflow-item',
  templateUrl: './saleflow-item.component.html',
  styleUrls: ['./saleflow-item.component.scss'],
})
export class SaleflowItemComponent implements OnInit {
  @Input() price: string;
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
  // new
  @Input() imgURL: string;
  @Input() limitScenarios: number;
  @Input() selectable: boolean;
  @Input() isSelected: boolean;

  @Output() changeSelection = new EventEmitter();
  @Output() itemClicked = new EventEmitter();

  toggleSelect(e) {
    //this.isSelected = !this.isSelected
    this.changeSelection.emit({
      item: this.itemExtra,
      isSelected: !this.isSelected,
    });

    // if (this.isSelected) {
    //   this.isSelected = false;
    // } else if (this.currentSelected < this.limitScenarios) {
    //   this.isSelected = true;
    // }
    // this.changeSelection.emit(this.isSelected);
  }

  onClick() {
    this.itemClicked.emit()
  }

  constructor(private router: Router) {}

  ngOnInit(): void {
    // if(this.selecteds.find(selected => selected == this.itemExtra) != undefined){
    //   this.isSelected = true;
    // }
  }

  navigateDetails(): void {
    this.router.navigate([
      '/ecommerce/scenario-details/' + this.itemExtra._id,
      // { index1: this.index1, index2: this.index2, index3: this.index3 },
      { idProduct: this.itemExtra.idProduct },
    ]);
  }
}
