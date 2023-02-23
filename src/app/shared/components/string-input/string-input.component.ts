import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-string-input',
  templateUrl: './string-input.component.html',
  styleUrls: ['./string-input.component.scss'],
})
export class StringInputComponent implements OnInit {
  inputFocused = false;
  @Input() inputValue: string = '';
  @Input() disabled: boolean = false;
  @Input() type: string = 'text';
  @Input() placeholder: string = 'Escribe';
  @Input() initialValue: string;
  @Input() inputLabel: string;
  @Input() inputId: string = 'name';
  @Input() inputName: string = 'name';
  @Input() innerLabel: string;
  @Input() required: boolean = true;
  @Output() onInputEvent = new EventEmitter<string>();

  inputText: string;

  constructor() {}

  ngOnInit(): void {}

  changeText() {
    this.onInputEvent.emit(this.inputText);
  }
}
