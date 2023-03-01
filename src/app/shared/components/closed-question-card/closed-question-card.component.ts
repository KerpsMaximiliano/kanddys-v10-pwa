import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
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
  @Input() selectedIndexes: Array<number> = [];
  @Input() selectedImagesIndexes: Array<number> = [];
  @Input() question: string;
  @Input() id: string;
  @Input() answers: Array<any> = []; //Array of images by options
  @Input() type: number = 1;
  @Input() shadows: boolean = true;
  @Input() multiple: boolean = true;
  @Input() questionType: string = 'multiple';
  @Input() containerStyles: Record<string, any> = null;
  @Input() labelStyles: Record<string, any> = null;
  @Input() userProvidedAnswerSelected: boolean = false;
  @Input() userProvidedAnswer: FormControl = new FormControl('');
  @Output() onSelector = new EventEmitter<{
    option: number;
    image: number;
    selectedOptionOrText: string;
  }>();
  @Output() onSelectorMultiple = new EventEmitter<
    Array<{
      option: number;
      image: number;
      selectedOptionOrText: string;
    }>
  >();
  optionsByImages: Record<number, number> = {}; //index of option, index of image
  imagesByOption: Record<number, number> = {}; //index of image, index of option

  options: OptionAnswerSelector[] = []; //Array of answer selector options

  constructor() {}

  ngOnInit(): void {
    let selectedListIndex = null;

    this.answers.forEach((answer, fullOptionsIndex) => {
      let value = null;

      //It sets the value of the answer depending of wether or not the option has a image, has a image with a label, or its just text-only
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

      //If the question is multiple-text and the user provided a custom answer, it initializes the textarea
      if (answer.userProvidedAnswer) {
        this.userProvidedAnswerSelected = true;
        this.userProvidedAnswer.setValue(answer.userProvidedAnswer);
      }
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

    if (this.options[this.selected] && !this.multiple)
      this.options[this.selected].valueStyles = {
        'padding-left': '0px',
        marginLeft: '17.5px',
        'font-size': '17px',
      };
    else if (this.multiple) {
      this.options.forEach((option, index) => {
        if (this.selectedIndexes.includes(index)) {
          this.options[index].valueStyles = {
            'padding-left': '0px',
            marginLeft: '17.5px',
            'font-size': '17px',
          };
        }
      });
    }

    if (!this.multiple)
      this.onSelector.emit({
        option: this.selected,
        image: this.selectedImage,
        selectedOptionOrText:
          this.questionType === 'multiple-text' &&
          this.selected === this.options.length - 1
            ? this.userProvidedAnswer.value
            : this.options[this.selected]?.value,
      });
    else {
      console.log(this.selectedIndexes, this.selectedImagesIndexes);
    }

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

    this.userProvidedAnswer.valueChanges.subscribe((change) => {
      this.onSelector.emit({
        option: this.options.length - 1,
        image: null,
        selectedOptionOrText: change,
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

      if (
        this.questionType === 'multiple-text' &&
        !this.userProvidedAnswerSelected &&
        index === this.options.length - 1
      ) {
        this.userProvidedAnswerSelected = true;
        return;
      } else if (
        this.questionType === 'multiple-text' &&
        this.userProvidedAnswerSelected
      ) {
        this.userProvidedAnswerSelected = false;
      }
    }

    let selectedOptionOrText = null;

    this.options.forEach((option, indexInList) => {
      if (this.options[indexInList])
        this.options[indexInList].valueStyles = {
          'padding-left': '0px',
          marginLeft: '17.5px',
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

  selectOptMultiple(
    indexOrIndexes: any,//number for single selection, array of numbers for multiple selection
    from: 'GRID' | 'OPTIONS-LIST',
    imageRoute?: string
  ) {
    //It handles cases when the event is for some reason triggered without expecting it
    if (!from || !['GRID', 'OPTIONS-LIST'].includes(from)) return null;

    
    if (from === 'GRID') {
      if (!this.selectedImagesIndexes.includes(indexOrIndexes)) {
        this.selectedImagesIndexes.push(indexOrIndexes);
        this.selectedIndexes.push(this.imagesByOption[indexOrIndexes]);
      }
      else {
        this.selectedImagesIndexes.splice(indexOrIndexes, 1);
        this.selectedIndexes.splice(indexOrIndexes, 1);
      } 
    } else {
      this.selectedIndexes = indexOrIndexes;
      this.selectedImagesIndexes = this.selectedIndexes.map(indexInList => this.optionsByImages[indexInList]);
    }


    const selectedOptions: Array<{
      option: number;
      image: number;
      selectedOptionOrText: string;
    }> = [];

    /*
    this.options.forEach((option, indexInList) => {
      this.options[indexInList].valueStyles = {
        'padding-left': '0px',
        marginLeft: '17.5px',
        'font-size': '17px',
      };

      if(typeof indexOrIndexes === 'object') {
        selectedOptions.push({
          option: indexInList,
          selectedOptionOrText: this.options[indexInList].value,
          image: this.answers[this.imagesByOption[indexInList]]?.img
        })
      } 
      
      if(typeof indexOrIndexes === 'number' && this.selectedImagesIndexes.includes(indexInList)) {
        selectedOptions.push({
          option: this.imagesByOption[indexInList],
          selectedOptionOrText: this.options[this.imagesByOption[indexInList]].value,
          image: this.answers[indexInList]?.img
        })
      } 
    });


    console.log(selectedOptions);

    /*
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
    */
  }
}
