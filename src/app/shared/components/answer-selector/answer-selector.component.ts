import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  BankAnswers,
  ComplexOptionAnswerSelector,
  OptionAnswerSelector,
} from 'src/app/core/types/answer-selector';

@Component({
  selector: 'app-answer-selector',
  templateUrl: './answer-selector.component.html',
  styleUrls: ['./answer-selector.component.scss'],
})
export class AnswerSelectorComponent implements OnInit {
  @Input() activeOption: number;
  @Input() activeMultipleOption: number[] = [];
  @Output() activeMultipleOptionValue = new EventEmitter();
  @Input() editable: boolean = true;
  @Input() indicator: boolean;
  @Input() showSelectedFeedback: boolean = true;
  @Input() showDescription: boolean = true;
  @Input() multipleOptionsLimit: number = null;
  @Input() containerStyles: Record<string, any> | null = null;
  @Input() optionContainerStyles: Record<string, any> | null = null;
  @Input() itemStyles: Record<string, any> | null = null;
  @Input() isMultipleOption: boolean = false;
  @Input() isMultipleOption2: boolean = false;
  @Input() hasComplexOptionsLayout: boolean = false;
  @Input() boldenWhenSelected: boolean = false;
  @Input() useMargins: boolean = true;
  @Input() options: OptionAnswerSelector[] = [
    { value: '¿Cuánto es?', status: true, click: false },
    { value: '¿Dónde es?', status: true, click: false },
    { value: '¿Qué es?', status: false, click: false },
  ];
  @Input() blockIndexes: number[];
  @Input() complexOptions: ComplexOptionAnswerSelector[];
  @Input() values: BankAnswers;
  @Input() alternativeBackground: string;

  @Output() onSelector = new EventEmitter<number>();

  constructor(private snackbar: MatSnackBar) {}

  ngOnInit(): void {}

  activateOption(option: number) {
    if (option === this.activeOption) return;

    this.activeOption = option;
  }

  activateMultipleOption(option: number) {
    if (
      this.multipleOptionsLimit !== null &&
      this.activeMultipleOption.length >= this.multipleOptionsLimit && this.multipleOptionsLimit !== 0 &&
      !this.activeMultipleOption.includes(option)
    ) {
      this.snackbar.open(
        'Recuerda que solo puedes seleccionar máximo ' +
          this.multipleOptionsLimit +
          ' opciones',
        'Cerrar',
        {
          duration: 3000,
        }
      );

      return;
    }

    this.options[option].click = !this.options[option].click;
    this.activeMultipleOption = this.activeMultipleOption.filter(
      (optionIndex) => optionIndex !== null
    );

    if (!this.activeMultipleOption.includes(option)) {
      this.activeMultipleOption.push(option);
      this.activeMultipleOption.sort();
    } else {
      this.activeMultipleOption = this.activeMultipleOption.filter(
        (item) => item !== option
      );

      this.activeMultipleOption.sort();
    }

    this.activeMultipleOptionValue.emit(this.activeMultipleOption);
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

  //Metodos para usar en el template
  spreadParams(anyFunction, params) {
    return anyFunction(...params);
  }

  getObjectKeysAsArray(object) {
    return Object.keys(object);
  }

  showDescription2(option: any) {
    console.log(
      option.description !== '' &&
        'description' in option &&
        this.showDescription
    );
  }
}
