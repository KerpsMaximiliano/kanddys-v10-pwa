import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-closed-question-card',
  templateUrl: './closed-question-card.component.html',
  styleUrls: ['./closed-question-card.component.scss'],
})
export class ClosedQuestionCardComponent implements OnInit {
  env: string = environment.assetsUrl;
  @Input() selected: number = null;
  @Input() selectedImage: number = null;
  @Input() question: string;
  @Input() id: string;
  @Input() answers: Array<any> = []; //Array of images by options
  @Input() type: number = 1;
  @Input() shadows: boolean = true;
  @Input() containerStyles: Record<string, any> = null;
  @Input() labelStyles: Record<string, any> = null;
  @Output() onSelector = new EventEmitter<{
    option: number;
    image: number;
    selectedOptionOrText: string;
  }>();
  optionsByImages: Record<number, number> = {}; //index of option, index of image
  imagesByOption: Record<number, number> = {}; //index of image, index of option

  options: OptionAnswerSelector[] = []; //Array of answer selector options

  constructor() {}

  ngOnInit(): void {
    let selectedListIndex = null;

    this.answers.forEach((answer, fullOptionsIndex) => {
      let value = null;

      if (answer.text) value = answer.text;
      if (answer.isMedia && answer.label) value = answer.label;
      if (!answer.isMedia && answer.value) value = answer.value;

      this.options.push({
        status: true,
        id: 'other',
        click: true,
        value: value,
        valueStyles: {
          'padding-left': '0px',
          marginLeft: '17.5px',
          'font-family': 'SfProRegular',
          'font-size': '17px',
        },
      });
    });

    //Filter options that img for it to show in the items grid
    this.answers = this.answers.filter(
      (option) => option.img && option.isMedia
    );

    //Filter options that don't have img for it to show in the items grid
    this.options = this.options.filter((option, index) => {
      if (index === this.selected && option.value) this.selected = index;

      return option.value;
    });

    if (this.options[this.selected])
      this.options[this.selected].valueStyles = {
        'padding-left': '0px',
        marginLeft: '17.5px',
        'font-family': 'RobotoBold',
        color: '#272727',
        'font-size': '17px',
      };

    this.onSelector.emit({
      option: this.selected,
      image: this.selectedImage,
      selectedOptionOrText: this.options[this.selected]?.value,
    });

    //Fills optionsByImages
    this.answers.forEach((answer, index) => {
      this.options.forEach((option, index2) => {
        if (
          answer.text === option.value ||
          answer.value === option.value ||
          option.value === answer.label
        ) {
          this.optionsByImages[index2] = index;
          this.imagesByOption[index] = index2;
        }
      });
    });
  }

  selectOpt(index: number, from: 'GRID' | 'OPTIONS-LIST', imageRoute?: string) {
    if (!from || !['GRID', 'OPTIONS-LIST'].includes(from)) return null;

    if (from === 'GRID') {
      //this.selected = this.imagesByOption[index];
      this.selected = this.imagesByOption[index];
      this.selectedImage = index;
    } else if (from === 'OPTIONS-LIST') {
      this.selected = index;
      this.selectedImage = this.optionsByImages[index];
    }

    let selectedOptionOrText = null;

    this.options.forEach((option, indexInList) => {
      if (this.options[indexInList])
        this.options[indexInList].valueStyles = {
          'padding-left': '0px',
          marginLeft: '17.5px',
          'font-family':
          indexInList === this.selected ? 'RobotoBold' : 'SfProRegular',
          color: indexInList === this.selected ? '#272727' : '#7b7b7b',
          'font-size': '17px',
        };

      if (index === this.selected) {
        selectedOptionOrText = this.options[index].value;
      }
    });

    if (imageRoute) {
      selectedOptionOrText = imageRoute;
    } else {
      selectedOptionOrText = this.options[this.selected].value;
    }

    this.onSelector.emit({
      option: this.selected,
      image: this.selectedImage,
      selectedOptionOrText,
    });
  }
}
