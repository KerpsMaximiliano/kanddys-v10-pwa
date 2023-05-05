import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.scss']
})
export class IncomesComponent implements OnInit {
  env: string = environment.assetsUrl;
  incomes: any = [];
  merchant:any = {}
  total = 0;
  constructor() { }

  ngOnInit(): void {
  }

}
