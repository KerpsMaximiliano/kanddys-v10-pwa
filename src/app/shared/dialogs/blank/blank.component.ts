import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-blank',
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.scss'],
})
export class BlankComponent implements OnInit {
  @Input() containerStyles: Record<string, any> = {
    height: '200px',
  };
  @Output() threeClicksDetected = new EventEmitter();
  clickTriggerCounter: number = 0;

  constructor() {}

  ngOnInit(): void {}

  addToCounter() {
    this.clickTriggerCounter++;

    console.log(this.clickTriggerCounter + " clicks")

    if (this.clickTriggerCounter === 3) {
      this.threeClicksDetected.emit(true);
    }
  }
}
