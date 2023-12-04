import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { OrderService } from 'src/app/core/services/order.service';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DialogTemplate {
  title?: string;
  description?: string;
  statusList?: Array<{
    name: string;
    status?: string;
  }>,
  valOrderFinish?: boolean;
  state?: string;
  activeIndex?: number | 0,
  isAdmin?: false,
  orderId?: string,
  buttons: Array<{
    value: string;
    callback: () => void;
    class?: {
      color?: string;
      background?: string;
      fontFamily?: string;
      fontSize?: string;
      border?: string;
    };
    complete?: boolean;
  }>;
  changeStatus: {
    callback: (status: any) => void
  }
}

@Component({
  selector: 'app-progress-dialog',
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.scss']
})
export class ProgressDialogComponent implements OnInit {
  @Output() statusUpdated: EventEmitter<string> = new EventEmitter<string>();
  constructor(
    private orderService: OrderService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate,
    private _bottomSheetRef: MatBottomSheetRef,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
  }

  getProgressSelected(){
    const milestones = this.data.statusList.length;
    console.log("this.data.activeIndex", this.data.activeIndex)
    const progressPercentage = (this.data.activeIndex / (milestones - 1)) * 100;
    return `height: ${progressPercentage}%;`;
  }

  async updateStatus(status: string){
    if(this.data.isAdmin){
      
      let result = await this.orderService.orderSetStatusDelivery(status, this.data.orderId);
      console.log("result", result)
      if(!result){
        this._bottomSheetRef.dismiss();
        this.snackBar.open('No se pudo actualizar el estatus', 'Cerrar', { duration: 3000 });
      }else{
        this._bottomSheetRef.dismiss();
        this.data.changeStatus.callback(status);
      }
    }
  }

  onClick(index: number) {
    this.data.buttons[index].callback();
    this._bottomSheetRef.dismiss();
  }
}