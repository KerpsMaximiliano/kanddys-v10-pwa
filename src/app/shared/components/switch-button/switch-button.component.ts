import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-switch-button',
  templateUrl: './switch-button.component.html',
  styleUrls: ['./switch-button.component.scss']
})
export class SwitchButtonComponent implements OnInit {
  @Input() containerStyles?: Record<string, any> = null;
  @Input() textStyles?: Record<string, any> = null;
  @Input() settings?: {
    position?: string,
    top?: string,
    right?: string,
    bottom?: string,
    left?: string,
    margin?: string,
    leftText?: string,
  };
  @Output() switched = new EventEmitter();
  @Input() isClicked : boolean;
  @Input() innerText : boolean;
  constructor() { }

  ngOnInit(): void {
  }

  statechanger(){
    this.isClicked = !this.isClicked;
    this.switched.emit(this.isClicked);
  }

}
