import { Component, OnInit, Input } from '@angular/core';
import { Item } from 'src/app/core/models/item';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-item-info',
  templateUrl: './item-info.component.html',
  styleUrls: ['./item-info.component.scss'],
})
export class ItemInfoComponent implements OnInit {
  env: string = environment.assetsUrl;
  @Input() item: Item;

  constructor(private dialogRef: DialogRef) {}

  ngOnInit(): void {}

  close() {
    this.dialogRef.close();
  }
}
