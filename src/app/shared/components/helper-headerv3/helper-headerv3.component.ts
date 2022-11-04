import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-helper-headerv3',
  templateUrl: './helper-headerv3.component.html',
  styleUrls: ['./helper-headerv3.component.scss'],
})
export class HelperHeaderv3Component implements OnInit {
  @Input('text') text: string = '';
  @Input('containerStyles') containerStyles: Record<string, string | number> =
    null;
  @Output('arrowsClick') arrowsClick: EventEmitter<any> = new EventEmitter();
  @Output('searchClick') searchClick: EventEmitter<any> = new EventEmitter();
  @Output('dotsClicked') dotsClicked: EventEmitter<any> = new EventEmitter();
  @Input('showSearch') showSearch: boolean;
  constructor() {}

  ngOnInit(): void {}

  handleClick(): void {
    this.arrowsClick.emit();
  }

  handleSearch() {
    this.searchClick.emit();
    this.showSearch = false;
  }

  handleClick2(): void {
    this.dotsClicked.emit();
  }
}
