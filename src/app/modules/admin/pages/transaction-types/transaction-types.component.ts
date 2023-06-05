import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-transaction-types',
  templateUrl: './transaction-types.component.html',
  styleUrls: ['./transaction-types.component.scss']
})
export class TransactionTypesComponent implements OnInit {

  webformId = '';
  constructor(private activatedRoute:ActivatedRoute) { }

  ngOnInit(): void {
    this.webformId = this.activatedRoute.snapshot.paramMap.get('webformid');
  }

}
