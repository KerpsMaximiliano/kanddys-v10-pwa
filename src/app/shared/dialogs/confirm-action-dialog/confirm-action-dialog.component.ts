import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-confirm-action-dialog',
  templateUrl: './confirm-action-dialog.component.html',
  styleUrls: ['./confirm-action-dialog.component.scss'],
})
export class ConfirmActionDialogComponent implements OnInit {
  @Input() topButtonText: string;
  @Input() bottomButtonText: string;
  @Input() topText: string;
  @Input() topBtnCallback: () => void;
  @Input() bottomBtnCallback: () => void;
  @Output() buttonEvent: EventEmitter<any> = new EventEmitter();
  constructor(private ref: DialogRef) {}

  ngOnInit(): void {}

  close() {
    this.ref.close();
  }

  callbackButton(type: 'top' | 'bottom') {
    if (type === 'bottom') this.bottomBtnCallback();
    if (type === 'top') this.topBtnCallback();
    this.close();
  }
}