import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  DialogFlowService,
  WebformMultipleOptionIDs,
} from 'src/app/core/services/dialog-flow.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { environment } from 'src/environments/environment';
import { ExtendedAnswerDefault } from '../webform-multiple-selection-question/webform-multiple-selection-question.component';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { Question } from 'src/app/core/models/webform';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-closed-question-card',
  templateUrl: './closed-question-card.component.html',
  styleUrls: ['./closed-question-card.component.scss'],
})
export class ClosedQuestionCardComponent implements OnInit, OnDestroy {
  env: string = environment.assetsUrl;
  @Input() question: Question;
  @Input() isMediaSelection: boolean;
  @Input() id: string;
  @Input() multiple: boolean = true;
  @Input() required: boolean = false;
  @Input() userProvidedAnswerSelected: boolean = false;
  @Input() userProvidedAnswer: FormControl = new FormControl('');
  @Output() onSelector = new EventEmitter<any>();
  subscription: Subscription;
  @Input() shadows: boolean = true;
  @Input() containerStyles: Record<string, any> = null;
  @Input() labelStyles: Record<string, any> = null;
  @Input() optionsInAnswerSelector: Array<OptionAnswerSelector> = []; //Array of answer selector options
  @Input() optionsInImageGrid: Array<ExtendedAnswerDefault> = []; //Array of images by options
  @Input() showTitle: boolean = false; //Array of images by options
  selectedImageIndex: number = null;
  selectedImageIndexes: Array<number> = [];
  selectedListOptionIndex: number = null;
  selectedListOptionIndexes: Array<number> = [];

  constructor(
    private webformsService: WebformsService,
    private snackbar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initProcesses();
  }

