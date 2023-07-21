import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';


export interface DialogTemplate {
  title: string;
  rightCTA: {
    text: string;
    callback: () => void;
  };
  categories: Array<{
    _id: number;
    name: string;
    selected: boolean;
  }>;
  styles?: Record<string, Record<string, boolean>>;
}

@Component({
  selector: 'app-tag-filtering',
  templateUrl: './tag-filtering.component.html',
  styleUrls: ['./tag-filtering.component.scss'],
})
export class TagFilteringComponent implements OnInit {

  @Output() selectionOutput = new EventEmitter();

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate,
  ) {}

  ngOnInit(): void {}

  select(id) {
    this.data.categories.forEach((e) => {
      if (e._id == id) {
        e.selected = !e.selected;
      }
    });
    this.selectionOutput.emit(this.data.categories);
  }
}
