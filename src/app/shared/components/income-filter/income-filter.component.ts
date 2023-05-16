import { Component, OnInit } from '@angular/core';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-income-filter',
  templateUrl: './income-filter.component.html',
  styleUrls: ['./income-filter.component.scss'],
})
export class IncomeFilterComponent implements OnInit {
  filters;

  constructor(public merchantsService: MerchantsService) {}

  ngOnInit(): void {}
}
