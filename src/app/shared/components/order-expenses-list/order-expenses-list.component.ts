import { Component, OnInit, Input } from '@angular/core';

export interface ExpenditureList {
  date?: string;
  type: 'egreso' | 'ingreso';
  amount: number;
  name: string;
}

@Component({
  selector: 'app-order-expenses-list',
  templateUrl: './order-expenses-list.component.html',
  styleUrls: ['./order-expenses-list.component.scss'],
})
export class OrderExpensesListComponent implements OnInit {
  @Input() buyer: string;
  @Input() image: string;
  @Input() percentage: number;
  @Input() total: number;
  @Input() list: ExpenditureList[];

  constructor() {}

  ngOnInit(): void {}
}