  initProcesses() {
    this.optionsInImageGrid = this.question.answerDefault;

    if (!this.isMediaSelection) {
      this.optionsInAnswerSelector = this.optionsInImageGrid.map((option) => ({
        value: option.isMedia && option.label ? option.label : option.value,
        click: true,
        status: true,
        selected: option.selected,
      }));
    }

    if (
      this.webformsService.clientResponsesByItem[this.question._id] &&
      !this.multiple
    ) {
      if (this.isMediaSelection) {
        this.selectedImageIndex =
          this.webformsService.clientResponsesByItem[
            this.question._id
          ].selectedIndex;

        if (this.question.type === 'multiple-text')
          this.userProvidedAnswerSelected = true;
      } else {
        this.selectedListOptionIndex =
          this.webformsService.clientResponsesByItem[
            this.question._id
          ].selectedIndex;
      }

      this.optionsInImageGrid.forEach((option, index) => {
        option.selected = this.selectedImageIndex === index;
      });

      this.userProvidedAnswer.valueChanges.subscribe((change) => {
        if (change !== '') {
          const selectedOptions = (
            this.question.answerDefault as Array<ExtendedAnswerDefault>
          ).map((option, indexInList) => {
            option.selected = this.isMediaSelection
              ? indexInList === this.selectedImageIndex
              : indexInList === this.selectedListOptionIndex;
            return option;
          });

          const justSelectedOptions = selectedOptions.filter(
            (option) => option.selected
          );

          this.onSelector.emit({
            selectedOptions,
            userProvidedAnswer: change,
            valid: this.required ? justSelectedOptions.length > 0 : true,
          });
        }
      });
    } else if (
      this.webformsService.clientResponsesByItem[this.question._id] &&
      this.multiple
    ) {
      if (this.isMediaSelection) {
        const selectedImageIndexes = [];

        this.webformsService.clientResponsesByItem[
          this.question._id
        ].allOptions.forEach((option, index) => {
          if (option.selected) {
            selectedImageIndexes.push(index);
          }
        });

        this.selectedImageIndexes = selectedImageIndexes;

        this.optionsInImageGrid.forEach((option, index) => {
          option.selected = selectedImageIndexes.includes(index);
        });

        if (this.question.type === 'multiple-text')
          this.userProvidedAnswerSelected = true;
      } else {
        const selectedListIndexes = [];

        this.webformsService.clientResponsesByItem[
          this.question._id
        ].allOptions.forEach((option, index) => {
          if (option.selected) {
            selectedListIndexes.push(index);
          }
        });

        this.selectedListOptionIndexes = selectedListIndexes;

        this.optionsInAnswerSelector.forEach((option, index) => {
          option.selected = selectedListIndexes.includes(index);
        });
      }
    }

    if (this.question.type === 'multiple-text') {
      this.optionsInAnswerSelector.push({
        value: 'Otra respuesta',
        click: true,
        status: true,
        selected: false,
      });

      if (this.multiple) {
        const responses =
          this.webformsService.clientResponsesByItem[this.question._id]
            .multipleResponses;

        const answerProvidedByUser = responses.find(
          (response) => response.isProvidedByUser
        );

        if (answerProvidedByUser)
          this.userProvidedAnswer = new FormControl(
            answerProvidedByUser.response
          );

        if (
          !this.isMediaSelection &&
          this.selectedListOptionIndexes.includes(
            this.optionsInAnswerSelector.length - 1
          )
        ) {
          this.userProvidedAnswerSelected = true;
        }

        this.userProvidedAnswer.valueChanges.subscribe((change) => {
          if (this.isMediaSelection) {
            const selectedOptions = this.optionsInImageGrid;

            this.onSelector.emit({
              selectedOptions,
              userProvidedAnswer: change,
              valid: selectedOptions.some(
                (option) =>
                  this.question.required === false ||
                  (option.selected && this.question.required)
              ),
            });
          } else {
            const selectedOptions = this.optionsInImageGrid;

            this.onSelector.emit({
              selectedOptions,
              userProvidedAnswer: change,
              valid: selectedOptions.some(
                (option) =>
                  this.question.required === false ||
                  (option.selected && this.question.required)
              ),
            });
          }
        });
      } else {
        const response =
          this.webformsService.clientResponsesByItem[this.question._id]
            .response;

        const isMediaSelection = Boolean(
          this.question.answerDefault[0].isMedia
        );

        const isTheAnswerProvidedByUser =
          this.question.answerDefault.findIndex((option) =>
            isMediaSelection
              ? option.value === response
              : option.value === response
          ) === -1;

        if (isTheAnswerProvidedByUser)
          this.userProvidedAnswer = new FormControl(response);

        if (
          !this.isMediaSelection &&
          this.selectedListOptionIndex ===
            this.optionsInAnswerSelector.length - 1
        ) {
          this.userProvidedAnswerSelected = true;
        }

        this.userProvidedAnswer.valueChanges.subscribe((change) => {
          this.selectedImageIndex = null;
          this.selectedListOptionIndex = null;
          this.webformsService.clientResponsesByItem[
            this.question._id
          ].selectedIndex = null;

          if (this.isMediaSelection) {
            const selectedOptions = this.optionsInImageGrid;

            this.onSelector.emit({
              selectedOptions,
              userProvidedAnswer: change,
              valid: selectedOptions.some(
                (option) =>
                  this.question.required === false ||
                  (option.selected && this.question.required)
              ),
            });
          } else {
            const selectedOptions = this.optionsInImageGrid;

            this.onSelector.emit({
              selectedOptions,
              userProvidedAnswer: change,
              valid: selectedOptions.some(
                (option) =>
                  this.question.required === false ||
                  (option.selected && this.question.required)
              ),
            });
          }
        });
      }
    }
  }

