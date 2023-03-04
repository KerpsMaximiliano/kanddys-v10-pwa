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
  @Input() alternateImageSelectionCriteria: boolean = false;
  @Input() question: string;
  @Input() id: string;
  @Input() answers: Array<any> = []; //Array of images by options
  @Input() completeAnswers: Array<any> = []; //Array of images by options
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
  answersWithMedia: Array<any> = []; //Array of images by options

  constructor() {}

  ngOnInit(): void {
    let selectedListIndex = null;

    this.completeAnswers = this.answers;

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
      this.emitMultipleSelectedOptions(true);
    }

    if (this.multiple) {
      this.answersWithMedia = this.answers.filter((answer) => answer.isMedia);
    }

    this.userProvidedAnswer.valueChanges.subscribe((change) => {
      if (!this.multiple) {
        this.onSelector.emit({
          option: this.options.length - 1,
          image: null,
          selectedOptionOrText: change,
        });
      } else {
        this.onSelectorMultiple.emit(
          this.options
            .map((option, index) => ({
              option: this.selectedIndexes.includes(index) ? index : null,
              image: null,
              selectedOptionOrText:
                index !== this.options.length - 1 ? option.value : change,
            }))
            .filter((option) => option.option !== null)
        );
      }
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

  classifyAnswer = (answer: any, completeAnswerStructure = false) => {
    if (!completeAnswerStructure) {
      if (answer.text === null && answer.img && answer.img.length)
        return 'IMAGE_NO_TEXT';
      if (answer.text && answer.text && answer.img && answer.img.length)
        return 'IMAGE_AND_TEXT';
      if (answer.text && answer.text && answer.img === null)
        return 'TEXT_NO_IMAGE';
    }

    if (completeAnswerStructure) {
      if (answer.isMedia && answer.label === null) return 'IMAGE_NO_TEXT';
      if (answer.isMedia && answer.label) return 'IMAGE_AND_TEXT';
      if (!answer.isMedia && answer.value) return 'TEXT_NO_IMAGE';
    }
  };

  emitMultipleSelectedOptions(completeAnswerStructure: boolean = false) {
    const selectedOptions: Array<{
      option: number;
      image: number;
      selectedOptionOrText: string;
    }> = [];

    this.selectedIndexes = this.selectedIndexes.filter(
      (index) => index !== null
    );
    this.selectedImagesIndexes = this.selectedImagesIndexes.filter(
      (index) => index !== null
    );

    const answersClassified = this.completeAnswers.map((answer, index) => ({
      classification: this.classifyAnswer(answer, completeAnswerStructure),
      answerIndex: index,
      answer: !completeAnswerStructure
        ? answer
        : {
            text: answer.isMedia ? answer.label : answer.value,
            img: answer.isMedia ? answer.value : null,
          },
    }));

    const answersWithText = answersClassified.filter((answer) =>
      ['IMAGE_AND_TEXT', 'TEXT_NO_IMAGE'].includes(answer.classification)
    );

    const answersWithImage = answersClassified.filter((answer) =>
      ['IMAGE_AND_TEXT', 'IMAGE_NO_TEXT'].includes(answer.classification)
    );

    const alreadyInsertedImages = {};

    //INSERTS OPTIONS THAT HAVE TEXT AND ARE SELECTED
    this.selectedIndexes.forEach((selectedIndex) => {
      answersWithText.forEach((answer) => {
        if (this.options[selectedIndex].value === answer.answer.text) {
          const toInsert = {
            option: selectedIndex,
            image: this.optionsByImages[selectedIndex],
            selectedOptionOrText: answer.answer.text,
          };

          if (answer.answer.img !== null) {
            alreadyInsertedImages[this.optionsByImages[selectedIndex]] = true;
          }

          selectedOptions.push(toInsert);
        }
      });
    });

    //INSERTS OPTIONS THAT HAVE IMAGES AND ARE SELECTED
    this.selectedImagesIndexes.forEach((selectedImageIndex) => {
      answersWithImage.forEach((answer) => {
        if (
          this.answers[selectedImageIndex].img === answer.answer.img &&
          !alreadyInsertedImages[selectedImageIndex] &&
          answer.answer.text === null
        ) {
          const toInsert = {
            option: this.imagesByOption[selectedImageIndex],
            image: selectedImageIndex,
            selectedOptionOrText: answer.answer.text,
          };

          selectedOptions.push(toInsert);
        }
      });
    });

    this.onSelectorMultiple.emit(selectedOptions);
  }

  //HANDLES THE CASE WHEN A BUTTON OF THE ANSWER SELECTOR IS CLICKED(WHEN MULTIPLE SELECTION IS ENABLED)
  selectOptMultipleFromList(
    indexOrIndexes: Array<number> //number for single selection, array of numbers for multiple selection
  ) {
    this.selectedIndexes = indexOrIndexes;

    if (
      this.questionType === 'multiple-text' &&
      !this.userProvidedAnswerSelected &&
      indexOrIndexes.includes(this.options.length - 1)
    ) {
      this.userProvidedAnswerSelected = true;
    } else if (
      this.questionType === 'multiple-text' &&
      this.userProvidedAnswerSelected &&
      !indexOrIndexes.includes(this.options.length - 1)
    ) {
      this.userProvidedAnswerSelected = false;
    }

    this.emitMultipleSelectedOptions();
  }

  //HANDLES THE CASE WHEN THE RADIO BUTTON OF THE IMAGE GRID IS CLICKED(WHEN MULTIPLE SELECTION IS ENABLED)
  selectOptMultipleFromGrid(indexClicked: number) {
    this.selectedIndexes = this.selectedIndexes.filter(
      (index) => index !== null
    );
    this.selectedImagesIndexes = this.selectedImagesIndexes.filter(
      (index) => index !== null
    );

    if (this.selectedImagesIndexes.includes(indexClicked)) {
      const indexFromImageGrid = this.selectedImagesIndexes.findIndex(
        (index) => index === indexClicked
      );

      if (indexFromImageGrid >= 0)
        this.selectedImagesIndexes.splice(indexFromImageGrid, 1);

      const indexFromOptionList = this.selectedIndexes.findIndex(
        (index) => this.imagesByOption[indexClicked] === index
      );

      if (indexFromOptionList >= 0)
        this.selectedIndexes.splice(indexFromOptionList, 1);
    } else {
      this.selectedImagesIndexes.push(indexClicked);
      this.selectedIndexes.push(this.imagesByOption[indexClicked]);
    }

    const selectedOptions: Array<{
      option: number;
      image: number;
      selectedOptionOrText: string;
    }> = [];

    const answersWithImages = this.answers
      .map((answer, index) => ({
        classification: this.classifyAnswer(answer),
        answerIndex: index,
        answer,
      }))
      .filter((answerInList) => answerInList.answer.img);

    this.selectedImagesIndexes.forEach((selectedImagesIndex, orderIndex) => {
      let selectedOptionOrText = null;

      if (
        answersWithImages[selectedImagesIndex] &&
        answersWithImages[selectedImagesIndex].classification ===
          'IMAGE_AND_TEXT'
      ) {
        selectedOptionOrText =
          answersWithImages[selectedImagesIndex].answer.text;
      }

      const toInsert = {
        option: this.imagesByOption[selectedImagesIndex],
        image: this.selectedImagesIndexes[orderIndex],
        selectedOptionOrText: selectedOptionOrText,
      };

      selectedOptions.push(toInsert);
    });

    this.onSelectorMultiple.emit(selectedOptions);
  }
}
