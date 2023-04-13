import { Component, OnInit, Input } from '@angular/core';

type Callback = (...params) => any;

@Component({
  selector: 'app-compact-card',
  templateUrl: './compact-card.component.html',
  styleUrls: ['./compact-card.component.scss'],
})
export class CompactCardComponent implements OnInit {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() description: string;
  @Input() image: string;
  @Input() price: number;
  @Input() barColor: string = '#82f18d';
  @Input() callback: Callback;
  @Input() callbackParams: Array<any>;

  constructor() {}

  ngOnInit(): void {}

  executeCallback() {
    if(this.callback && this.callbackParams.length) {
      this.callback(...this.callbackParams);
    }
  }
}
