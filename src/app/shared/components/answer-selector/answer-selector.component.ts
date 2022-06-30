import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface OptionAnswerSelector {
  value: string;
  status: boolean;
  click?: boolean;
  description?: string[];
}

@Component({
  selector: 'app-answer-selector',
  templateUrl: './answer-selector.component.html',
  styleUrls: ['./answer-selector.component.scss'],
})
export class AnswerSelectorComponent {
  @Input() activeOption: number;
  activeMultipleOption: number[] = [];
  @Input() editable: boolean = true;
  @Input() indicator: boolean;
  @Input() showSelectedFeedback: boolean = true;
  @Input() showDescription: boolean = true;
  @Input() containerStyles: Record<string, any> | null = null;
  @Input() itemStyles: Record<string, any> | null = null;

  @Input() isMultipleOption: boolean = false;
  @Input() useMargins: boolean = true;
  @Input() options: OptionAnswerSelector[] = [
    { value: '¿Cuánto es?', status: true, click: false, description: [] },
    { value: '¿Dónde es?', status: true, click: false, description: [] },
    { value: '¿Qué es?', status: false, click: false, description: [] },
  ];

  @Output() onSelector = new EventEmitter();

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
      this.activeMultipleOption.slice(option, 1);
      this.activeMultipleOption.sort();
    }
  }

  clickSelector(index: number) {
    if (this.isMultipleOption) {
      this.activateMultipleOption(index);
      this.onSelector.emit(index);
    } else {
      this.activateOption(index);
      this.onSelector.emit(index);
    }
  }
}
