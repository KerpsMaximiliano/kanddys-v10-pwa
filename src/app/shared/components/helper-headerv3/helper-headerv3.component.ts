import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-helper-headerv3',
  templateUrl: './helper-headerv3.component.html',
  styleUrls: ['./helper-headerv3.component.scss'],
})
export class HelperHeaderv3Component implements OnInit {
  @Input('text') text: string = '';
  @Output('arrowsClick') arrowsClick: EventEmitter<any> = new EventEmitter();
  @Output('dotsClicked') dotsClicked: EventEmitter<any> = new EventEmitter();
  constructor() {}

  ngOnInit(): void {}

  handleClick(): void {
    this.arrowsClick.emit();
  }

  handleClick2(): void {
    this.dotsClicked.emit();
  }
}
