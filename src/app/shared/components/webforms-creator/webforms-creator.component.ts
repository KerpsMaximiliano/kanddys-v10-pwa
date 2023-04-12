import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { ItemOrder } from 'src/app/core/models/order';
import { User } from 'src/app/core/models/user';
import {
  WebformInput,
  QuestionInput,
  Webform,
  Question,
} from 'src/app/core/models/webform';
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
  @Input() webform: Webform = null;
  @Input() questionEditMode: boolean = false;
  @Input() question: Question = null;
  @Input() user: User = null;
  @Input() flowId: string = 'webform-creator';
  @Input() resumingCreation: boolean = null;
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
        flowId: this.flowId,
        dialogId: 'question',
      },
      onActiveSlideCallback: (params) => {
        const questionDialog =
          this.dialogFlowService.dialogsFlows[this.flowId]['question'];

        if (
          questionDialog?.fields &&
          questionDialog?.fields.textarea &&
          questionDialog?.fields.textarea.length
        ) {
          this.swiperConfig.allowSlideNext = true;
        } else {
          setTimeout(() => {
            this.swiperConfig.allowSlideNext = false;
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

            this.questionDialog.postLabelStyles = {
              bottom: '19.7px',
            };
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

                if (!this.webform && !this.questionEditMode) {
                  this.router.navigate([
                    'admin/webform-multiple-selection/' + this.item._id,
                  ]);
                } else if (this.questionEditMode && this.webform._id) {
                  this.webformService.webformCreatorLastDialogs = this.dialogs;

                  this.webformService.currentEditingQuestion = this.question;
                  this.router.navigate(
                    ['admin/webform-multiple-selection/' + this.item._id],
                    {
                      queryParams: {
                        updatingQuestion: true,
                        webformId: this.webform._id,
                        questionId: this.question._id,
                      },
                    }
                  );
                } else {
                  this.router.navigate(
                    ['admin/webform-multiple-selection/' + this.item._id],
                    {
                      queryParams: {
                        updatingWebform: true,
                        webformId: this.webform._id,
                      },
                    }
                  );
                }
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
        ]?.answerDefault?.length || 0,
      onActiveSlideCallback: (params) => {
        if (
          this.webformService.webformQuestions[
            this.webformService.webformQuestions.length - 1
          ].answerDefault?.length === 0
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

            if (!this.questionEditMode) {
              this.router.navigate(
                ['admin/webform-multiple-selection/' + this.item._id],
                {
                  queryParams: {
                    editingQuestion: true,
                  },
                }
              );
            } else if (this.questionEditMode && this.webform._id) {
              const options = this.webformQuestions[0].answerDefault;

              this.webformService.currentEditingQuestionChoices = options;
              this.webformService.currentEditingQuestion = this.question;

              this.router.navigate(
                ['admin/webform-multiple-selection/' + this.item._id],
                {
                  queryParams: {
                    updatingQuestion: true,
                    webformId: this.webform._id,
                    questionId: this.question._id,
                  },
                }
              );
            }
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
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private webformService: WebformsService
  ) {}

  async ngOnInit() {
    await this.executeInitProcesses();
  }

  async executeInitProcesses() {
    //When the user was editing the form, but for some reason he left the page, then we need to restart the creation process
    if (this.resumingCreation === null) {
      this.webformService.webformQuestions = [];
      this.webformQuestions = [];

      //Resets the values in the dialogs flow, so when you open the dialog flow again, it starts with all empty
      if (this.dialogFlowService.dialogsFlows[this.flowId]) {
        Object.keys(this.dialogFlowService.dialogsFlows[this.flowId]).forEach(
          (dialogId) => {
            Object.keys(
              this.dialogFlowService.dialogsFlows[this.flowId][dialogId].fields
            ).forEach((fieldKey) => {
              this.dialogFlowService.dialogsFlows[this.flowId][dialogId].fields[
                fieldKey
              ] = '';
            });
          }
        );
      }
    }

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
              this.dialogFlowService.dialogsFlows[this.flowId][
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

      if (this.questionEditMode && this.question) {
        this.dialogs[0].inputs.title =
          'Hola, aqui puedes editar las preguntas, y el tipo de respuesta que quieres que el comprador te de, pero, cambiar las preguntas hace que las estadisticas del formulario se reinicien, asi que ten cuidado';
        this.dialogs[1].inputs.textarea = new FormControl(this.question.value);
        this.questionDialog.inputs.dialogFlowConfig.flowId = this.flowId;

        this.currentQuestion = this.question.value;
      }
    } else if (
      this.resumingCreation &&
      this.webformService.webformCreatorLastDialogs?.length
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
        inputs: {
          title: !this.questionEditMode
            ? '¿Añadiras otra pregunta?'
            : '¿Estás seguro de los cambios?',
        },
        outputs: [
          {
            name: 'pressedButton',
            callback: (addAnotherQuestionText: string) => {
              if (addAnotherQuestionText === 'YES') {
                this.resumingCreation = false;
                this.addAnotherQuestionOrUpdateWebform();
              } else {
                this.createWebformOrCancelChanges();
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

  async addAnotherQuestionOrUpdateWebform() {
    if (this.webform && this.webform._id && this.questionEditMode)
      return await this.updateQuestion();

    this.dialogs = [];
    this.dialogs = [...this.newQuestionDialogs];
    this.dialogFlowFunctions.moveToDialogByIndex(0);
    this.status = 'SHOWING_DIALOG_FLOW';
    this.dialogFlowService.resetDialogFlow(this.flowId);
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

  async createWebformOrCancelChanges() {
    if (this.questionEditMode && this.question)
      return this.closeDialogFlow(true);

    if (this.webform && this.webform._id) await this.updateWebformForItem();

    if (!this.webform) {
      await this.createWebformForItem();
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

        this.webformQuestions.forEach((question) => {
          if (!question.answerDefault) {
            question.answerDefault = [];
          }
        });

        const largeInputQuestions: QuestionInput[] =
          this.webformQuestions.filter(
            (question) => question.answerDefault?.length > 20
          );
        const smallInputQuestions: QuestionInput[] =
          this.webformQuestions.filter(
            (question) =>
              question.answerDefault?.length <= 20 || !question.answerDefault
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

        console.log('Small input questions', smallInputQuestions);
        console.log('Large input questions', largeInputQuestions);

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

        this.status = 'ENDED_CREATION';
      }

      unlockUI();

      this.status = 'ENDED_CREATION';
    } catch (error) {
      unlockUI();
      console.error(error);
    }
  }

  async updateWebformForItem() {
    console.log('POR AQUI');
    try {
      this.webformQuestions.forEach((question) => {
        if (!question.answerDefault) question.answerDefault = [];
      });

      lockUI();
      const largeInputQuestions: QuestionInput[] = this.webformQuestions.filter(
        (question) => question.answerDefault?.length > 20
      );
      const smallInputQuestions: QuestionInput[] = this.webformQuestions.filter(
        (question) =>
          question.answerDefault?.length <= 20 || !question.answerDefault
      );

      if (smallInputQuestions.length > 0) {
        await this.webformService.webformAddQuestion(
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
            const results = await this.webformService.webformAddQuestion(
              [question],
              this.webform._id
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

      const optionalQuestionsInTheExistingWebform =
        this.webform.questions.reduce((sum, currentQuestion) => {
          return sum + (!currentQuestion.required ? 1 : 0);
        }, 0);

      const requiredQuestionsInTheExistingWebform =
        this.webform.questions.reduce((sum, currentQuestion) => {
          return sum + (currentQuestion.required ? 1 : 0);
        }, 0);

      this.optionalQuestions = this.webformQuestions.reduce(
        (sum, currentQuestion) => {
          return sum + (!currentQuestion.required ? 1 : 0);
        },
        optionalQuestionsInTheExistingWebform
      );

      this.requiredQuestions = this.webformQuestions.reduce(
        (sum, currentQuestion) => {
          return sum + (currentQuestion.required ? 1 : 0);
        },
        requiredQuestionsInTheExistingWebform
      );

      unlockUI();

      this.status = 'ENDED_CREATION';
    } catch (error) {
      unlockUI();
      console.error(error);
    }
  }

  /**
   * Updates a question on the webform
   * If the question has a large set of options, it splits the question options into parts and updates the question bit by bit
   */
  async updateQuestion() {
    try {
      const question = this.webformQuestions[0];

      const hasSmallSetOfOptionsOrNoneAtAll =
        question.answerDefault?.length <= 20 || !question.answerDefault;
      const hasLargeSetOfOptions = question.answerDefault?.length > 20;

      //If the question doesn't have selectable options or has 20 options or less
      if (hasSmallSetOfOptionsOrNoneAtAll) {
        question.answerDefault = !question.answerDefault
          ? []
          : question.answerDefault;

        lockUI();

        console.log('PREGUNTA', question);

        await this.webformService.webformUpdateQuestion(
          question,
          this.question._id,
          this.webform._id
        );

        unlockUI();

        this.status = 'ENDED_CREATION';
      }

      //If the question has more than 20 options
      if (hasLargeSetOfOptions) {
        const answerDefault = question.answerDefault;

        const partsInAnswerDefault = [];

        for (let i = 0; i < Math.ceil(answerDefault.length / 20); i++) {
          const topLimit = i * 20 + 20;
          const lowerLimit = i * 20;
          partsInAnswerDefault.push(answerDefault.slice(lowerLimit, topLimit));
        }

        question.answerDefault = partsInAnswerDefault[0];

        try {
          lockUI();
          const results = await this.webformService.webformUpdateQuestion(
            question,
            this.question._id,
            this.webform._id
          );

          if (results && partsInAnswerDefault.length > 1) {
            for (let i = 1; i < partsInAnswerDefault.length; i++) {
              const answerDefault = partsInAnswerDefault[i];

              const result = await this.webformService.questionAddAnswerDefault(
                answerDefault,
                this.question._id,
                this.webform._id
              );
            }

            unlockUI();

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

            this.status = 'ENDED_CREATION';
          } else unlockUI();
        } catch (error) {
          this.snackbar.open('Error al crear el formulario', 'Cerrar', {
            duration: 3000,
          });
          console.error(error);
        }
      }
    } catch (error) {
      unlockUI();
      console.error(error);
    }
  }

  closeDialogFlow(endedCreation: boolean = false) {
    this.closeEvent.emit(endedCreation);

    if (endedCreation) {
      this.status = 'SHOWING_DIALOG_FLOW';

      //Resets the values in the dialogs flow, so when you open the dialog flow again, it starts with all empty
      if (this.dialogFlowService.dialogsFlows[this.flowId]) {
        Object.keys(this.dialogFlowService.dialogsFlows[this.flowId]).forEach(
          (dialogId) => {
            Object.keys(
              this.dialogFlowService.dialogsFlows[this.flowId][dialogId].fields
            ).forEach((fieldKey) => {
              this.dialogFlowService.dialogsFlows[this.flowId][dialogId].fields[
                fieldKey
              ] = '';
            });
          }
        );
      }
    }
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
