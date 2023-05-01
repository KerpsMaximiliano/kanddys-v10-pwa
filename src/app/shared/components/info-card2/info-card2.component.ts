import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-info-card2',
  templateUrl: './info-card2.component.html',
  styleUrls: ['./info-card2.component.scss'],
})
export class InfoCard2Component implements OnInit {
  env: string = environment.assetsUrl;

  @Input() kioskoView: boolean = false;
  @Input() cards = [];
  @Input() options = [];
  @Input() isOptions: boolean = true;
  @Output() emitIndex = new EventEmitter<any>();

  clickedIndex: number;

  constructor() {}

  ngOnInit(): void {}

  sendIndex(index: number) {
    console.log(index);
    this.clickedIndex = index;
    this.emitIndex.emit(this.clickedIndex);
  }
}
