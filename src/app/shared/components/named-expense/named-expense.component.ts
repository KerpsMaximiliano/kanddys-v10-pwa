import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-named-expense',
  templateUrl: './named-expense.component.html',
  styleUrls: ['./named-expense.component.scss'],
})
export class NamedExpenseComponent implements OnInit {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() pricing: number;
  @Input() shadow = false;
  @Input() showIcon = true;
  @Output() onDelete = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
