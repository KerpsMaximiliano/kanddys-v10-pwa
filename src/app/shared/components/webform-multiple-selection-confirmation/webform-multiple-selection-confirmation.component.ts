import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-webform-multiple-selection-confirmation',
  templateUrl: './webform-multiple-selection-confirmation.component.html',
  styleUrls: ['./webform-multiple-selection-confirmation.component.scss'],
})
export class WebformMultipleSelectionConfirmationComponent implements OnInit {
  @Input() openResponseOption: boolean = false;
  @Input() singleResponse: boolean = false;
  @Input() optionsCreated: number = 0;
  @Output() editButtonClicked = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  editOptions() {
    this.editButtonClicked.emit(true);
  }
}