  selectOption(index: any) {
    if (!this.multiple) {
      this.userProvidedAnswer.setValue('');

      if (this.isMediaSelection) {
        this.selectedImageIndex = index;

        const selectedOptions = (
          this.question.answerDefault as Array<ExtendedAnswerDefault>
        ).map((option, indexInList) => {
          option.selected = indexInList === index;
          return option;
        });

        const toEmit: any = {
          selectedOptions,
          valid: selectedOptions.some(
            (option) =>
              this.question.required === false ||
              (option.selected && this.question.required)
          ),
        };

        toEmit.userProvidedAnswer = this.userProvidedAnswer.value;

        this.onSelector.emit(toEmit);

        this.webformsService.clientResponsesByItem[
          this.question._id
        ].selectedIndex = index;
      } else {
        this.selectedListOptionIndex = index;

        const selectedOptions = (
          this.question.answerDefault as Array<ExtendedAnswerDefault>
        ).map((option, indexInList) => {
          option.selected = indexInList === index;
          return option;
        });

        const toEmit: any = {
          selectedOptions,
          valid: selectedOptions.some(
            (option) =>
              this.question.required === false ||
              (option.selected && this.question.required)
          ),
        };

        toEmit.userProvidedAnswer = this.userProvidedAnswer.value;

        this.onSelector.emit(toEmit);

        this.webformsService.clientResponsesByItem[
          this.question._id
        ].selectedIndex = index;
      }
    } else {
      if (
        (this.userProvidedAnswerSelected &&
          Array.isArray(index) &&
          !index.includes(this.optionsInAnswerSelector.length - 1)) ||
        (this.userProvidedAnswerSelected &&
          !Array.isArray(index) &&
          index === this.optionsInAnswerSelector.length - 1)
      ) {
        this.userProvidedAnswerSelected = false;
        this.userProvidedAnswer.setValue('');
      } else if (
        (!this.userProvidedAnswerSelected &&
          Array.isArray(index) &&
          index.includes(this.optionsInAnswerSelector.length - 1)) ||
        (!this.userProvidedAnswerSelected &&
          !Array.isArray(index) &&
          index === this.optionsInAnswerSelector.length - 1)
      ) {
        this.userProvidedAnswerSelected = true;
        this.userProvidedAnswer.setValue('');
      }

      if (this.isMediaSelection) {
        const alreadySelectedOptionIndexes = this.optionsInImageGrid
          .map((option, index) => (option.selected ? index : null))
          .filter((index) => index !== null);
        const numberOfAlreadySelectedOptions = this.optionsInImageGrid.filter(
          (option, indexInList) => option.selected
        ).length;

        if (
          this.question.answerLimit !== 0 &&
          this.question.answerLimit > 1 &&
          numberOfAlreadySelectedOptions >= this.question.answerLimit &&
          !alreadySelectedOptionIndexes.includes(index)
        ) {
          this.snackbar.open(
            'Recuerda que solo puedes seleccionar máximo ' +
              this.question.answerLimit +
              ' opciones',
            'Cerrar',
            {
              duration: 3000,
            }
          );

          return;
        }

        const selectedOptions = this.optionsInImageGrid.map(
          (option, indexInList) => {
            if (indexInList === index) {
              option.selected = !option.selected;

              if (option.selected) this.selectedImageIndexes.push(indexInList);
              else
                this.selectedImageIndexes = this.selectedImageIndexes.filter(
                  (indexInList) => index !== indexInList
                );
            }
            return option;
          }
        );

        const toEmit: any = {
          selectedOptions,
          valid: selectedOptions.some(
            (option) =>
              this.question.required === false ||
              (option.selected && this.question.required)
          ),
        };

        toEmit.userProvidedAnswer = this.userProvidedAnswer.value;

        this.onSelector.emit(toEmit);

        /*
        this.webformsService.clientResponsesByItem[
          this.question._id
        ].selectedIndex = index;*/
      } else {
        const selectedOptions = this.optionsInImageGrid.map(
          (option, indexInList) => {
            if (index.includes(indexInList)) {
              option.selected = true;
            } else {
              option.selected = false;
            }
            return option;
          }
        );

        this.selectedListOptionIndexes = index;

        const toEmit: any = {
          selectedOptions,
          valid: selectedOptions.some(
            (option) =>
              this.question.required === false ||
              (option.selected && this.question.required)
          ),
        };

        toEmit.userProvidedAnswer = this.userProvidedAnswer.value;

        this.onSelector.emit(toEmit);
      }
    }
  }

  goToDetail(index: number) {
    this.webformsService.selectedQuestion = {
      questionId: this.question._id,
      question: this.question,
      required: this.question.required,
      multiple:
        this.question.answerLimit === 0 || this.question.answerLimit > 1,
    };

    const options = this.optionsInImageGrid.map((option) => ({
      selected: option.selected,
      fileInput: option.img,
      text: !option.value.includes('https') ? option.value : null,
    }));

    if (
      !this.webformsService.clientResponsesByItem[this.question._id].allOptions
    ) {
      this.webformsService.clientResponsesByItem[this.question._id].allOptions =
        options;
    }

    this.router.navigate(['/ecommerce/webform-options-selector'], {
      queryParams: {
        startAt: index,
      },
    });
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
