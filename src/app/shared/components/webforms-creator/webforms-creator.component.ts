import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { ItemOrder } from 'src/app/core/models/order';
import { User } from 'src/app/core/models/user';
import { WebformInput, QuestionInput } from 'src/app/core/models/webform';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { SwiperOptions } from 'swiper';
import { DescriptionDialogComponent } from '../../dialogs/description-dialog/description-dialog.component';
import { GeneralDialogComponent } from '../general-dialog/general-dialog.component';
import { WebformAddAnotherQuestionComponent } from '../webform-add-another-question/webform-add-another-question.component';
import { WebformMultipleSelectionConfirmationComponent } from '../webform-multiple-selection-confirmation/webform-multiple-selection-confirmation.component';
import { WebformQuestionDialogComponent } from '../webform-question-dialog/webform-question-dialog.component';

const generalDialogContainerStyles = {
  background: 'rgb(255, 255, 255)',
  borderRadius: '12px',
  opacity: '1',
  padding: '37px 29.6px 13.2px 22px',
};

const generalDialogHeaderStyles = {
  fontSize: '21px',
  fontFamily: 'SfProBold',
  color: '#4F4F4F',
  marginBottom: '25px',
  marginTop: '0',
};

const selectionStyles = {
  display: 'block',
  fontFamily: '"SfProRegular"',
  marginLeft: '10px',
};

