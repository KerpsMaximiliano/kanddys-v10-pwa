import { Component, OnInit, Inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { OrderStatusDeliveryType } from 'src/app/core/models/order';

export interface DialogTemplate {
  username: string;
  message: string;
  link: string;
  deliveryStatus: OrderStatusDeliveryType;
}

@Component({
  selector: 'app-buyer-notification-dialog',
  templateUrl: './buyer-notification-dialog.component.html',
  styleUrls: ['./buyer-notification-dialog.component.scss'],
})
export class BuyerNotificationDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate,
    private _bottomSheetRef: MatBottomSheetRef,
    public router: Router
  ) {}

  ngOnInit(): void {}

  editNotif() {
    this.router.navigate(['/admin/create-notification'], {
      queryParams: {
        redirectTo: this.router.url,
        type: this.data.deliveryStatus ? 'status' : 'payment',
        status: this.data.deliveryStatus,
      },
    });
    this.close();
  }

  close() {
    this._bottomSheetRef.dismiss();
  }
}
