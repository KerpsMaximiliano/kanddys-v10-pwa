import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swiper, { SwiperOptions } from 'swiper';
import {
  WebformCreatorStepsNames,
  WebformsService,
} from 'src/app/core/services/webforms.service';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  Question,
  QuestionInput,
  Webform,
  WebformInput,
} from 'src/app/core/models/webform';
import { AnswerDefaultInput } from 'src/app/core/models/webform';
import { ItemsService } from 'src/app/core/services/items.service';
import { Item } from 'src/app/core/models/item';
import { HeaderService } from 'src/app/core/services/header.service';
import { UsersService } from 'src/app/core/services/users.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Subscription } from 'rxjs';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

interface OptionInList {
  name: string;
  label: string;
}

export interface ExtendedQuestionInput extends QuestionInput {
  id?: string;
}

// Define a type for the swipe direction
type SwipeDirection = 'LEFT' | 'RIGHT' | null;

@Component({
  selector: 'app-form-creator',
  templateUrl: './form-creator.component.html',
  styleUrls: ['./form-creator.component.scss'],
})
export class FormCreatorComponent implements OnInit, AfterViewInit, OnDestroy {
  currentStepName: WebformCreatorStepsNames = 'ADMIN_NOTE';
  currentStepIndex: number = 0;
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 0,
    allowSlideNext: true,
    allowSlidePrev: true,
    allowTouchMove: true,
  };
  steps: Array<{
    name: string;
    fields: FormGroup;
    statusChangeSubscription?: Subscription;
  }> = [];
  responseTypesList: Array<OptionInList> = [
    {
      name: 'text',
      label: 'Escribiendo libremente',
    },
    {
      name: 'multiple',
      label: 'Seleccionando entre opciones',
    },
    {
      name: 'contact-info',
      label: 'Información de contacto',
    },
  ];
  textValidationOptions = [];
  timeoutId: any = null;
  validationsForResponseType: Record<
    string,
    {
      title: string;
      validations?: Array<OptionInList>;
    }
  > = {
    text: {
      title: 'TIPO DE RESPUESTA',
      validations: [
        {
          name: 'max12',
          label: 'Menos de 12 Palabras',
        },
        {
          name: 'number',
          label: 'Número',
        },
        {
          name: 'min12',
          label: 'Mas de 12 palabras',
        } /*
        {
          name: 'decimal',
          label: 'Monto de dinero',
        },*/,
      ],
    },
    multiple: {
      title: 'OPCIONES DE RESPUESTAS (*)',
    },
    'contact-info': {
      title: 'OPCIONES DE CONTACTOS',
      validations: [
        {
          name: 'name',
          label: 'Nombre y Apellido',
        },
        {
          name: 'phone',
          label: 'Teléfono',
        },
        {
          name: 'email',
          label: 'Correo electrónico',
        },
      ],
    },
  };
  @ViewChild('stepsSwiper') stepsSwiper: SwiperComponent;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  videoFiles: string[] = [
    'video/mp4',
    'video/webm',
    'video/m4v',
    'video/mpg',
    'video/mp4',
    'video/mpeg',
    'video/mpeg4',
    'video/mov',
    'video/3gp',
    'video/mts',
    'video/m2ts',
    'video/mxf',
  ];
  audioFiles: string[] = [];
  webform: Webform;
  aboveFilesDraggingArea: boolean = false;
  item: Item;
  existingQuestions: Record<string, Question> = null;
  routeParamsSubscription: Subscription;
  questionsToDelete: Array<string> = [];
  currentStepStatus: 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED' = 'INVALID';
  dragStartX: number = null;
  MIN_SWIPE_DISTANCE = 15; // adjust this value as needed
  requiredFieldsReminderOpened: boolean = false;
  answerLimitOptionsForMultipleSelection = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ];
  requiredFieldInterval: any = null;
  returnTo: string;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webformsService: WebformsService,
    private itemsService: ItemsService,
    private headerService: HeaderService,
    private authService: AuthService,
    private merchantService: MerchantsService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.returnTo = this.route.snapshot.queryParams['returnTo'];
    this.routeParamsSubscription = this.route.params.subscribe(
      async ({ itemId, formId }) => {
        const user = await this.authService.me();
        const myMerchant = await this.merchantService.merchantDefault(
          user?._id
        );

        lockUI();

        if (itemId) this.item = await this.itemsService.item(itemId);

        const isUserTheOwner = this.item
          ? myMerchant?._id === this.item.merchant._id
          : null;

        if (itemId && !isUserTheOwner) this.router.navigate(['/auth/login']);

        if(this.webformsService.formCreationData?.steps?.length === 0) {
          this.webformsService.formCreationData = null;
        } 

        if (itemId && !formId && this.item.webForms?.length > 0)
          formId = this.item.webForms[0].reference;
        if (this.webformsService.formCreationData === null && !formId) {
          this.webformsService.formCreationData = {
            currentStep: this.currentStepName,
            steps: this.steps,
            currentStepIndex: this.currentStepIndex,
          };

          this.steps.push({
            name: 'ADMIN_NOTE',
            fields: new FormGroup({
              note: new FormControl(''),
            }),
          });
        } else if (this.webformsService.formCreationData !== null) {
          this.steps = this.webformsService.formCreationData.steps;

          if (formId) this.webform = await this.webformsService.webform(formId);
        } else if (this.webformsService.formCreationData === null && formId) {

          const isFormPartOfTheRoutesItem = this.item.webForms.find(
            (form) => form.reference === formId
          );

          if (!isFormPartOfTheRoutesItem)
            this.router.navigate(['/others/error-screen']);

          this.webform = await this.webformsService.webform(formId);

          this.steps.push({
            name: 'ADMIN_NOTE',
            fields: new FormGroup({
              note: new FormControl(this.webform.description),
            }),
          });

          for await (const question of this.webform.questions) {
            await this.addExistingQuestionToTheForm(question);

            this.existingQuestions = {
              [question._id]: question,
            };
          }

          this.webformsService.formCreationData = {
            currentStep: this.currentStepName,
            currentStepIndex: this.currentStepIndex,
            steps: this.steps,
          };
        }

        this.requiredFieldInterval = setInterval(() => {
          if (
            this.currentStepStatus === 'INVALID' &&
            this.currentStepIndex > 0
          ) {
            this.snackbar.open(
              'Parece que faltan algunos campos requeridos en esta pregunta, están indicados por (*)',
              'Cerrar',
              {
                duration: 3000,
              }
            );
          }
        }, 30000);

        unlockUI();
        console.log("desbloqueado");
      }
    );
  }

  start() {
    if (this.steps.length === 1) this.addAQuestionToTheForm();

    setTimeout(() => {
      this.stepsSwiper.directiveRef.setIndex(1);
    }, 200);
  }

  ngAfterViewInit(): void {
    if (this.webformsService.formCreationData) {
      setTimeout(() => {
        this.stepsSwiper.directiveRef.setIndex(
          this.webformsService.formCreationData.currentStepIndex
        );
      }, 200);
    }
  }

  addExistingQuestionToTheForm = async (question: Question) => {
    let type = 'text';
    let responseOptions = null;
    let freeResponseAllowed = false;
    let limitedToJustOneAnswer = false;

    let baseFields: any = {
      question: new FormControl(question.value, Validators.required),
      selectedResponseValidation: new FormControl('', Validators.required),
      selectedResponseType: new FormControl('', Validators.required),
    };

    if (question.type === 'multiple' || question.type === 'multiple-text') {
      type = 'multiple';

      delete baseFields.selectedResponseValidation;

      if (!question.answerDefault[0].isMedia) {
        responseOptions = new FormArray(
          question.answerDefault.map(
            (option) =>
              new FormGroup({
                text: new FormControl(
                  option.isMedia ? option.label : option.value,
                  Validators.required
                ),
                fileInput: new FormControl(
                  option.isMedia ? option.value : null
                ), // the file input value will be a File object
              })
          ),
          Validators.compose([this.validateResponseOptions])
        );
        (responseOptions as FormArray).push(
          new FormGroup({
            text: new FormControl(''),
            fileInput: new FormControl(null), // the file input value will be a File object
          })
        );
      } else {
        async function fetchAndConvertRoutes(imageRoutes) {
          const files = [];
          for await (const route of imageRoutes) {
            const response = await fetch(route);
            const blob = await response.blob();
            const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
            files.push(file);
          }
          return files;
        }

        //Converts every imageRoute into a File Object
        const imageRoutes = question.answerDefault.map(
          (option) => option.value
        );

        const files = await fetchAndConvertRoutes(imageRoutes);

        //console.log('question.answerDefault', question.answerDefault);
        //console.log('responseOptions', responseOptions);

        responseOptions = new FormArray(
          question.answerDefault.map(
            (option, index) =>
              new FormGroup({
                text: new FormControl(option.label),
                fileInput: new FormControl(option.value), // the file input value will be a File object,
                originalFile: new FormControl(files[index]),
              })
          ),
          [this.validateResponseOptions]
        );
      }

      if (question.type === 'multiple-text') freeResponseAllowed = true;
      if (question.answerLimit === 1) limitedToJustOneAnswer = true;
    }

    if (question.type === 'text' && question.answerTextType === 'default') {
      type = 'text';
    }

    if (
      question.type === 'text' &&
      ['max12', 'min12', 'number', 'decimal'].includes(question.answerTextType)
    ) {
      type = 'text';

      baseFields.selectedResponseValidation = new FormControl(
        question.answerTextType,
        Validators.required
      );
    }

    if (
      question.type === 'text' &&
      ['email', 'name', 'phone'].includes(question.answerTextType)
    ) {
      type = 'contact-info';

      baseFields.selectedResponseValidation = new FormControl(
        question.answerTextType,
        Validators.required
      );
    }

    baseFields.required = new FormControl(Boolean(question.required));

    baseFields.selectedResponseType = new FormControl(
      type,
      Validators.required
    );

    baseFields.id = new FormControl(question._id);

    if (responseOptions) {
      baseFields.responseOptions = responseOptions;
      baseFields.freeResponseAllowed = new FormControl(freeResponseAllowed);
      baseFields.limitedToOneSelection = new FormControl(
        limitedToJustOneAnswer
      );
      baseFields.answerLimit = new FormControl(question.answerLimit);
    }

    this.steps.push({
      name: 'QUESTION_EDITION',
      fields: new FormGroup(baseFields),
    });
  };

  validateResponseOptions(formArray: FormArray): ValidationErrors | null {
    let isValid = false;

    formArray.controls.forEach((control) => {
      const group = control as FormGroup;
      const text = group.controls.text.value;
      const fileInput = group.controls.fileInput.value;

      if (text !== '' || fileInput) {
        isValid = true;
      }
    });

    if (isValid) {
      return null;
    }

    return { required: true };
  }

  addAQuestionToTheForm(navigateToNextQuestion = false) {
    this.steps.push({
      name: 'QUESTION_EDITION',
      fields: new FormGroup({
        question: new FormControl('', Validators.required),
        selectedResponseType: new FormControl('', Validators.required),
        selectedResponseValidation: new FormControl('', Validators.required),
        required: new FormControl(false),
      }),
    });

    if (navigateToNextQuestion) {
      setTimeout(() => {
        this.stepsSwiper.directiveRef.setIndex(this.currentStepIndex + 1);
      }, 100);
    }
  }

  templateStyles() {
    return { 'grid-template-columns': `repeat(${this.steps.length}, 1fr)` };
  }

  selectOptionInList(listName: string, value: string) {
    const selectedOption =
      this.steps[this.currentStepIndex].fields.controls[listName].value;
    let validationsOptionsFieldControl = this.steps[
      this.currentStepIndex
    ].fields.get('selectedResponseValidation');

    const isFalsy = (text: string) =>
      text === null || text === undefined || text === '';

    if (
      (isFalsy(selectedOption) &&
        !isFalsy(value) &&
        selectedOption !== value) ||
      (!isFalsy(selectedOption) && !isFalsy(value) && selectedOption !== value)
    ) {
      this.steps[this.currentStepIndex].fields.controls[listName].setValue(
        value
      );
    } else if (selectedOption === value) {
      this.steps[this.currentStepIndex].fields.controls[listName].setValue(
        null
      );
    }

    /*
    console.log(
      'responseOptions',
      this.steps[this.currentStepIndex].fields.controls['responseOptions']
    );
    console.log('value', value);
    console.log('listName', listName);
    console.log(
      'validationsOptionsFieldControl',
      validationsOptionsFieldControl
    );*/

    //If the admin select a response with multiple options for the user to choose,
    //then the formArray is saved on the steps.fields.controls['responseOptions'] variable.
    if (
      listName === 'selectedResponseType' &&
      value === 'multiple' &&
      !this.steps[this.currentStepIndex].fields.controls['responseOptions']
    ) {
      //console.log('A');
      this.steps[this.currentStepIndex].fields.addControl(
        'responseOptions',
        new FormArray(
          [
            new FormGroup({
              text: new FormControl(''),
              fileInput: new FormControl(null), // the file input value will be a File object
            }),
            new FormGroup({
              text: new FormControl(''),
              fileInput: new FormControl(null), // the file input value will be a File object
            }),
          ],
          Validators.compose([this.validateResponseOptions])
        )
      );
      this.steps[this.currentStepIndex].fields.addControl(
        'freeResponseAllowed',
        new FormControl(false)
      );
      this.steps[this.currentStepIndex].fields.addControl(
        'limitedToOneSelection',
        new FormControl(false)
      );
      this.steps[this.currentStepIndex].fields.addControl(
        'answerLimit',
        new FormControl(0)
      );

      validationsOptionsFieldControl.setValidators([]);
      validationsOptionsFieldControl.updateValueAndValidity();
    } else if (
      listName === 'selectedResponseType' &&
      value === 'multiple' &&
      this.steps[this.currentStepIndex].fields.controls['responseOptions']
    ) {
      this.removeOptionSelectionValidators();
    } else if (
      value !== 'multiple' &&
      listName === 'selectedResponseType' &&
      !validationsOptionsFieldControl
    ) {
      this.steps[this.currentStepIndex].fields.addControl(
        'selectedResponseValidation',
        new FormControl('', Validators.required)
      );
      validationsOptionsFieldControl = this.steps[
        this.currentStepIndex
      ].fields.get('selectedResponseValidation');
      validationsOptionsFieldControl?.setValidators([Validators.required]);
      validationsOptionsFieldControl?.updateValueAndValidity();
      this.removeOptionSelectionValidators();
    } else if (
      value !== 'multiple' &&
      listName === 'selectedResponseType' &&
      validationsOptionsFieldControl
    ) {
      validationsOptionsFieldControl?.setValidators([Validators.required]);
      validationsOptionsFieldControl?.updateValueAndValidity();
      this.removeOptionSelectionValidators();
    }
  }

  removeOptionSelectionValidators() {
    this.steps[this.currentStepIndex].fields.removeControl('responseOptions');
    this.steps[this.currentStepIndex].fields.removeControl(
      'freeResponseAllowed'
    );
    this.steps[this.currentStepIndex].fields.removeControl(
      'limitedToOneSelection'
    );
    this.steps[this.currentStepIndex].fields.removeControl('answerLimit');
  }

  updateCurrentStepData(swiper: Swiper) {
    if (this.steps.length > 0) {
      this.currentStepIndex = swiper.activeIndex;
      this.webformsService.formCreationData.currentStepIndex =
        this.currentStepIndex;
      this.currentStepName = this.steps[this.currentStepIndex]
        .name as WebformCreatorStepsNames;

      this.currentStepStatus = this.steps[this.currentStepIndex].fields
        .status as any;

      if (!this.steps[this.currentStepIndex].statusChangeSubscription) {
        this.steps[this.currentStepIndex].statusChangeSubscription = this.steps[
          this.currentStepIndex
        ].fields.statusChanges.subscribe((change) => {
          this.currentStepStatus = change;

          if (this.currentStepStatus === 'INVALID') {
            this.swiperConfig.allowSlidePrev = false;
            this.swiperConfig.allowSlideNext = false;
            this.swiperConfig.allowTouchMove = false;
          } else {
            this.swiperConfig.allowSlidePrev = true;
            this.swiperConfig.allowSlideNext = true;
            this.swiperConfig.allowTouchMove = true;
          }
        });
      }

      //console.log('EMPEZO LA TRANSICION', this.currentStepStatus);
    }
  }

  stepsTransitionEnd() {
    if (this.currentStepStatus === 'INVALID' && this.currentStepIndex > 0) {
      this.swiperConfig.allowSlidePrev = false;
      this.swiperConfig.allowSlideNext = false;
      this.swiperConfig.allowTouchMove = false;
    } else if (
      this.currentStepStatus === 'VALID' &&
      this.currentStepIndex > 0
    ) {
      this.swiperConfig.allowSlidePrev = true;
      this.swiperConfig.allowSlideNext = true;
      this.swiperConfig.allowTouchMove = true;
    }

    //console.log('TERMINO LA TRANSICION', this.currentStepStatus);
  }

  getFormArray(data: any): FormArray {
    //console.log('EJECUTANDO 2');
    return data;
  }

  getFormGroup(data: any): FormGroup {
    //console.log('EJECUTANDO');
    return data;
  }

  getFormControl(data: any): FormControl {
    //console.log('EJECUTANDO');
    return data;
  }

  onMultipleInputEnterPress(
    event: any,
    fieldformArray: any,
    textOrImage: string,
    index: number
  ) {
    const formArray = this.steps[this.currentStepIndex].fields.get(
      'responseOptions'
    ) as FormArray;

    if (index + 1 === formArray.controls.length) {
      if (this.timeoutId) clearTimeout(this.timeoutId);

      this.timeoutId = setTimeout(() => {
        formArray.push(
          new FormGroup({
            text: new FormControl(''),
            fileInput: new FormControl(null), // the file input value will be a File object
          })
        );
      }, 1000);
    }

    if (event.key === 'Backspace' && this.timeoutId)
      clearTimeout(this.timeoutId);

    /*
    if (index + 1 === fieldformArray.length) {
      if (this.timeoutId) clearTimeout(this.timeoutId);

      this.timeoutId = setTimeout(() => {
        callback(fieldformArray, fieldName);
      }, 1000);
    }

    if (event.key === 'Backspace' && this.timeoutId)
      clearTimeout(this.timeoutId);
    */
  }

  removeInputToCurrentFormArray(
    fieldformArray: FormArray,
    textOrImage: string,
    fieldIndex: number
  ): void {
    let newIndexToFocus: string =
      fieldformArray.controls.length - 1 === fieldIndex
        ? String(fieldIndex - 1)
        : String(fieldIndex);

    fieldformArray.removeAt(fieldIndex);

    if (
      this.steps[this.currentStepIndex].fields.controls['responseOptions']
        ?.value?.length === 0
    ) {
      this.steps[this.currentStepIndex].fields.removeControl('responseOptions');
      this.steps[this.currentStepIndex].fields.addControl(
        'responseOptions',
        new FormArray(
          [
            new FormGroup({
              text: new FormControl(''),
              fileInput: new FormControl(null), // the file input value will be a File object
            }),
            new FormGroup({
              text: new FormControl(''),
              fileInput: new FormControl(null), // the file input value will be a File object
            }),
          ],
          [this.validateResponseOptions]
        )
      );
      this.steps[this.currentStepIndex].fields.updateValueAndValidity();

      this.currentStepStatus = this.steps[this.currentStepIndex].fields
        .status as any;
    }

    setTimeout(() => {
      if (textOrImage === 'text') {
        {
          document
            .getElementById(
              'step-' + this.currentStepIndex + '-field-text' + newIndexToFocus
            )
            .focus();
        }
      }
    }, 100);
  }

  async loadFile(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    if (!fileList.length) return;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);

      if (
        ![...this.imageFiles, ...this.videoFiles, ...this.audioFiles].includes(
          file.type
        )
      )
        return;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (e) => {
        (
          this.steps[this.currentStepIndex].fields.controls[
            'responseOptions'
          ] as FormArray
        ).push(
          new FormGroup({
            text: new FormControl(''),
            fileInput: new FormControl(file),
            fileData: new FormControl(reader.result),
          })
        );
      };
    }
  }

  async dropTagDraggable(event: CdkDragDrop<{ gridItem: any; index: number }>) {
    let gridArray = this.steps[this.currentStepIndex].fields.controls[
      'responseOptions'
    ]?.value as Array<{
      text: string;
      fileInput: any;
      fileData?: any;
      originalFile?: any;
      index: number;
    }>;

    gridArray[event.previousContainer.data.index].index =
      event.container.data.index;
    gridArray[event.container.data.index].index =
      event.previousContainer.data.index;
    gridArray[event.previousContainer.data.index] =
      event.container.data.gridItem;
    gridArray[event.container.data.index] =
      event.previousContainer.data.gridItem;

    (
      this.webformsService.formCreationData.steps[this.currentStepIndex].fields
        .controls['responseOptions'] as FormArray
    ).clear();

    for (const optionInGrid of gridArray) {
      (
        this.webformsService.formCreationData.steps[this.currentStepIndex]
          .fields.controls['responseOptions'] as FormArray
      ).push(
        new FormGroup({
          text: new FormControl(''),
          fileInput: new FormControl(optionInGrid.fileInput), // the file input value will be a File object,
          fileData: new FormControl(optionInGrid.fileData), // the file input value will be a File object,
          originalFile: new FormControl(optionInGrid.originalFile),
        })
      );
    }
  }

  getBackgroundImage(src: string, elementId: string) {
    const image = new Image();

    const element = document.getElementById(elementId);

    image.onload = () => {
      // Set the background image when the image has finished loading
      element.style.backgroundImage = `url('${image.src}')`;
    };

    image.src = src;
  }

  pointerMove(event: MouseEvent) {
    let dragginFiles = false;

    const targetElementClasses = Array.from(
      (event.target as HTMLElement).classList
    );

    for (const targetClass of targetElementClasses) {
      if (
        [
          'grid-for-media-files',
          'drag-item-wrapper',
          'media-item',
          'example-custom-placeholder',
        ].includes(targetClass) &&
        !dragginFiles
      ) {
        dragginFiles = true;
      }
    }

    if (dragginFiles && this.currentStepStatus === 'VALID') {
      //console.log("DESACTIVANDO");
      this.swiperConfig.allowSlidePrev = false;
      this.swiperConfig.allowSlideNext = false;
      this.swiperConfig.allowTouchMove = false;
    }

    if (!dragginFiles && this.currentStepStatus === 'VALID') {
      //console.log("ACTIVANDO");
      this.swiperConfig.allowSlidePrev = true;
      this.swiperConfig.allowSlideNext = true;
      this.swiperConfig.allowTouchMove = true;
    }
  }

  async saveOrUpdate() {
    if (this.currentStepStatus === 'INVALID') {
      await this.saveFormWithoutCurrentQuestion();

      return;
    }

    const questionsToAdd = this.getQuestionsToAdd();

    if (!this.webform && questionsToAdd.length === 0) return this.back();

    if (this.webform && questionsToAdd.length === 0) {
      return this.snackbar.open('Formulario vacio', 'Cerrar', {
        duration: 3000,
      });
    }

    await this.finishFormSubmission(questionsToAdd);
  }

  async finishFormSubmission(questionsToAdd: ExtendedQuestionInput[]) {
    if (!this.item) {
      this.itemsService.questionsToAddToItem = questionsToAdd;
      if(this.returnTo === 'admin-article-detail') {
        this.router.navigate(['ecommerce/admin-article-detail']);
      } else {
        this.router.navigate(['ecommerce/item-management']);
      }
      //this.router.navigate(['ecommerce/item-management']);
    }

    let createdWebform = null;
    if (!this.webform && this.item) {
      lockUI();
      const webformToCreate: WebformInput = {
        name: this.item.name
          ? 'Formulario para el producto ' + this.item.name
          : 'Formulario para el producto',
        description: this.steps[0].fields.controls['note'].value,
      };

      try {
        createdWebform = await this.webformsService.createWebform(
          webformToCreate
        );

        if (createdWebform) {
          questionsToAdd.forEach((question) => {
            if (!question.answerDefault) {
              question.answerDefault = [];
            }
          });

          const largeInputQuestions: QuestionInput[] = questionsToAdd.filter(
            (question) => question.answerDefault?.length > 20
          );
          const smallInputQuestions: QuestionInput[] = questionsToAdd.filter(
            (question) =>
              question.answerDefault?.length <= 20 || !question.answerDefault
          );

          if (smallInputQuestions.length > 0) {
            await this.webformsService.webformAddQuestion(
              smallInputQuestions,
              createdWebform._id
            );
          }

          if (largeInputQuestions.length > 0) {
            for await (const question of largeInputQuestions) {
              const answerDefault = question.answerDefault;

              const partsInAnswerDefault = [];

              for (let i = 0; i < Math.ceil(answerDefault.length / 20); i++) {
                const topLimit = i * 20 + 20;
                const lowerLimit = i * 20;
                partsInAnswerDefault.push(
                  answerDefault.slice(lowerLimit, topLimit)
                );
              }

              question.answerDefault = partsInAnswerDefault[0];

              try {
                const results = await this.webformsService.webformAddQuestion(
                  [question],
                  createdWebform._id
                );

                if (results && partsInAnswerDefault.length > 1) {
                  for (let i = 1; i < partsInAnswerDefault.length; i++) {
                    const questionId =
                      results.questions[results.questions.length - 1]._id;
                    const answerDefault = partsInAnswerDefault[i];
                    const result =
                      await this.webformsService.questionAddAnswerDefault(
                        answerDefault,
                        questionId,
                        results._id
                      );
                  }
                }
              } catch (error) {
                this.snackbar.open('Error al crear el formulario', 'Cerrar', {
                  duration: 3000,
                });
                console.error(error);
              }
            }
          }

          await this.webformsService.itemAddWebForm(
            this.item._id,
            createdWebform._id
          );

          unlockUI();

          this.webformsService.formCreationData = null;
          if(this.returnTo === 'admin-article-detail') {
            this.router.navigate(['ecommerce/admin-article-detail/' + this.item._id]);
          } else {
            this.router.navigate(['ecommerce/item-management/' + this.item._id]);
          }
        } else {
          //console.log('NO SE CREO');
          throw new Error('Ocurrió un error al crear el formulario');
        }
      } catch (error) {
        unlockUI();

        this.snackbar.open('Error al crear el formulario', 'Cerrar', {
          duration: 3000,
        });
        console.error(error);
      }
    } else if(this.webform && this.item) {
      try {
        const toUpdate = questionsToAdd.filter((question) => question.id);
        const toAdd = questionsToAdd.filter((question) => !question.id);

        for await (const question of toUpdate) {
          if (!question.answerDefault) {
            question.answerDefault = [];
          }

          const questionId = question.id;

          delete question.id;

          const hasSmallSetOfOptionsOrNoneAtAll =
            question.answerDefault?.length <= 20 || !question.answerDefault;
          const hasLargeSetOfOptions = question.answerDefault?.length > 20;

          //If the question doesn't have selectable options or has 20 options or less
          if (hasSmallSetOfOptionsOrNoneAtAll) {
            question.answerDefault = !question.answerDefault
              ? []
              : question.answerDefault;

            lockUI();

            await this.webformsService.webformUpdateQuestion(
              question,
              questionId,
              this.webform._id
            );

            unlockUI();
          }

          //If the question has more than 20 options
          if (hasLargeSetOfOptions) {
            const answerDefault = question.answerDefault;

            const partsInAnswerDefault = [];

            for (let i = 0; i < Math.ceil(answerDefault.length / 20); i++) {
              const topLimit = i * 20 + 20;
              const lowerLimit = i * 20;
              partsInAnswerDefault.push(
                answerDefault.slice(lowerLimit, topLimit)
              );
            }

            question.answerDefault = partsInAnswerDefault[0];

            try {
              lockUI();
              const results = await this.webformsService.webformUpdateQuestion(
                question,
                questionId,
                this.webform._id
              );

              if (results && partsInAnswerDefault.length > 1) {
                for (let i = 1; i < partsInAnswerDefault.length; i++) {
                  const answerDefault = partsInAnswerDefault[i];

                  await this.webformsService.questionAddAnswerDefault(
                    answerDefault,
                    questionId,
                    this.webform._id
                  );
                }

                unlockUI();
              } else unlockUI();
            } catch (error) {
              this.snackbar.open('Error al crear el formulario', 'Cerrar', {
                duration: 3000,
              });
              console.error(error);
            }
          }
        }

        if (toAdd.length > 0) {
          lockUI();

          for await (const question of toAdd) {
            if (!question.answerDefault) {
              question.answerDefault = [];
            }
          }

          const largeInputQuestions: QuestionInput[] = toAdd.filter(
            (question) => question.answerDefault?.length > 20
          );
          const smallInputQuestions: QuestionInput[] = toAdd.filter(
            (question) =>
              question.answerDefault?.length <= 20 || !question.answerDefault
          );

          if (smallInputQuestions.length > 0) {
            await this.webformsService.webformAddQuestion(
              smallInputQuestions,
              this.webform._id
            );
          }

          if (largeInputQuestions.length > 0) {
            for await (const question of largeInputQuestions) {
              const answerDefault = question.answerDefault;

              const partsInAnswerDefault = [];

              for (let i = 0; i < Math.ceil(answerDefault.length / 20); i++) {
                const topLimit = i * 20 + 20;
                const lowerLimit = i * 20;
                partsInAnswerDefault.push(
                  answerDefault.slice(lowerLimit, topLimit)
                );
              }

              question.answerDefault = partsInAnswerDefault[0];

              try {
                const results = await this.webformsService.webformAddQuestion(
                  [question],
                  this.webform._id
                );

                if (results && partsInAnswerDefault.length > 1) {
                  for (let i = 1; i < partsInAnswerDefault.length; i++) {
                    const questionId =
                      results.questions[results.questions.length - 1]._id;
                    const answerDefault = partsInAnswerDefault[i];
                    const result =
                      await this.webformsService.questionAddAnswerDefault(
                        answerDefault,
                        questionId,
                        results._id
                      );
                  }
                }
              } catch (error) {
                this.snackbar.open('Error al crear el formulario', 'Cerrar', {
                  duration: 3000,
                });
                console.error(error);
              }
            }
          }
        }

        if (this.questionsToDelete.length > 0)
          await this.webformsService.webformRemoveQuestion(
            this.questionsToDelete,
            this.webform._id
          );

        await this.webformsService.updateWebform(this.webform._id, {
          description: this.steps[0].fields.controls['note'].value,
        });

        unlockUI();

        this.webformsService.formCreationData = null;
        if(this.returnTo === 'admin-article-detail') {
          this.router.navigate(['ecommerce/admin-article-detail/' + this.item._id]);
        } else {
          this.router.navigate(['ecommerce/item-management/' + this.item._id]);
        }
      } catch (error) {
        unlockUI();

        this.snackbar.open('Error al crear el formulario', 'Cerrar', {
          duration: 3000,
        });
        console.error(error);
      }
    }
  }

  async saveFormWithoutCurrentQuestion() {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Guardar cambios`,
        description: `¿Quieres guardar el formulario sin esta pregunta que está incompleta?`,
      },
      panelClass: 'confirmation-dialog'
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === 'confirm') {
        this.deleteCurrentQuestion();
        const questionsToAdd = this.getQuestionsToAdd();
        await this.finishFormSubmission(questionsToAdd);
      }
    });
  }

  getQuestionsToAdd(): Array<ExtendedQuestionInput> {
    const questionSteps = this.steps.slice(1);

    const questionsToAdd = questionSteps.map((step, index) => {
      const question: ExtendedQuestionInput = {
        type: null,
        value: step.fields.controls['question'].value,
        index,
        subIndex: 0,
        required: step.fields.controls['required'].value,
      };

      if (this.webform && step.fields.controls['id']) {
        question.id = step.fields.controls['id'].value;
      }

      const responseTypeFromFormControls =
        step.fields.controls['selectedResponseType'].value;
      const responseTypeValidationFromFormControls =
        step.fields.controls['selectedResponseValidation']?.value;

      let responseTypeForQuestion = null;

      switch (responseTypeFromFormControls) {
        case 'text':
          responseTypeForQuestion = 'text';

          question.answerTextType = responseTypeValidationFromFormControls;

          break;
        case 'multiple':
          responseTypeForQuestion = 'multiple';

          let options = step.fields.controls['responseOptions']
            ?.value as Array<{
            text: string;
            fileInput: any;
            originalFile?: any;
          }>;

          const areOptionsFiles =
            step.fields.controls['responseOptions']?.value[0].fileInput !==
            null;

          if (!areOptionsFiles) {
            options = options.slice(0, -1);
          }

          if (!areOptionsFiles) {
            question.answerDefault = options.map((option) => {
              const returnValue: AnswerDefaultInput = {
                active: true,
                isMedia: false,
                value: option.text,
              };

              return returnValue;
            });
          } else {
            question.answerDefault = options.map((option) => {
              const returnValue: AnswerDefaultInput = {
                active: true,
                isMedia: true,
                media:
                  (typeof option.fileInput === 'string' &&
                    option.fileInput.slice(0, 5) === 'blob:') ||
                  (typeof option.fileInput === 'string' &&
                    option.fileInput.includes('https'))
                    ? option.originalFile
                    : option.fileInput,
              };

              return returnValue;
            });
          }

          const shouldAcceptUsersResponse =
            step.fields.controls['freeResponseAllowed']?.value;

          if (shouldAcceptUsersResponse)
            responseTypeForQuestion = 'multiple-text';

          const limitedToJustOneAnswer =
            step.fields.controls['limitedToOneSelection']?.value;

          const customLimit = Number(
            step.fields.controls['answerLimit']?.value
          );

          console.log('LIMITE CUSTOM', customLimit);

          if (limitedToJustOneAnswer) question.answerLimit = 1;
          else if (customLimit) question.answerLimit = customLimit;

          question.answerTextType = 'DEFAULT';

          break;
        case 'contact-info':
          responseTypeForQuestion = 'text';

          question.answerTextType = responseTypeValidationFromFormControls;

          break;
      }

      question.type = responseTypeForQuestion;

      return question;
    });

    return questionsToAdd;
  }

  showDeleteQuestionDialog() {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Borrar pregunta`,
        description: `¿Estás seguro de que deseas borrar esta pregunta?`,
      },
      panelClass: 'confirmation-dialog'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.deleteCurrentQuestion();
      }
    });
  }

  deleteCurrentQuestion() {
    if (this.webform && this.steps[this.currentStepIndex].fields.controls['id'])
      this.questionsToDelete.push(
        this.steps[this.currentStepIndex].fields.controls['id'].value
      );

    this.steps.splice(this.currentStepIndex, 1);

    this.stepsSwiper.directiveRef.update();

    if (this.currentStepIndex === this.steps.length - 1) {
      this.stepsSwiper.directiveRef.setIndex(this.currentStepIndex - 1);
    }
  }

  back() {
    if(this.returnTo === 'admin-article-detail') {
      this.router.navigate(['/ecommerce/admin-article-detail/' + this.item?._id]);
    } else {
      this.router.navigate(['/ecommerce/item-management/' + this.item?._id]);
    }
  }

  redirectToMediaUploadPage(optionIndex: number) {
    console.log('REDIRGIENDO AL MEDIA UPLOAD');

    this.router.navigate(['/admin/media-upload/webform-question'], {
      queryParams: {
        webformQuestionIndex: this.currentStepIndex - 1,
        webformSelectedOption: optionIndex,
        itemId: this.item?._id,
      },
    });
  }

  ngOnDestroy(): void {
    this.routeParamsSubscription.unsubscribe();

    for (const step of this.steps) {
      if (step.statusChangeSubscription) {
        step.statusChangeSubscription.unsubscribe();
      }
    }

    clearInterval(this.requiredFieldInterval);
  }

  // Define a constant for the minimum distance to consider a swipe

  startDragging(eventData: [Swiper, PointerEvent]) {
    const [swiper, event] = eventData;
    this.dragStartX = swiper.touches.startX;
  }

  endDragging(eventData: [Swiper, PointerEvent]) {
    const [swiper, event] = eventData;
    let swipeDirection: SwipeDirection = null;

    const endX = swiper.touches.currentX;
    const dragDistance = Math.abs(swiper.touches.currentX - this.dragStartX);

    if (this.dragStartX !== null && dragDistance >= this.MIN_SWIPE_DISTANCE) {
      if (this.dragStartX < endX) {
        swipeDirection = 'LEFT';
      } else {
        swipeDirection = 'RIGHT';
      }
    }

    /*
    console.log(
      swipeDirection === 'LEFT',
      this.currentStepStatus === 'INVALID'
    );*/

    if (
      swipeDirection === 'LEFT' &&
      this.currentStepStatus === 'INVALID' &&
      this.currentStepIndex > 0
    ) {
      this.executeActionsToTakeWhenCurrentQuestionIsInvalidWhileSwiping('LEFT');
    } else if (
      swipeDirection === 'RIGHT' &&
      this.currentStepStatus === 'INVALID' &&
      this.currentStepIndex > 0 &&
      this.currentStepIndex !== this.steps.length - 1
    ) {
      this.executeActionsToTakeWhenCurrentQuestionIsInvalidWhileSwiping(
        'RIGHT'
      );
    }

    this.dragStartX = null;
  }

  executeActionsToTakeWhenCurrentQuestionIsInvalidWhileSwiping(
    swipingDirection: 'LEFT' | 'RIGHT'
  ) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Pregunta incompleta`,
        description: `¿Quieres borrar el progreso de esta pregunta?`,
      },
      panelClass: 'confirmation-dialog'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        if (
          this.webform &&
          this.steps[this.currentStepIndex].fields.controls['id']
        )
          this.questionsToDelete.push(
            this.steps[this.currentStepIndex].fields.controls['id'].value
          );

        this.steps.splice(this.currentStepIndex, 1);

        this.stepsSwiper.directiveRef.update();

        if (this.currentStepIndex === this.steps.length - 1) {
          this.stepsSwiper.directiveRef.setIndex(this.currentStepIndex - 1);
        }
      }
    });
  }
}
