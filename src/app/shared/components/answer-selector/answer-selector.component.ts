import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface AnswerIcon {
  src: string;
  styles?: Record<string, any>; 
  callback(...params): any;
}

export interface OptionAnswerSelector {
  value?: string;
  subtexts?: {
    text: string;
    callback?(...params): any;
    callbackParams?: any[];
    styles: Record<string, any>;
  }[];
  icons?: AnswerIcon[];
  valueArray?: {text: string, highlight: boolean}[];
  isOptionAnArray?: boolean;
  status: boolean;
  click?: boolean;
  description?: string[];
  id?: string;
}

@Component({
  selector: 'app-answer-selector',
  templateUrl: './answer-selector.component.html',
  styleUrls: ['./answer-selector.component.scss'],
})
export class AnswerSelectorComponent {
  @Input() activeOption: number;
  @Input() activeMultipleOption: number[] = [];
  @Input() editable: boolean = true;
  @Input() indicator: boolean;
  @Input() showSelectedFeedback: boolean = true;
  @Input() showDescription: boolean = true;
  @Input() containerStyles: Record<string, any> | null = null;
  @Input() itemStyles: Record<string, any> | null = null;
  @Input() isMultipleOption: boolean = false;
  @Input() isMultipleOption2: boolean = false;
  @Input() useMargins: boolean = true;
  @Input() options: OptionAnswerSelector[] = [
    { value: '¿Cuánto es?', status: true, click: false, description: [] },
    { value: '¿Dónde es?', status: true, click: false, description: [] },
    { value: '¿Qué es?', status: false, click: false, description: [] },
  ];

  @Output() onSelector = new EventEmitter<number>();

  constructor() {}

  activateOption(option: number) {
    if (option === this.activeOption) return;

    this.activeOption = option;
  }

  activateMultipleOption(option: number) {
    this.options[option].click = !this.options[option].click;

    if (!this.activeMultipleOption.includes(option)) {
      this.activeMultipleOption.push(option);
      this.activeMultipleOption.sort();
    } else {
      this.activeMultipleOption.splice(option, 1);
      this.activeMultipleOption.sort();
    }
  }

  clickSelector(index: number) {
    if (this.isMultipleOption || this.isMultipleOption2) {
      this.activateMultipleOption(index);
      this.onSelector.emit(index);
    } else {
      this.activateOption(index);
      this.onSelector.emit(index);
    }
  }

  informSelector(index: number) {
    this.onSelector.emit(index);
  }

  spreadParams(anyFunction, params) {
    return anyFunction(...params);
  }
}
