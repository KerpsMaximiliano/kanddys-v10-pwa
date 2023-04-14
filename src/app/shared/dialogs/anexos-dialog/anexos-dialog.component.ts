import { Component, OnInit, Input } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-anexos-dialog',
  templateUrl: './anexos-dialog.component.html',
  styleUrls: ['./anexos-dialog.component.scss'],
})
export class AnexosDialogComponent implements OnInit {
  @Input() options: {
    option: string;
    subOption?: string;
    callback?: () => void | Promise<any>;
  }[];
  @Input() optionsStyle: Record<string, string | number>;
  @Input() activeIndex: number;
  @Input() multipleOption: boolean;
  @Input() optionIndexArray: any[] = [];
  @Input() callBack: () => void | Promise<any>;
  @Input() title: string = 'Preguntas recurrentes en un Slide';
  constructor(private _DialogRef: DialogRef) {}

  ngOnInit(): void {}

  handleValue(e?: any, callback?: () => any) {
    if (callback) callback();
    this._DialogRef.close();
  }
}
