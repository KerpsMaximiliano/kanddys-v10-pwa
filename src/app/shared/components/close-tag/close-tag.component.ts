import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-close-tag',
  templateUrl: './close-tag.component.html',
  styleUrls: ['./close-tag.component.scss'],
})
export class CloseTagComponent implements OnInit {
  @Input() tags: Array<{
    type: string;
    label: string;
  }> = [];
  @Input() tagsID: Array<string> = [];
  @Input() type: number = 1;
  @Output() closeEvent = new EventEmitter();
  @Output() loadingSwiper = new EventEmitter();
  mouseDown = false;
  startX: any;
  scrollLeft: any;
  @Input() hasBookmark: boolean;

  closeTag(tag) {
    this.loadingSwiper.emit(true);
    const deletedname = this.tags.splice(tag, 1);
    const deletedID = this.tagsID.splice(tag, 1);
    const deletedTag = { name: deletedname, id: deletedID };
    this.closeEvent.emit(deletedTag);
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

  constructor() {}

  ngOnInit(): void {
  }
}
