import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-titled-expense',
  templateUrl: './titled-expense.component.html',
  styleUrls: ['./titled-expense.component.scss'],
})
export class TitledExpenseComponent implements OnInit {
  @Input() month: string;
  @Input() percentage: number;
  @Input() amount: number;

  constructor() {}

  ngOnInit(): void {}
}
