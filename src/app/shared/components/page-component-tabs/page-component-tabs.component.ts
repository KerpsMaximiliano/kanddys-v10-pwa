import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-component-tabs',
  templateUrl: './page-component-tabs.component.html',
  styleUrls: ['./page-component-tabs.component.scss']
})
export class PageComponentTabsComponent implements OnInit {
  @Input() tabsOptions: string[];
  activeTag: number = 0;
  @Output() changeValue = new EventEmitter<string>();
  mouseDown = false;
  startX: any;
  scrollLeft: any;

  constructor() { }

  ngOnInit(): void {
  }

  changeTab(index: number, name: string) {
    this.activeTag = index;
    this.changeValue.emit(name)
  }

  startDragging(e, flag, el) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging(e, flag) {
    this.mouseDown = false;
  }

  moveEvent(e, el) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }
}