@Component({
  selector: 'app-webforms-creator',
  templateUrl: './webforms-creator.component.html',
  styleUrls: ['./webforms-creator.component.scss'],
})
export class WebformsCreatorComponent implements OnInit {
  @Input() opened = false;
  @Input() item: Item = null;
  @Input() user: User = null;
  @Input() resumingCreation: boolean = false;
  @Output() closeEvent = new EventEmitter();
  swiperConfig: SwiperOptions = null;
  dialogFlowFunctions: Record<string, any> = {};
  currentQuestion: string = null;
  currentQuestionIndex: number = 0;
  currentQuestionRequired: boolean = false;
  answerTypes = {
    OPEN_ANSWER: 'Escribiendo libremente',
    SELECTION_ANSWER: 'Seleccionando entre opciones',
    CONTACT_INFO: 'Escribiendo info de contacto',
    FULL_NAME: 'Nombre y Apellido',
    EMAIL: 'Correo Electrónico',
    PHONE_NUMBER: 'Número de Celular (WhatsApp)',
  };
  optionalQuestions: number = 0;
  requiredQuestions: number = 0;
  contactInfoDialogVisible: boolean = false;
  status:
    | 'SHOWING_DIALOG_FLOW'
    | 'ASKING_FOR_ANOTHER_QUESTION'
    | 'SHOWING_SELECTIONS_EDITOR'
    | 'ENDED_CREATION' = 'SHOWING_DIALOG_FLOW';
  questionDialog: EmbeddedComponentWithId = {
    component: WebformQuestionDialogComponent,
    componentId: 'question',
    inputs: {
      dialogFlowConfig: {
        flowId: 'webform-creator',
        dialogId: 'question',
      },
      onActiveSlideCallback: (params) => {
        const questionDialog =
          this.dialogFlowService.dialogsFlows['webform-creator']['question'];

        if (
          questionDialog?.fields &&
          questionDialog?.fields.textarea &&
          questionDialog?.fields.textarea.length
        ) {
          questionDialog.swiperConfig.allowSlideNext = true;
        } else {
          setTimeout(() => {
            questionDialog.swiperConfig.allowSlideNext = false;
          });
        }
      },
    },
    outputs: [
      {
        name: 'inputDetected',
        callback: (question) => {
          this.currentQuestion = question;

          if (this.currentQuestion && this.currentQuestion.length) {
            this.swiperConfig.allowSlideNext = true;
            this.questionDialog.postLabel =
              'Estas creando un formulario y le preguntaste ' +
              question +
              ' y los compradores te responderán..';
          } else {
            this.swiperConfig.allowSlideNext = false;
          }

          if (this.isMultipleOptionsConfirmationVisible()) {
            this.webformQuestions[this.webformQuestions.length - 1].value =
              this.currentQuestion;
          }
        },
      },
      {
        name: 'checkboxClicked',
        callback: (requiredQuestion) => {
          this.currentQuestionRequired = requiredQuestion;
        },
      },
    ],
  };
  answerType = {
    component: GeneralDialogComponent,
    componentId: 'answerType',
    inputs: {
      dialogId: 'answerType',
      containerStyles: generalDialogContainerStyles,
      header: {
        styles: generalDialogHeaderStyles,
        text: '¿Como responderán?',
      },
      fields: {
        styles: {
          // paddingTop: '20px',
        },
        list: [
          {
            name: 'answerType',
            value: '',
            validators: [Validators.required],
            type: 'selection',
            selection: {
              styles: selectionStyles,
              list: [
                {
                  text: this.answerTypes['OPEN_ANSWER'],
                },
                {
                  text: this.answerTypes['SELECTION_ANSWER'],
                },
                {
                  text: this.answerTypes['CONTACT_INFO'],
                },
              ],
            },
            prop: 'text',
          },
        ],
      },
      isMultiple: false,
    },
    outputs: [
      {
        name: 'data',
        callback: (params) => {
          const { value } = params;
          if (value.answerType && value.answerType) {
            const answerType = value.answerType[0];

            if (answerType === this.answerTypes['OPEN_ANSWER']) {
              this.detectWetherOrNotToDeleteLastQuestionOfTypeMultiple();

              this.resumingCreation = false;

              this.webformQuestions.push({
                value: this.currentQuestion,
                required: this.currentQuestionRequired,
                type: 'text',
                answerTextType: 'DEFAULT',
                show: true,
                subIndex: this.webformQuestions.length,
                answerMedia: false,
              });
              this.currentQuestion = null;
              this.questionDialog.postLabel = null;
              this.currentQuestionRequired = false;
              this.currentQuestionIndex++;
              this.status = 'ASKING_FOR_ANOTHER_QUESTION';
            } else if (answerType === this.answerTypes['SELECTION_ANSWER']) {
              //When you already came back to article editor from another page
              //and you came back to the anwerType dialog
              const cameBackFromAnotherPage =
                this.resumingCreation &&
                this.webformService.webformCreatorLastDialogs.length;

              if (!cameBackFromAnotherPage) {
                this.webformQuestions.push({
                  value: this.currentQuestion,
                  required: this.currentQuestionRequired,
                  type: 'multiple',
                  answerTextType: 'DEFAULT',
                  show: true,
                  subIndex: this.webformQuestions.length,
                  answerMedia: false,
                });

                this.webformService.webformQuestions = this.webformQuestions;
                this.webformService.webformCreatorLastDialogs = this.dialogs;
                this.router.navigate([
                  'admin/webform-multiple-selection/' + this.item._id,
                ]);
              } else {
                this.dialogFlowFunctions.moveToDialogByIndex(
                  this.dialogs.length - 2
                );
              }
            } else if (answerType === this.answerTypes['CONTACT_INFO']) {
              this.resumingCreation = false;

              const contactInfoDialogAlreadyOnThePage = this.dialogs.find(
                (dialog) => dialog.componentId === 'contact-info'
              );

              this.detectWetherOrNotToDeleteLastQuestionOfTypeMultiple();

              //If you click on contact info button, when selecting the answer type, and the contact info dialog is already
              //present on the page, then it navigates to it automatically
              if (!contactInfoDialogAlreadyOnThePage) {
                this.dialogs.push(this.contactInfoDialog);
                this.contactInfoDialogVisible = true;
              }

              this.dialogFlowFunctions.moveToDialogByIndex(
                this.dialogs.length - 1
              );
            }
          }
        },
      },
    ],
  };
  contactInfoDialog: EmbeddedComponentWithId = {
    component: GeneralDialogComponent,
    componentId: 'contact-info',
    inputs: {
      dialogId: 'contact-info-answer-type',
      containerStyles: generalDialogContainerStyles,
      header: {
        styles: generalDialogHeaderStyles,
        text: '¿Cuál (es) info de contacto?',
      },
      fields: {
        styles: {
          // paddingTop: '20px',
        },
        list: [
          {
            name: 'answerType',
            value: '',
            validators: [Validators.required],
            type: 'selection',
            selection: {
              styles: selectionStyles,
              list: [
                {
                  text: this.answerTypes['FULL_NAME'],
                },
                {
                  text: this.answerTypes['EMAIL'],
                },
                {
                  text: this.answerTypes['PHONE_NUMBER'],
                },
              ],
            },
            prop: 'text',
          },
        ],
      },
      isMultiple: false,
    },
    outputs: [
      {
        name: 'data',
        callback: (params) => {
          const { value } = params;

          if (value.answerType && value.answerType) {
            const answerType = value.answerType[0];

            const options = {
              'Correo Electrónico': 'EMAIL',
              'Número de Celular (WhatsApp)': 'PHONE',
              'Nombre y Apellido': 'NAME',
            };

            if (answerType in options) {
              this.webformQuestions.push({
                value: this.currentQuestion,
                required: this.currentQuestionRequired,
                type: 'text',
                answerTextType: options[answerType],
                show: true,
                answerMedia: false,
                subIndex: this.webformQuestions.length,
              });
              this.currentQuestion = null;
              this.questionDialog.postLabel = null;
              this.currentQuestionRequired = false;
              this.currentQuestionIndex++;
              this.status = 'ASKING_FOR_ANOTHER_QUESTION';
            }
          }
        },
      },
    ],
  };
  multipleSelectionConfirmationDialog: EmbeddedComponentWithId = {
    component: WebformMultipleSelectionConfirmationComponent,
    componentId: 'confirm-multiple-selection',
    inputs: {
      optionsCreated:
        this.webformService.webformQuestions[
          this.webformService.webformQuestions.length - 1
        ]?.answerDefault.length,
      onActiveSlideCallback: (params) => {
        if (
          this.webformService.webformQuestions[
            this.webformService.webformQuestions.length - 1
          ].answerDefault.length === 0
        ) {
          this.swiperConfig.allowSlideNext = false;
        }
      },
    },
    outputs: [
      {
        name: 'editButtonClicked',
        callback: (clicked) => {
          if (clicked) {
            this.webformService.webformCreatorLastDialogs = this.dialogs;
            this.webformService.webformCreatorLastDialogs.pop();
            this.router.navigate(
              ['admin/webform-multiple-selection/' + this.item._id],
              {
                queryParams: {
                  editingQuestion: true,
                },
              }
            );
          }
        },
      },
      {
        name: 'openResponseButtonClicked',
        callback: (clicked) => {
          if (clicked) {
            this.webformService.webformQuestions[
              this.webformService.webformQuestions.length - 1
            ].type = 'multiple-text';
          } else {
            this.webformService.webformQuestions[
              this.webformService.webformQuestions.length - 1
            ].type = 'multiple';
          }
        },
      },
      {
        name: 'singleResponseButtonClicked',
        callback: (clicked) => {
          if (clicked) {
            this.webformService.webformQuestions[
              this.webformService.webformQuestions.length - 1
            ].answerLimit = 1;
          } else {
            delete this.webformService.webformQuestions[
              this.webformService.webformQuestions.length - 1
            ].answerLimit;
          }
        },
      },
    ],
  };
  newQuestionDialogs: Array<EmbeddedComponentWithId> = [
    this.questionDialog,
    this.answerType,
  ];

