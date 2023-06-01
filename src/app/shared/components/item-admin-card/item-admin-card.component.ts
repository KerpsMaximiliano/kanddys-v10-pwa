import { Component, OnInit,Input } from '@angular/core';
import { Item } from 'src/app/core/models/item';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-item-admin-card',
  templateUrl: './item-admin-card.component.html',
  styleUrls: ['./item-admin-card.component.scss'],
})
export class ItemAdminCardComponent implements OnInit {
  environment: string = environment.assetsUrl;
  @Input() item: Item = null;
  @Input() unitSalesCounter: number = 0;

  constructor() {}

  ngOnInit(): void {}

  openDotsDialog() {

  }
}
