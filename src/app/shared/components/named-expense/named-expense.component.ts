import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { FormComponent } from '../../dialogs/form/form.component';
import { MatDialog } from '@angular/material/dialog';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-named-expense',
  templateUrl: './named-expense.component.html',
  styleUrls: ['./named-expense.component.scss'],
})
export class NamedExpenseComponent implements OnInit {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() pricing: number;
  @Input() totalOrder: number = 0;
  @Input() showIcon = false;
  @Output() onModifyTitle = new EventEmitter();
  @Output() onModifyPrice = new EventEmitter();

  outflowFormData: FormGroup;

  constructor() { }

  ngOnInit(): void { }

  modifyTitle() {
    this.onModifyTitle.emit()
  }

  modifyPrice() {
    this.onModifyPrice.emit()
  }
}