  dialogs: Array<EmbeddedComponentWithId> = [];
  webformQuestions: Array<QuestionInput> = [];

  constructor(
    private dialogFlowService: DialogFlowService,
    private router: Router,
    private headerService: HeaderService,
    private snackbar: MatSnackBar,
    private webformService: WebformsService
  ) {}

  ngOnInit(): void {
    if (
      (!this.webformService.webformQuestions ||
        !this.webformService.webformQuestions.length) &&
      !this.resumingCreation
    ) {
      this.dialogs = [
        {
          component: DescriptionDialogComponent,
          componentId: 'welcome',
          inputs: {
            title:
              'Hola ' +
              (this.user.name || '') +
              ', los formularios son para que el comprador te reesponda cosas que necesitas saber al vender ' +
              (this.item.name ? this.item.name : 'este producto'),
            onActiveSlideCallback: (params) => {
              this.dialogFlowService.dialogsFlows['webform-creator'][
                'welcome'
              ].swiperConfig.allowSlideNext = true;
            },
          },
          outputs: [],
          postLabel:
            'Hola ' +
            (this.user.name || '') +
            ' este formulario es para que el comprador te responda..',
          postLabelStyles: {
            minWidth: '83.7677%',
            width: '93.7677%',
          },
        },
        ...this.newQuestionDialogs,
      ];
    } else if (
      this.resumingCreation &&
      this.webformService.webformCreatorLastDialogs.length
    ) {
      this.dialogs = this.webformService.webformCreatorLastDialogs;

      const toReplaceIndex = this.dialogs.findIndex(
        (dialog) => dialog.componentId === 'answerType'
      );

      if (toReplaceIndex > -1) {
        this.dialogs[toReplaceIndex] = this.answerType;
      }

      if (
        this.dialogs[this.dialogs.length - 1].componentId !==
        'confirm-multiple-selection'
      ) {
        this.dialogs.push(this.multipleSelectionConfirmationDialog);
      } else {
        this.dialogs[this.dialogs.length - 1].inputs = {};
        this.dialogs[this.dialogs.length - 1].inputs.onActiveSlideCallback =
          this.dialogs[this.dialogs.length - 1].inputs.onActiveSlideCallback;
        this.dialogs[this.dialogs.length - 1].inputs.optionsCreated =
          this.webformService.webformQuestions[
            this.webformService.webformQuestions.length - 1
          ].answerDefault.length;
      }

      this.dialogs.push({
        component: WebformAddAnotherQuestionComponent,
        componentId: 'add-another-question',
        inputs: {},
        outputs: [
          {
            name: 'pressedButton',
            callback: (addAnotherQuestionText: string) => {
              if (addAnotherQuestionText === 'YES') {
                this.resumingCreation = false;
                this.addAnotherQuestion();
              } else {
                this.createWebformForItem();
              }
            },
          },
        ],
      });
    }

    if (
      this.webformQuestions.length === 0 &&
      this.webformService.webformQuestions.length
    ) {
      this.webformQuestions = this.webformService.webformQuestions;
    }
  }

