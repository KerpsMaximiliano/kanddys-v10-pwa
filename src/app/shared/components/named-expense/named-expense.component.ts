import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-named-expense',
  templateUrl: './named-expense.component.html',
  styleUrls: ['./named-expense.component.scss'],
})
export class NamedExpenseComponent {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() pricing: number;
  @Input() totalOrder: number = 0;
  @Input() showIcon: boolean = false;
  @Input() isPrincipal: boolean = false;
  @Output() onModifyTitle = new EventEmitter();
  @Output() onModifyPrice = new EventEmitter();

  outflowFormData: FormGroup;

  constructor() { }

  modifyTitle() {
    this.onModifyTitle.emit()
  }

  modifyPrice() {
    this.onModifyPrice.emit()
  }
}
