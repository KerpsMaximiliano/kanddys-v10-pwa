import { Component, OnInit, Input } from '@angular/core';
import { OrderStatusNameType } from 'src/app/core/models/order';
import { environment } from 'src/environments/environment';

export interface ItemStatus {
  id: string;
  title: string;
  description?: string;
  description2?: string;
  subtitle?: string;
  image?: string;
  eventImage?: () => void;
  status?: OrderStatusNameType;
  statusCallback?: () => void,
}

@Component({
  selector: 'app-item-status',
  templateUrl: './item-status.component.html',
  styleUrls: ['./item-status.component.scss']
})
export class ItemStatusComponent implements OnInit {
  @Input() itemListContent: ItemStatus;
  env: string = environment.assetsUrl;

  constructor() { }

  ngOnInit(): void {
  }

}