  addAnotherQuestion() {
    this.dialogs = [];
    this.dialogs = [...this.newQuestionDialogs];
    this.dialogFlowFunctions.moveToDialogByIndex(0);
    this.status = 'SHOWING_DIALOG_FLOW';
    this.dialogFlowService.resetDialogFlow('webform-creator');
  }

  //When resuming form creation, it moves to the last dialog
  setMoveToDialog(eventData: any) {
    if (!this.resumingCreation)
      this.dialogFlowFunctions.moveToDialogByIndex = eventData;
    else {
      this.dialogFlowFunctions.moveToDialogByIndex = eventData;
      this.dialogFlowFunctions.moveToDialogByIndex(this.dialogs.length - 2);
    }
  }

  async createWebformForItem() {
    try {
      lockUI();

      const createdWebform = await this.webformService.createWebform({
        name: 'webform ' + (this.item.name ? this.item.name : this.item._id),
        description: null,
      });

      if (createdWebform) {
        await this.webformService.itemAddWebForm(
          this.item._id,
          createdWebform._id
        );

        const largeInputQuestions: QuestionInput[] =
          this.webformQuestions.filter(
            (question) => question.answerDefault?.length > 20
          );
        const smallInputQuestions: QuestionInput[] =
          this.webformQuestions.filter(
            (question) => question.answerDefault?.length <= 20
          );

        if (smallInputQuestions.length > 0) {
          await this.webformService.webformAddQuestion(
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
              console.log(topLimit, lowerLimit);
              partsInAnswerDefault.push(
                answerDefault.slice(lowerLimit, topLimit)
              );
            }
  
            question.answerDefault = partsInAnswerDefault[0];
  
            try {
              const results = await this.webformService.webformAddQuestion(
                [question],
                createdWebform._id
              );
  
              if (results && partsInAnswerDefault.length > 1) {
                for (let i = 1; i < partsInAnswerDefault.length; i++) {
                  const questionId =
                    results.questions[results.questions.length - 1]._id;
                  const answerDefault = partsInAnswerDefault[i];
                  const result =
                    await this.webformService.questionAddAnswerDefault(
                      answerDefault,
                      questionId,
                      results._id
                    );
  
                  console.log('Resultados', result);
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

        this.optionalQuestions = this.webformQuestions.reduce(
          (sum, currentQuestion) => {
            return sum + (!currentQuestion.required ? 1 : 0);
          },
          0
        );

        this.requiredQuestions = this.webformQuestions.reduce(
          (sum, currentQuestion) => {
            return sum + (currentQuestion.required ? 1 : 0);
          },
          0
        );

        console.log("Preguntas opcionales", this.optionalQuestions);
        console.log("Preguntas obligatorias", this.requiredQuestions);

        this.status = 'ENDED_CREATION';
      }

      unlockUI();

      this.status = 'ENDED_CREATION';
    } catch (error) {
      unlockUI();
      console.error(error);
    }
  }

  closeDialogFlow() {
    this.closeEvent.emit(true);
  }

  detectWetherOrNotToDeleteLastQuestionOfTypeMultiple() {
    const multipleOptionsQuestionDialogIndex = this.dialogs.findIndex(
      (dialog) => dialog.componentId === 'confirm-multiple-selection'
    );

    //If the last question the user was creating, was of the type multiple or multiple-text, and you
    //go back to the previous dialog and select another question type, then the last question gets erased
    if (multipleOptionsQuestionDialogIndex > -1) {
      this.dialogs.splice(multipleOptionsQuestionDialogIndex, 2);
      this.webformService.webformQuestions.pop();
    }
  }

  isMultipleOptionsConfirmationVisible() {
    return this.dialogs.find(
      (dialog) => dialog.componentId === 'confirm-multiple-selection'
    );
  }
}
