import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import {
  ResponsesByQuestion,
  WebformsService,
} from 'src/app/core/services/webforms.service';
import Swiper, { SwiperOptions } from 'swiper';
import { Subscription } from 'rxjs';
import { Item } from 'src/app/core/models/item';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Question, Webform } from 'src/app/core/models/webform';
import { environment } from 'src/environments/environment';
import {
  maxWordsValidator,
  minWordsValidator,
} from 'src/app/core/helpers/form-validators.helpers';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { Country, State, City } from 'country-state-city';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { capitalize } from 'src/app/core/helpers/strings.helpers';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-webform-client-view',
  templateUrl: './webform-client-view.component.html',
  styleUrls: ['./webform-client-view.component.scss'],
})
export class WebformClientViewComponent implements OnInit {
  env: string = environment.assetsUrl;
  currentStepIndex: number = 0;
  routeParamsSubscription: Subscription;
  routeQueryParamsSubscription: Subscription;
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 0,
    allowSlideNext: true,
    allowSlidePrev: true,
    allowTouchMove: true,
  };
  steps: Array<{
    question: Question;
    fields: FormGroup;
  }> = [];
  item: Item;
  webform: Webform;
  questionsById: Record<string, Question> = {};
  textResponseLabels: Record<string, string> = {
    text: 'Tu respuesta',
    email: 'Tu correo electrónico',
    phone: 'Teléfono',
    name: 'Tu nombre',
    lastname: 'Tu apellido',
    freeResponse: 'Otra opción',
  };
  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;
  redirectTo: string = 'checkout';
  isMobile:boolean = false;
  capitalize = capitalize;
  @ViewChild('questionsSwiper') questionsSwiper: SwiperComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webformsService: WebformsService,
    private itemsService: ItemsService,
    private headerService: HeaderService,
    private snackbar: MatSnackBar,
    private translate: TranslateService,
  ) {
    let language = navigator?.language ? navigator?.language?.substring(0, 2) : 'es';
      translate.setDefaultLang(language?.length === 2 ? language  : 'es');
      translate.use(language?.length === 2 ? language  : 'es');
  }

  ngOnInit(): void {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    this.isMobile = regex.test(navigator.userAgent);
    this.routeParamsSubscription = this.route.params.subscribe(
      async ({ itemId, formId }) => {
        this.routeQueryParamsSubscription = this.route.queryParams.subscribe(
          async ({ startAtQuestion, redirectTo }) => {
            lockUI();

            if (redirectTo && redirectTo.length > 0)
              this.redirectTo = redirectTo;

            this.item = await this.itemsService.item(itemId);

            if (this.item.webForms?.length > 0)
              formId = this.item.webForms[0].reference;
            else this.router.navigate(['/others/error-screen']);

            this.webform = await this.webformsService.webform(formId);

            for await (const question of this.webform.questions) {
              this.questionsById[question._id] = question;
              let fields: FormGroup = null;
              let options: FormArray = null;
              const validators = [];

              const responseForThisQuestion =
                this.webformsService.clientResponsesByItem[question._id];

              if (
                question.type === 'text' &&
                [
                  'default',
                  'email',
                  'phone',
                  'max12',
                  'min12',
                  'number',
                ].includes(question.answerTextType)
              ) {
                fields =
                  question.answerTextType !== 'phone'
                    ? new FormGroup({
                        textResponse: new FormControl(
                          !responseForThisQuestion
                            ? ''
                            : responseForThisQuestion.response
                        ),
                      })
                    : new FormGroup({
                        textResponse: new FormControl(
                          !responseForThisQuestion
                            ? ''
                            : responseForThisQuestion.phoneTemporalData
                        ),
                      });

                if (question.answerTextType.toUpperCase() === 'NUMBER') {
                  validators.push(Validators.pattern('^[0-9]*$'));
                }

                if (question.answerTextType.toUpperCase() === 'MAX12') {
                  validators.push(maxWordsValidator(12));
                }

                if (question.answerTextType.toUpperCase() === 'MIN12') {
                  validators.push(minWordsValidator(12));
                }

                //console.log(question.answerTextType);
                if (question.answerTextType.toUpperCase() === 'EMAIL')
                  validators.push(Validators.email);
              } else if (
                question.type === 'text' &&
                question.answerTextType === 'name'
              ) {
                fields = new FormGroup({
                  name: new FormControl(
                    !responseForThisQuestion
                      ? ''
                      : responseForThisQuestion.response
                  ),
                  lastname: new FormControl(
                    !responseForThisQuestion
                      ? ''
                      : responseForThisQuestion.responseLabel
                  ),
                });
              } else if (question.type === 'multiple') {
                options = new FormArray(
                  question.answerDefault.map((option, index) => {
                    let isAlreadySelected;

                    if (question.answerLimit === 1) {
                      isAlreadySelected = !responseForThisQuestion
                        ? false
                        : option.value === responseForThisQuestion.response;
                    } else {
                      isAlreadySelected = !responseForThisQuestion
                        ? false
                        : responseForThisQuestion?.allOptions?.[index].selected;
                    }

                    return new FormGroup({
                      text: new FormControl(
                        option.isMedia ? option.label : option.value
                      ),
                      fileInput: new FormControl(
                        option.isMedia ? option.value : null
                      ), // the file input value will be a File object
                      selected: new FormControl(isAlreadySelected),
                    });
                  })
                );

                fields = new FormGroup({
                  options,
                  areOptionsMedia: new FormControl(
                    options && options.value[0].fileInput !== null
                  ),
                });
              } else if (question.type === 'multiple-text') {
                options = new FormArray(
                  question.answerDefault.map((option, index) => {
                    let isAlreadySelected;

                    if (question.answerLimit === 1) {
                      isAlreadySelected = !responseForThisQuestion
                        ? false
                        : option.value === responseForThisQuestion.response;
                    } else {
                      isAlreadySelected = !responseForThisQuestion
                        ? false
                        : responseForThisQuestion?.allOptions?.[index].selected;
                    }

                    return new FormGroup({
                      text: new FormControl(
                        option.isMedia ? option.label : option.value
                      ),
                      fileInput: new FormControl(
                        option.isMedia ? option.value : null
                      ), // the file input value will be a File object
                      selected: new FormControl(isAlreadySelected),
                    });
                  })
                );

                options.push(
                  new FormGroup({
                    text: new FormControl(''),
                    selected: new FormControl(false),
                  })
                );

                const lastFormControl = options.controls[options.length - 1];

                lastFormControl.valueChanges.subscribe((value) => {
                  if (value !== '') {
                    this.selectOptionFromList(
                      this.currentStepIndex,
                      options.length - 1,
                      value
                    );
                  }
                });

                fields = new FormGroup({
                  options,
                  areOptionsMedia: new FormControl(
                    options && options.value[0].fileInput !== null
                  ),
                });
              }

              if (fields) {
                for (const controlName in fields.controls) {
                  if (fields.controls.hasOwnProperty(controlName)) {
                    const control = fields.controls[controlName];

                    if (question.required) validators.push(Validators.required);

                    control.setValidators(validators);
                  }
                }
              }

              this.steps.push({
                question,
                fields,
              });
            }

            if (startAtQuestion)
              setTimeout(() => {
                this.questionsSwiper.directiveRef.setIndex(
                  Number(startAtQuestion)
                );
              }, 300);

            unlockUI();
          }
        );
      }
    );
  }

  get options() {
    const optionsFormArray = this.steps[this.currentStepIndex].fields.controls[
      'options'
    ] as FormArray;

    return optionsFormArray;
  }

  updateCurrentStepData(swiper: Swiper) {
    this.currentStepIndex = swiper.activeIndex;
  }

  selectOptionFromList(
    stepIndex: number,
    optionIndex,
    newValueFromInput?: any
  ) {
    const currentStep = this.steps[stepIndex];
    const alreadySelectedOptions = this.steps[
      stepIndex
    ].fields.controls.options.value.filter((option, index) => {
      return option.selected;
    });
    const isMultipleSelection =
      currentStep.question.answerLimit === 0 ||
      currentStep.question.answerLimit > 1;
    const alreadySelectedOptionsIndexes: Array<number> = this.steps[
      stepIndex
    ].fields.controls.options.value
      .map((option, index) => {
        return option.selected ? index : null;
      })
      .filter((index) => index !== null);

    if (
      isMultipleSelection &&
      alreadySelectedOptionsIndexes.length >=
        currentStep.question.answerLimit &&
      currentStep.question.answerLimit !== 0 &&
      !alreadySelectedOptionsIndexes.includes(optionIndex)
    ) {
      this.snackbar.open(
        'Recuerda que solo puedes seleccionar máximo ' +
          currentStep.question.answerLimit +
          ' opciones',
        'Cerrar',
        {
          duration: 3000,
        }
      );

      return;
    }

    const optionsFormArray = this.steps[stepIndex].fields.controls
      .options as FormArray;

    optionsFormArray.value.forEach((option, index) => {
      const optionCurrentValue = optionsFormArray.value[index];
      const currentOptionFormGroup = optionsFormArray.controls[
        index
      ] as FormGroup;

      if (index === optionIndex) {
        const newValue = !optionCurrentValue.selected;

        if (
          this.steps[this.currentStepIndex].question.type !== 'multiple-text' ||
          (this.steps[this.currentStepIndex].question.type ===
            'multiple-text' &&
            optionsFormArray.length - 1 !== index)
        ) {
          currentOptionFormGroup.controls['selected'].patchValue(newValue, {
            emitEvent: false,
          });
        } else if (
          this.steps[this.currentStepIndex].question.type === 'multiple-text' &&
          optionsFormArray.length - 1 === index
        ) {
          currentOptionFormGroup.controls['selected'].patchValue(
            newValueFromInput.text !== '',
            {
              emitEvent: false,
            }
          );
        }
      }

      if (
        currentStep.question.answerLimit === 1 &&
        index !== optionIndex &&
        alreadySelectedOptions.length > 0 &&
        currentOptionFormGroup.controls
      ) {
        currentOptionFormGroup.controls['selected'].patchValue(false, {
          emitEvent: false,
        });

        if (
          index === optionsFormArray.length - 1 &&
          currentStep.question.type === 'multiple-text'
        ) {
          currentOptionFormGroup.controls['text'].patchValue('', {
            emitEvent: false,
          });
        }
      }
    });

    const options = this.steps[stepIndex].fields.controls.options.value;

    if (!isMultipleSelection) {
      const selected = options.find((option) => option.selected);

      const selectedIndex = options.findIndex((option) => option.selected);

      const doesOptionsHaveMedia = currentStep.question.answerDefault.some(
        (option) => option.isMedia
      );

      if (!doesOptionsHaveMedia) {
        if (selected) {
          this.webformsService.clientResponsesByItem[
            currentStep.question._id
          ].response = selected.text;
          this.webformsService.clientResponsesByItem[
            currentStep.question._id
          ].allOptions = options;

          this.webformsService.clientResponsesByItem[
            currentStep.question._id
          ].valid = Boolean(selected.text);
        }
      } else {
        if (selected) {
          this.webformsService.clientResponsesByItem[
            currentStep.question._id
          ].response =
            currentStep.question.type === 'multiple'
              ? selected.fileInput
              : selectedIndex === options.length - 1
              ? selected.text || null
              : selected.fileInput;

          this.webformsService.clientResponsesByItem[
            currentStep.question._id
          ].allOptions = options;

          this.webformsService.clientResponsesByItem[
            currentStep.question._id
          ].valid = Boolean(
            currentStep.question.type === 'multiple'
              ? selected.fileInput
              : selectedIndex === options.length - 1
              ? selected.text && selected.text.length
              : selected.fileInput
          );
        } else {
          this.webformsService.clientResponsesByItem[
            currentStep.question._id
          ].response = '';

          this.webformsService.clientResponsesByItem[
            currentStep.question._id
          ].valid = false;
        }
      }

      if (this.currentStepIndex < this.steps.length - 1)
        this.questionsSwiper.directiveRef.setIndex(this.currentStepIndex + 1);
    } else {
      const selectedOptions = options.filter((option) => option.selected);

      if (selectedOptions.length) {
        this.webformsService.clientResponsesByItem[
          currentStep.question._id
        ].multipleResponses = [];

        const isMediaSelection = Boolean(
          currentStep.question.answerDefault[0].isMedia
        );

        for (const optionSelected of selectedOptions) {
          const isTheAnswerProvidedByUser =
            currentStep.question.answerDefault.findIndex((option) =>
              isMediaSelection
                ? option.value === optionSelected.fileInput
                : option.value === optionSelected.text
            ) === -1;

          this.webformsService.clientResponsesByItem[
            currentStep.question._id
          ].allOptions = options;

          this.webformsService.clientResponsesByItem[
            currentStep.question._id
          ].multipleResponses.push({
            response: optionSelected.fileInput || optionSelected.text,
            isProvidedByUser: isTheAnswerProvidedByUser,
            isMedia:
              optionSelected.fileInput &&
              optionSelected.fileInput.includes('https'),
          });

          this.webformsService.clientResponsesByItem[
            currentStep.question._id
          ].valid = !currentStep.question.required
            ? true
            : this.webformsService.clientResponsesByItem[
                currentStep.question._id
              ].multipleResponses.length > 0;
        }
      } else {
        this.webformsService.clientResponsesByItem[currentStep.question._id] =
          null;

        this.webformsService.clientResponsesByItem[
          currentStep.question._id
        ].valid = !currentStep.question.required ? true : false;
      }
    }
  }

  async saveWebform(preventRedirection?: boolean, goToNextStep?: boolean) {
    if (this.currentStepIndex < this.steps.length - 1 && goToNextStep) {
      return this.questionsSwiper.directiveRef.setIndex(
        this.currentStepIndex + 1
      );
    }

    for (const step of this.steps) {
      if (!['multiple', 'multiple-text'].includes(step.question.type)) {
        const name = step.fields.controls['name']?.value;
        const lastname = step.fields.controls['lastname']?.value;
        let response;
        let responseLabel;

        let isFullNameValid = true;

        switch (step.question.answerTextType) {
          case 'name':
            response = name;
            responseLabel = lastname;
            isFullNameValid = response?.length && responseLabel?.length;
            break;
          case 'phone':
            response =
              step.fields.controls['textResponse'].value?.e164Number.split(
                '+'
              )[1];
            break;
          default:
            response = step.fields.controls['textResponse'].value;
        }

        if (step.fields.valid && isFullNameValid) {
          this.webformsService.clientResponsesByItem[step.question._id] = {
            question: step.question,
            response,
            responseLabel,
            isMedia: false,
            isMultipleResponse: false,
            valid: step.fields.valid,
            phoneTemporalData:
              step.question.answerTextType === 'phone'
                ? step.fields.controls['textResponse'].value
                : null,
          };
        } else {
          this.webformsService.clientResponsesByItem[step.question._id] = {
            question: step.question,
            response,
            responseLabel,
            isMedia: false,
            isMultipleResponse: false,
            valid: step.fields.valid,
          };
        }
      }
    }

    if (!preventRedirection)
      return this.router.navigate([
        '/ecommerce/' +
          this.headerService.saleflow.merchant.slug +
          '/' +
          this.redirectTo,
      ]);
  }

  goToDetail(index: number) {
    this.saveWebform(true);

    this.webformsService.selectedQuestion = {
      questionId: this.steps[this.currentStepIndex].question._id,
      question: this.steps[this.currentStepIndex].question,
      required: this.steps[this.currentStepIndex].question.required,
      multiple:
        this.steps[this.currentStepIndex].question.answerLimit === 0 ||
        this.steps[this.currentStepIndex].question.answerLimit > 1,
      index: this.currentStepIndex,
    };

    const options =
      this.steps[this.currentStepIndex].fields.controls.options.value;

    if (
      !this.webformsService.clientResponsesByItem[
        this.steps[this.currentStepIndex].question._id
      ].allOptions
    ) {
      this.webformsService.clientResponsesByItem[
        this.steps[this.currentStepIndex].question._id
      ].allOptions = options;
    }

    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    this.router.navigate(['/ecommerce/webform-options-selector'], {
      queryParams: {
        startAt: index,
        questionIndex: this.currentStepIndex,
      },
    });
  }

  selectOpt(index: number) {
    const completeAnswers =
      this.steps[this.currentStepIndex].fields.controls.options.value;

    for (let i = 0; i < completeAnswers.length; i++) {
      if (i == index) {
        completeAnswers[i].selected = !completeAnswers[i].selected;
      } else {
        completeAnswers[i].selected = false;
      }
    }

    this.webformsService.clientResponsesByItem[
      this.steps[this.currentStepIndex].question._id
    ].allOptions = completeAnswers;

    if (completeAnswers[index].selected) {
      this.webformsService.clientResponsesByItem[
        this.steps[this.currentStepIndex].question._id
      ].response = completeAnswers[index].fileInput;

      this.webformsService.clientResponsesByItem[
        this.steps[this.currentStepIndex].question._id
      ].valid = !this.steps[this.currentStepIndex].question.required
        ? true
        : this.steps[this.currentStepIndex].question.required &&
          completeAnswers[index].fileInput?.length > 0 &&
          completeAnswers[index].selected;
    } else {
      this.webformsService.clientResponsesByItem[
        this.steps[this.currentStepIndex].question._id
      ].response = null;

      this.webformsService.clientResponsesByItem[
        this.steps[this.currentStepIndex].question._id
      ].valid = !this.steps[this.currentStepIndex].question.required
        ? true
        : this.steps[this.currentStepIndex].question.required &&
          completeAnswers[index].fileInput?.length > 0 &&
          completeAnswers[index].selected;
    }
  }

  selectOptMultipleFromGrid(indexClicked: number) {
    const completeAnswers =
      this.steps[this.currentStepIndex].fields.controls.options.value;

    const multiple =
      this.steps[this.currentStepIndex].question.answerLimit === 0 ||
      this.steps[this.currentStepIndex].question.answerLimit > 1;

    const alreadySelectedOptionsIndexes: Array<number> = completeAnswers
      .map((option, index) => {
        return option.selected ? index : null;
      })
      .filter((index) => index !== null);

    if (
      multiple &&
      alreadySelectedOptionsIndexes.length >=
        this.webformsService.clientResponsesByItem[
          this.steps[this.currentStepIndex].question._id
        ].question.answerLimit &&
      this.webformsService.clientResponsesByItem[
        this.steps[this.currentStepIndex].question._id
      ].question.answerLimit !== 0 &&
      !alreadySelectedOptionsIndexes.includes(indexClicked)
    ) {
      this.snackbar.open(
        'Recuerda que solo puedes seleccionar máximo ' +
          this.webformsService.clientResponsesByItem[
            this.steps[this.currentStepIndex].question._id
          ].question.answerLimit +
          ' opciones',
        'Cerrar',
        {
          duration: 3000,
        }
      );
      return;
    }

    for (let i = 0; i < completeAnswers.length; i++) {
      if (i === indexClicked)
        completeAnswers[i].selected = !completeAnswers[i].selected;
    }

    this.webformsService.clientResponsesByItem[
      this.steps[this.currentStepIndex].question._id
    ].allOptions = completeAnswers;

    const selectedOptions = completeAnswers.filter((answer) => answer.selected);

    if (selectedOptions.length) {
      this.webformsService.clientResponsesByItem[
        this.steps[this.currentStepIndex].question._id
      ].multipleResponses = [];

      for (const optionSelected of selectedOptions) {
        const isTheAnswerProvidedByUser = false;

        this.webformsService.clientResponsesByItem[
          this.steps[this.currentStepIndex].question._id
        ].multipleResponses.push({
          response: optionSelected.fileInput || optionSelected.text,
          isProvidedByUser: isTheAnswerProvidedByUser,
          isMedia:
            optionSelected.fileInput &&
            optionSelected.fileInput.includes('https'),
        });

        this.webformsService.clientResponsesByItem[
          this.steps[this.currentStepIndex].question._id
        ].valid = !this.steps[this.currentStepIndex].question.required
          ? true
          : this.steps[this.currentStepIndex].question.required &&
            this.webformsService.clientResponsesByItem[
              this.steps[this.currentStepIndex].question._id
            ].multipleResponses?.length > 0;
      }
    } else {
      this.webformsService.clientResponsesByItem[
        this.steps[this.currentStepIndex].question._id
      ].multipleResponses = [];

      this.webformsService.clientResponsesByItem[
        this.steps[this.currentStepIndex].question._id
      ].valid = !this.steps[this.currentStepIndex].question.required
        ? true
        : false;
    }
  }

  templateStyles() {
    return { 'grid-template-columns': `repeat(${this.steps.length}, 1fr)` };
  }

  getFormArray(data: any): FormArray {
    return data;
  }

  getFormGroup(data: any): FormGroup {
    //console.log('DATA', data);

    return data;
  }

  getFormControl(data: any): FormControl {
    return data;
  }

  onNumberInputPress(event: KeyboardEvent) {
    const keyCode = event.keyCode || event.which;
    // Prevent input of non-numeric characters, except for backspace and delete keys
    if (keyCode !== 8 && keyCode !== 46 && (keyCode < 48 || keyCode > 57)) {
      event.preventDefault();
    }
  }
}
