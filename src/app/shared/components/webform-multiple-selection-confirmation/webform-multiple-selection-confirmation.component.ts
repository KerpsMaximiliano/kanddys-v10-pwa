import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-webform-multiple-selection-confirmation',
  templateUrl: './webform-multiple-selection-confirmation.component.html',
  styleUrls: ['./webform-multiple-selection-confirmation.component.scss'],
})
export class WebformMultipleSelectionConfirmationComponent implements OnInit {
  @Input() optionsCreated: number = 0;
  @Output() editButtonClicked = new EventEmitter();
  @Output() openResponseButtonClicked = new EventEmitter();
  @Output() singleResponseButtonClicked = new EventEmitter();

  private _openResponseOption = false;
  private _singleResponse = false;

  constructor() {}

  ngOnInit(): void {}

  editOptions() {
    this.editButtonClicked.emit(true);
  }

  @Input()
  set openResponseOption(value: boolean) {
    this._openResponseOption = value;
    this.openResponseButtonClicked.emit(value);
  }

  get openResponseOption() {
    return this._openResponseOption;
  }

  @Input()
  set singleResponseOption(value: boolean) {
    this._singleResponse = value;
    this.singleResponseButtonClicked.emit(value);
  }

  get singleResponseOption() {
    return this._singleResponse;
  }
}
