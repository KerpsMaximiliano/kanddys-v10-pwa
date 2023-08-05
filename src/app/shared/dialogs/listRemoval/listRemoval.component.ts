import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { environment } from 'src/environments/environment';

export interface DialogTemplate {
  title: string;
  titleIcon?: {
    show: boolean;
    icon?: string;
  };
  rightCTA?: {
    text: string;
    callback: () => void;
  };
  leftIcon?: {
    iconName: string;
    styles?: Record<string, any>;
    callback: () => void;
  };
  rightIcon?: {
    iconName: string;
    styles?: Record<string, any>;
    callback: () => void;
  };
  categories: Array<{
    _id: string;
    name: string;
    selected: boolean;
  }>;
  styles?: Record<string, Record<string, boolean>>;
}

@Component({
  selector: 'app-listRemoval',
  templateUrl: './listRemoval.component.html',
  styleUrls: ['./listRemoval.component.scss'],
})
export class ListRemoval implements OnInit {
  selectedCategories: string[] = [];
  assetsURL: string = environment.assetsUrl;

  @Output() selectionOutput = new EventEmitter();

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate) {}

  ngOnInit(): void {}

  select(id) {
    this.selectionOutput.emit(id);
  }
}
